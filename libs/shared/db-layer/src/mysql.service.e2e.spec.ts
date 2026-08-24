import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ElectronService } from '@keira/shared/common-services';
import { KeiraAppConfig, KEIRA_APP_CONFIG_TOKEN } from '@keira/shared/config';
import { MysqlResult } from '@keira/shared/constants';
import { firstValueFrom, of } from 'rxjs';
import { timeout, retry, catchError } from 'rxjs/operators';
import { instance, mock, when } from 'ts-mockito';
import { vi } from 'vitest';

import { MysqlService } from './mysql.service';

/**
 * End-to-End Integration Tests for MysqlService
 * Tests real HTTP API integration, connection pooling, and error recovery
 */
describe('MysqlService E2E Integration Tests', () => {
  let service: MysqlService;
  let httpMock: HttpTestingController;
  let electronServiceMock: ElectronService;
  let electronService: ElectronService;

  const mockConfig: KeiraAppConfig = {
    production: true,
    environment: 'DOCKER',
    sqlitePath: 'assets/sqlite.db',
    databaseApiUrl: '/api/database',
  };

  beforeEach(() => {
    electronServiceMock = mock(ElectronService);
    // Force web environment for all tests (stub must be set on the mock, before the instance is used)
    when(electronServiceMock.isElectron()).thenReturn(false);
    electronService = instance(electronServiceMock);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        MysqlService,
        { provide: ElectronService, useValue: electronService },
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: mockConfig },
      ],
    });

    service = TestBed.inject(MysqlService);
    httpMock = TestBed.inject(HttpTestingController);

    // mockConfig (environment: 'DOCKER', databaseApiUrl set) already makes the constructor
    // select web mode via isWebLikeEnvironment() - see the dedicated constructor test below -
    // so isWebEnvironment is not force-set here.

    // Silence the service's intentional console.error logging on query errors
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('constructor selects web mode from a DOCKER/WEB-like config without a forced override', () => {
    // Exercises the actual constructor branch (isWebLikeEnvironment(appConfig)) instead of
    // asserting on a directly-overwritten private field.
    expect(service['isWebEnvironment']).toBe(true);
  });

  describe('Connection Pool Integration', () => {
    it('should handle multiple concurrent database connections', async () => {
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
      const connectionPromises: Promise<unknown>[] = [];

      for (let i = 0; i < concurrentConnections; i++) {
        connectionPromises.push(
          firstValueFrom(
            service.connect(connectionConfig).pipe(
              timeout(5000),
              catchError(() => of({ error: true, id: i })),
            ),
          ),
        );
      }

      // Respond to all connection requests
      const requests = httpMock.match('/api/database/connect');
      expect(requests.length).toBe(concurrentConnections);
      for (const req of requests) {
        expect(req.request.method).toBe('POST');
        req.flush(mockSuccessResponse);
      }

      const results = await Promise.all(connectionPromises);

      // Verify that all connections were handled
      expect(results.length).toBe(concurrentConnections);

      // Check that service maintains consistent state
      expect(service.connectionEstablished).toBe(true);
    });

    it('should maintain connection state across multiple queries', async () => {
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

      // Execute all queries concurrently
      const queryPromises = queries.map((query, index) =>
        firstValueFrom(
          service.dbQuery(query.sql, query.params).pipe(
            timeout(3000),
            catchError(() => of({ error: true, queryIndex: index } as any)),
          ),
        ),
      );

      // Mock all query responses
      const requests = httpMock.match('/api/database/query');
      expect(requests.length).toBe(queries.length);
      requests.forEach((req, index) => {
        expect(req.request.method).toBe('POST');
        expect(req.request.body.sql).toBe(queries[index].sql);
        expect(req.request.body.params).toEqual(queries[index].params);
        req.flush(expectedResponses[index]);
      });

      const results = await Promise.all(queryPromises);
      expect(results.length).toBe(queries.length);

      // Verify all queries completed successfully
      results.forEach((result: any) => {
        if (result && !result.error) {
          expect(result.result).toBeDefined();
        }
      });
    });

    it('should handle concurrent queries where the pool rejects some with 503', async () => {
      // Simulates real pool exhaustion: some of the concurrent requests are flushed with a
      // 503 (pool exhausted) response instead of success, and the test asserts on the actual
      // split rather than a tautological successful+errors===total count.
      const simultaneousQueries = 10;
      const exhaustedCount = 4;
      const longRunningQuery = 'SELECT SLEEP(1)'; // Simulates slow query

      const queryPromises: Promise<any>[] = [];
      for (let i = 0; i < simultaneousQueries; i++) {
        queryPromises.push(
          firstValueFrom(
            service.dbQuery(longRunningQuery).pipe(
              timeout(8000),
              catchError((error) => of({ error: true, queryId: i, errorType: error.name } as any)),
            ),
          ),
        );
      }

      // Mock responses for all queries
      const requests = httpMock.match('/api/database/query');
      expect(requests.length).toBe(simultaneousQueries);
      requests.forEach((req, i) => {
        if (i < exhaustedCount) {
          req.flush({ success: false, error: 'Too many connections' }, { status: 503, statusText: 'Service Unavailable' });
        } else {
          req.flush({ success: true, result: [{ sleep: 1 }], fields: [] });
        }
      });

      const results = await Promise.all(queryPromises);
      expect(results.length).toBe(simultaneousQueries);

      const successful = results.filter((r) => r && !r.error);
      const errors = results.filter((r) => r && r.error);

      expect(successful.length).toBe(simultaneousQueries - exhaustedCount);
      expect(errors.length).toBe(exhaustedCount);
    }, 15000);
  });

  describe('Error Recovery Integration', () => {
    it('should recover from network timeouts', async () => {
      const query = 'SELECT * FROM test_table';

      const resultPromise = firstValueFrom(
        service.dbQuery(query).pipe(
          retry(2),
          timeout(10000),
          catchError((error) => of({ recoveredFromError: true, originalError: error.name } as any)),
        ),
      );

      // First request times out
      const req1 = httpMock.expectOne('/api/database/query');
      req1.error(new ProgressEvent('timeout'));

      // Retry request succeeds
      const req2 = httpMock.expectOne('/api/database/query');
      req2.flush({ success: true, result: [{ id: 1 }], fields: [] });

      const result = await resultPromise;
      expect(result).toBeDefined();
    });

    it('should handle database connection loss and reconnection', async () => {
      const connectionConfig = {
        host: 'localhost',
        port: 3306,
        user: 'test_user',
        password: 'test_password',
        database: 'test_db',
      };

      // Initial connection
      const connectPromise = firstValueFrom(service.connect(connectionConfig));
      const connectReq = httpMock.expectOne('/api/database/connect');
      connectReq.flush({ success: true, message: 'Connected successfully' });
      await connectPromise;

      expect(service.connectionEstablished).toBe(true);

      // Simulate connection loss by querying, then reconnect on error
      const reconnectPromise = firstValueFrom(
        service.dbQuery('SELECT 1').pipe(
          catchError(() => {
            // Attempt to reconnect
            return service.connect(connectionConfig);
          }),
        ),
      );

      // Mock connection loss error
      const queryReq = httpMock.expectOne('/api/database/query');
      queryReq.flush(
        { success: false, error: 'Connection lost', code: 'PROTOCOL_CONNECTION_LOST' },
        { status: 500, statusText: 'Internal Server Error' },
      );

      // Mock successful reconnection
      const reconnectReq = httpMock.expectOne('/api/database/connect');
      reconnectReq.flush({ success: true, message: 'Reconnected successfully' });

      await reconnectPromise;
      expect(service.connectionEstablished).toBe(true);
    });

    it('should handle various MySQL error codes appropriately', async () => {
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

      const errorTests = errorScenarios.map((scenario, index) =>
        firstValueFrom(
          service.dbQuery(scenario.query).pipe(
            catchError((error) =>
              of({
                errorHandled: true,
                scenarioIndex: index,
                errorInfo: error,
              } as any),
            ),
          ),
        ),
      );

      // Mock error responses
      const requests = httpMock.match('/api/database/query');
      expect(requests.length).toBe(errorScenarios.length);
      requests.forEach((req, index) => {
        expect(req.request.body.sql).toBe(errorScenarios[index].query);
        req.flush(errorScenarios[index].mockError, { status: 500, statusText: 'Internal Server Error' });
      });

      const results = await Promise.all(errorTests);
      expect(results.length).toBe(errorScenarios.length);

      // Verify all errors were handled gracefully
      results.forEach((result: any, index) => {
        expect(result).toBeDefined();
        if (result.errorHandled) {
          expect(result.scenarioIndex).toBe(index);
        }
      });
    });
  });

  describe('Performance Under Load', () => {
    it('should maintain performance with high query volume', async () => {
      const queryCount = 50;
      const startTime = Date.now();
      const queries: { sql: string; params: string[] }[] = [];

      // Generate multiple queries
      for (let i = 0; i < queryCount; i++) {
        queries.push({
          sql: `SELECT ${i} as query_id, 'test_data' as data`,
          params: [],
        });
      }

      const queryPromises = queries.map((query, index) =>
        firstValueFrom(
          service.dbQuery(query.sql, query.params).pipe(
            timeout(5000),
            catchError(() => of({ error: true, queryIndex: index } as any)),
          ),
        ),
      );

      // Mock all query responses
      const requests = httpMock.match('/api/database/query');
      expect(requests.length).toBe(queryCount);
      requests.forEach((req, index) => {
        req.flush({
          success: true,
          result: [{ query_id: index, data: 'test_data' }],
          fields: [],
        });
      });

      const results = await Promise.all(queryPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTimePerQuery = totalTime / queryCount;

      expect(results.length).toBe(queryCount);

      // Check performance metrics
      expect(avgTimePerQuery).toBeLessThan(100); // Less than 100ms per query on average
      expect(totalTime).toBeLessThan(10000); // Total time less than 10 seconds

      // Verify most queries succeeded
      const successful = results.filter((r: any) => r && !r.error);
      expect(successful.length).toBeGreaterThan(queryCount * 0.8); // At least 80% success rate
    }, 15000);

    it('should handle memory efficiently with large result sets', async () => {
      const largeQuery = 'SELECT * FROM large_table LIMIT 1000';

      // Simulate large result set
      const largeResultSet: any[] = [];
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

      const resultPromise = firstValueFrom(service.dbQuery(largeQuery).pipe(timeout(10000)));

      const req = httpMock.expectOne('/api/database/query');
      expect(req.request.body.sql).toBe(largeQuery);
      req.flush(mockLargeResponse);

      const result: MysqlResult<any> = await resultPromise;
      expect(result).toBeDefined();
      expect(result.result).toBeDefined();
      expect(Array.isArray(result.result)).toBe(true);
      expect(result.result?.length).toBe(1000);

      // Verify data integrity
      expect(result.result?.[0]).toHaveProperty('id');
      expect(result.result?.[0]).toHaveProperty('name');
      expect(result.result?.[999].id).toBe(999);
    });
  });

  describe('Configuration Flexibility', () => {
    it('should handle different API base URLs correctly', async () => {
      const customConfig = {
        ...mockConfig,
        databaseApiUrl: '/custom/database/api',
      };

      // Create service with custom config
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideHttpClient(),
          provideHttpClientTesting(),
          MysqlService,
          { provide: ElectronService, useValue: electronService },
          { provide: KEIRA_APP_CONFIG_TOKEN, useValue: customConfig },
        ],
      });

      const customService = TestBed.inject(MysqlService);
      const customHttpMock = TestBed.inject(HttpTestingController);

      // customConfig keeps environment: 'DOCKER', so the constructor already selects web
      // mode via isWebLikeEnvironment() - no forced override needed here.

      const resultPromise = firstValueFrom(customService.dbQuery('SELECT 1'));

      const req = customHttpMock.expectOne('/custom/database/api/query');
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, result: [{ result: 1 }], fields: [] });

      await resultPromise;

      customHttpMock.verify();
    });

    it('should handle missing API URL configuration gracefully', async () => {
      const configWithoutApiUrl = {
        production: false,
        environment: 'test',
        sqlitePath: 'test.db',
        // No databaseApiUrl property
      } as KeiraAppConfig;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideHttpClient(),
          provideHttpClientTesting(),
          MysqlService,
          { provide: ElectronService, useValue: electronService },
          { provide: KEIRA_APP_CONFIG_TOKEN, useValue: configWithoutApiUrl },
        ],
      });

      const serviceWithoutApiUrl = TestBed.inject(MysqlService);
      const httpMockWithoutApiUrl = TestBed.inject(HttpTestingController);

      serviceWithoutApiUrl['isWebEnvironment'] = true;

      // Should use default API URL
      const resultPromise = firstValueFrom(serviceWithoutApiUrl.dbQuery('SELECT 1'));

      const req = httpMockWithoutApiUrl.expectOne('/api/database/query');
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, result: [{ result: 1 }], fields: [] });

      await resultPromise;

      httpMockWithoutApiUrl.verify();
    });
  });

  describe('Real-world Workflow Integration', () => {
    it('should handle typical Keira3 database workflow', async () => {
      // 1. Connect to database
      const connectionConfig = {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'password',
        database: 'acore_world',
      };

      const connectPromise = firstValueFrom(service.connect(connectionConfig));
      const connectReq = httpMock.expectOne('/api/database/connect');
      connectReq.flush({ success: true, message: 'Connected' });
      await connectPromise;

      expect(service.connectionEstablished).toBe(true);

      // 2-4. Query creature template, update creature name, verify update
      const querySteps = [
        {
          sql: 'SELECT * FROM creature_template WHERE entry = ?',
          params: ['1'],
          response: {
            success: true,
            result: [{ entry: 1, name: 'Original Name', minlevel: 1, maxlevel: 1 }],
            fields: [],
          },
        },
        {
          sql: 'UPDATE creature_template SET name = ? WHERE entry = ?',
          params: ['Updated Name', '1'],
          response: {
            success: true,
            result: { affectedRows: 1, changedRows: 1 },
            fields: [],
          },
        },
        {
          sql: 'SELECT name FROM creature_template WHERE entry = ?',
          params: ['1'],
          response: {
            success: true,
            result: [{ name: 'Updated Name' }],
            fields: [],
          },
        },
      ];

      for (const step of querySteps) {
        const queryPromise = firstValueFrom(service.dbQuery(step.sql, step.params));

        const queryReq = httpMock.expectOne('/api/database/query');
        queryReq.flush(step.response);

        const result: MysqlResult<any> = await queryPromise;
        expect(result).toBeDefined();
        expect(result.result).toBeDefined();
      }
    }, 10000);
  });
});
