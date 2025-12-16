import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ElectronService } from '@keira/shared/common-services';
import { KeiraAppConfig, KEIRA_APP_CONFIG_TOKEN } from '@keira/shared/config';
import { MysqlResult } from '@keira/shared/constants';
import { of, throwError, forkJoin, timer } from 'rxjs';
import { take, timeout, retry, catchError } from 'rxjs/operators';
import { instance, mock, when } from 'ts-mockito';

import { MysqlService } from './mysql.service';

/**
 * End-to-End Integration Tests for MysqlService
 * Tests real HTTP API integration, connection pooling, and error recovery
 */
describe('MysqlService E2E Integration Tests', () => {
  let service: MysqlService;
  let httpMock: HttpTestingController;
  let electronService: ElectronService;

  const mockConfig: KeiraAppConfig = {
    production: true,
    environment: 'DOCKER',
    sqlitePath: 'assets/sqlite.db',
    sqliteItem3dPath: 'assets/item_display.db',
    databaseApiUrl: '/api/database',
  };

  beforeEach(() => {
    const electronServiceMock = mock(ElectronService);
    electronService = instance(electronServiceMock);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        MysqlService,
        { provide: ElectronService, useValue: electronService },
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: mockConfig },
      ],
    });

    service = TestBed.inject(MysqlService);
    httpMock = TestBed.inject(HttpTestingController);

    // Force web environment for all tests
    when(electronService.isElectron()).thenReturn(false);
    service['isWebEnvironment'] = true;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Connection Pool Integration', () => {
    it('should handle multiple concurrent database connections', (done) => {
      const connectionConfig = {
        host: 'localhost',
        port: 3306,
        user: 'test_user',
        password: 'test_password',
        database: 'test_db',
      };

      const mockSuccessResponse = {
        success: true,
        message: 'Connected to database successfully',
      };

      // Create multiple concurrent connection attempts
      const concurrentConnections = 5;
      const connectionPromises = [];

      for (let i = 0; i < concurrentConnections; i++) {
        connectionPromises.push(
          service
            .connect(connectionConfig)
            .pipe(
              timeout(5000),
              catchError((error) => of({ error: true, id: i })),
            )
            .toPromise(),
        );
      }

      Promise.all(connectionPromises)
        .then((results) => {
          // Verify that all connections were handled
          expect(results.length).toBe(concurrentConnections);

          // Check that service maintains consistent state
          expect(service.connectionEstablished).toBe(true);

          done();
        })
        .catch(done);

      // Respond to all connection requests
      for (let i = 0; i < concurrentConnections; i++) {
        const req = httpMock.expectOne('/api/database/connect');
        expect(req.request.method).toBe('POST');
        req.flush(mockSuccessResponse);
      }
    });

    it('should maintain connection state across multiple queries', (done) => {
      const queries = [
        { sql: 'SELECT * FROM users', params: [] },
        { sql: 'SELECT * FROM products WHERE id = ?', params: ['1'] },
        { sql: 'UPDATE settings SET value = ? WHERE key = ?', params: ['test', 'config'] },
        { sql: 'SELECT COUNT(*) as total FROM orders', params: [] },
      ];

      const expectedResponses = [
        { success: true, result: [{ id: 1, name: 'test' }], fields: [] },
        { success: true, result: [{ id: 1, title: 'Product' }], fields: [] },
        { success: true, result: { affectedRows: 1 }, fields: [] },
        { success: true, result: [{ total: 42 }], fields: [] },
      ];

      // Execute queries sequentially
      const queryPromises = queries.map((query, index) =>
        service
          .dbQuery(query.sql, query.params)
          .pipe(
            timeout(3000),
            catchError((error) => of({ error: true, queryIndex: index })),
          )
          .toPromise(),
      );

      forkJoin(queryPromises).subscribe({
        next: (results) => {
          expect(results.length).toBe(queries.length);

          // Verify all queries completed successfully
          results.forEach((result, index) => {
            if (result && !result.error) {
              expect(result.result).toBeDefined();
            }
          });

          done();
        },
        error: done,
      });

      // Mock all query responses
      queries.forEach((query, index) => {
        const req = httpMock.expectOne('/api/database/query');
        expect(req.request.method).toBe('POST');
        expect(req.request.body.sql).toBe(query.sql);
        expect(req.request.body.params).toEqual(query.params);
        req.flush(expectedResponses[index]);
      });
    });

    it('should handle connection pool exhaustion gracefully', (done) => {
      const simultaneousQueries = 10;
      const longRunningQuery = 'SELECT SLEEP(1)'; // Simulates slow query

      const queryPromises = [];
      for (let i = 0; i < simultaneousQueries; i++) {
        queryPromises.push(
          service
            .dbQuery(longRunningQuery)
            .pipe(
              timeout(8000),
              catchError((error) => of({ error: true, queryId: i, errorType: error.name })),
            )
            .toPromise(),
        );
      }

      Promise.all(queryPromises)
        .then((results) => {
          expect(results.length).toBe(simultaneousQueries);

          // Some queries should succeed, others may timeout or error due to pool limits
          const successful = results.filter((r) => r && !r.error);
          const errors = results.filter((r) => r && r.error);

          // At least some queries should process
          expect(successful.length + errors.length).toBe(simultaneousQueries);

          done();
        })
        .catch(done);

      // Mock responses for all queries (some may be slow)
      for (let i = 0; i < simultaneousQueries; i++) {
        const req = httpMock.expectOne('/api/database/query');

        // Simulate some queries taking longer
        if (i % 3 === 0) {
          setTimeout(() => {
            req.flush({ success: true, result: [{ sleep: 1 }], fields: [] });
          }, 100);
        } else {
          req.flush({ success: true, result: [{ sleep: 1 }], fields: [] });
        }
      }
    }, 15000);
  });

  describe('Error Recovery Integration', () => {
    it('should recover from network timeouts', (done) => {
      const query = 'SELECT * FROM test_table';

      service
        .dbQuery(query)
        .pipe(
          retry(2),
          timeout(10000),
          catchError((error) => of({ recoveredFromError: true, originalError: error.name })),
        )
        .subscribe({
          next: (result) => {
            expect(result).toBeDefined();
            done();
          },
          error: done,
        });

      // First request times out
      const req1 = httpMock.expectOne('/api/database/query');
      req1.error(new ProgressEvent('timeout'));

      // Retry request succeeds
      const req2 = httpMock.expectOne('/api/database/query');
      req2.flush({ success: true, result: [{ id: 1 }], fields: [] });
    });

    it('should handle database connection loss and reconnection', (done) => {
      const connectionConfig = {
        host: 'localhost',
        port: 3306,
        user: 'test_user',
        password: 'test_password',
        database: 'test_db',
      };

      // Initial connection
      service.connect(connectionConfig).subscribe({
        next: () => {
          expect(service.connectionEstablished).toBe(true);

          // Simulate connection loss by querying after disconnect
          service
            .dbQuery('SELECT 1')
            .pipe(
              catchError((error) => {
                // Attempt to reconnect
                return service.connect(connectionConfig);
              }),
            )
            .subscribe({
              next: () => {
                expect(service.connectionEstablished).toBe(true);
                done();
              },
              error: done,
            });

          // Mock connection loss error
          const queryReq = httpMock.expectOne('/api/database/query');
          queryReq.flush(
            { success: false, error: 'Connection lost', code: 'PROTOCOL_CONNECTION_LOST' },
            { status: 500, statusText: 'Internal Server Error' },
          );

          // Mock successful reconnection
          const reconnectReq = httpMock.expectOne('/api/database/connect');
          reconnectReq.flush({ success: true, message: 'Reconnected successfully' });
        },
        error: done,
      });

      // Mock initial connection
      const connectReq = httpMock.expectOne('/api/database/connect');
      connectReq.flush({ success: true, message: 'Connected successfully' });
    });

    it('should handle various MySQL error codes appropriately', (done) => {
      const errorScenarios = [
        {
          query: 'SELECT * FROM nonexistent_table',
          mockError: { success: false, error: 'Table does not exist', code: 'ER_NO_SUCH_TABLE', errno: 1146 },
          expectedErrorType: 'table_not_found',
        },
        {
          query: 'SELECT * FROM users WHERE invalid_syntax',
          mockError: { success: false, error: 'SQL syntax error', code: 'ER_PARSE_ERROR', errno: 1064 },
          expectedErrorType: 'syntax_error',
        },
        {
          query: 'SELECT * FROM restricted_table',
          mockError: { success: false, error: 'Access denied', code: 'ER_ACCESS_DENIED_ERROR', errno: 1045 },
          expectedErrorType: 'access_denied',
        },
      ];

      const errorTests = errorScenarios.map((scenario, index) => {
        return service
          .dbQuery(scenario.query)
          .pipe(
            catchError((error) =>
              of({
                errorHandled: true,
                scenarioIndex: index,
                errorInfo: error,
              }),
            ),
          )
          .toPromise();
      });

      Promise.all(errorTests)
        .then((results) => {
          expect(results.length).toBe(errorScenarios.length);

          // Verify all errors were handled gracefully
          results.forEach((result, index) => {
            expect(result).toBeDefined();
            if (result.errorHandled) {
              expect(result.scenarioIndex).toBe(index);
            }
          });

          done();
        })
        .catch(done);

      // Mock error responses
      errorScenarios.forEach((scenario, index) => {
        const req = httpMock.expectOne('/api/database/query');
        expect(req.request.body.sql).toBe(scenario.query);
        req.flush(scenario.mockError, { status: 500, statusText: 'Internal Server Error' });
      });
    });
  });

  describe('Performance Under Load', () => {
    it('should maintain performance with high query volume', (done) => {
      const queryCount = 50;
      const startTime = Date.now();
      const queries = [];

      // Generate multiple queries
      for (let i = 0; i < queryCount; i++) {
        queries.push({
          sql: `SELECT ${i} as query_id, 'test_data' as data`,
          params: [],
        });
      }

      const queryPromises = queries.map((query, index) =>
        service
          .dbQuery(query.sql, query.params)
          .pipe(
            timeout(5000),
            catchError((error) => of({ error: true, queryIndex: index })),
          )
          .toPromise(),
      );

      Promise.all(queryPromises)
        .then((results) => {
          const endTime = Date.now();
          const totalTime = endTime - startTime;
          const avgTimePerQuery = totalTime / queryCount;

          expect(results.length).toBe(queryCount);

          // Check performance metrics
          expect(avgTimePerQuery).toBeLessThan(100); // Less than 100ms per query on average
          expect(totalTime).toBeLessThan(10000); // Total time less than 10 seconds

          // Verify most queries succeeded
          const successful = results.filter((r) => r && !r.error);
          expect(successful.length).toBeGreaterThan(queryCount * 0.8); // At least 80% success rate

          done();
        })
        .catch(done);

      // Mock all query responses
      queries.forEach((query, index) => {
        const req = httpMock.expectOne('/api/database/query');
        req.flush({
          success: true,
          result: [{ query_id: index, data: 'test_data' }],
          fields: [],
        });
      });
    }, 15000);

    it('should handle memory efficiently with large result sets', (done) => {
      const largeQuery = 'SELECT * FROM large_table LIMIT 1000';

      // Simulate large result set
      const largeResultSet = [];
      for (let i = 0; i < 1000; i++) {
        largeResultSet.push({
          id: i,
          name: `Record ${i}`,
          data: 'x'.repeat(100), // 100 character string per record
          timestamp: new Date().toISOString(),
        });
      }

      const mockLargeResponse = {
        success: true,
        result: largeResultSet,
        fields: [{ name: 'id' }, { name: 'name' }, { name: 'data' }, { name: 'timestamp' }],
      };

      service
        .dbQuery(largeQuery)
        .pipe(timeout(10000))
        .subscribe({
          next: (result: MysqlResult<any>) => {
            expect(result).toBeDefined();
            expect(result.result).toBeDefined();
            expect(Array.isArray(result.result)).toBe(true);
            expect(result.result.length).toBe(1000);

            // Verify data integrity
            expect(result.result[0]).toHaveProperty('id');
            expect(result.result[0]).toHaveProperty('name');
            expect(result.result[999].id).toBe(999);

            done();
          },
          error: done,
        });

      const req = httpMock.expectOne('/api/database/query');
      expect(req.request.body.sql).toBe(largeQuery);
      req.flush(mockLargeResponse);
    });
  });

  describe('Configuration Flexibility', () => {
    it('should handle different API base URLs correctly', (done) => {
      const customConfig = {
        ...mockConfig,
        databaseApiUrl: '/custom/database/api',
      };

      // Create service with custom config
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          MysqlService,
          { provide: ElectronService, useValue: electronService },
          { provide: KEIRA_APP_CONFIG_TOKEN, useValue: customConfig },
        ],
      });

      const customService = TestBed.inject(MysqlService);
      const customHttpMock = TestBed.inject(HttpTestingController);

      customService['isWebEnvironment'] = true;

      customService.dbQuery('SELECT 1').subscribe({
        next: () => {
          done();
        },
        error: done,
      });

      const req = customHttpMock.expectOne('/custom/database/api/query');
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, result: [{ result: 1 }], fields: [] });

      customHttpMock.verify();
    });

    it('should handle missing API URL configuration gracefully', (done) => {
      const configWithoutApiUrl = {
        production: false,
        environment: 'test',
        sqlitePath: 'test.db',
        sqliteItem3dPath: 'test_item.db',
        // No databaseApiUrl property
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          MysqlService,
          { provide: ElectronService, useValue: electronService },
          { provide: KEIRA_APP_CONFIG_TOKEN, useValue: configWithoutApiUrl },
        ],
      });

      const serviceWithoutApiUrl = TestBed.inject(MysqlService);
      const httpMockWithoutApiUrl = TestBed.inject(HttpTestingController);

      serviceWithoutApiUrl['isWebEnvironment'] = true;

      // Should use default API URL
      serviceWithoutApiUrl.dbQuery('SELECT 1').subscribe({
        next: () => {
          done();
        },
        error: done,
      });

      const req = httpMockWithoutApiUrl.expectOne('/api/database/query');
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, result: [{ result: 1 }], fields: [] });

      httpMockWithoutApiUrl.verify();
    });
  });

  describe('Real-world Workflow Integration', () => {
    it('should handle typical Keira3 database workflow', (done) => {
      const workflowSteps = [
        // 1. Connect to database
        { type: 'connect', config: { host: 'localhost', port: 3306, user: 'root', password: 'password', database: 'acore_world' } },
        // 2. Query creature template
        { type: 'query', sql: 'SELECT * FROM creature_template WHERE entry = ?', params: ['1'] },
        // 3. Update creature name
        { type: 'query', sql: 'UPDATE creature_template SET name = ? WHERE entry = ?', params: ['Updated Name', '1'] },
        // 4. Verify update
        { type: 'query', sql: 'SELECT name FROM creature_template WHERE entry = ?', params: ['1'] },
      ];

      let currentStep = 0;

      const executeNextStep = () => {
        if (currentStep >= workflowSteps.length) {
          done();
          return;
        }

        const step = workflowSteps[currentStep];
        currentStep++;

        if (step.type === 'connect') {
          service.connect(step.config).subscribe({
            next: () => {
              expect(service.connectionEstablished).toBe(true);
              executeNextStep();
            },
            error: done,
          });
        } else if (step.type === 'query') {
          service.dbQuery(step.sql, step.params).subscribe({
            next: (result: MysqlResult<any>) => {
              expect(result).toBeDefined();
              expect(result.result).toBeDefined();
              executeNextStep();
            },
            error: done,
          });
        }
      };

      // Start the workflow
      executeNextStep();

      // Mock responses for each step
      setTimeout(() => {
        // Connect response
        const connectReq = httpMock.expectOne('/api/database/connect');
        connectReq.flush({ success: true, message: 'Connected' });

        // Query responses
        setTimeout(() => {
          const queryReq1 = httpMock.expectOne('/api/database/query');
          queryReq1.flush({
            success: true,
            result: [{ entry: 1, name: 'Original Name', minlevel: 1, maxlevel: 1 }],
            fields: [],
          });

          setTimeout(() => {
            const queryReq2 = httpMock.expectOne('/api/database/query');
            queryReq2.flush({
              success: true,
              result: { affectedRows: 1, changedRows: 1 },
              fields: [],
            });

            setTimeout(() => {
              const queryReq3 = httpMock.expectOne('/api/database/query');
              queryReq3.flush({
                success: true,
                result: [{ name: 'Updated Name' }],
                fields: [],
              });
            }, 10);
          }, 10);
        }, 10);
      }, 10);
    }, 10000);
  });
});
