import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ElectronService } from '@keira/shared/common-services';
import { KeiraAppConfig, KEIRA_APP_CONFIG_TOKEN } from '@keira/shared/config';
import { MysqlResult } from '@keira/shared/constants';
import { of, throwError } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

import { MysqlService } from './mysql.service';

describe('MysqlService Integration Tests', () => {
  let service: MysqlService;
  let httpMock: HttpTestingController;
  let electronService: ElectronService;
  let config: KeiraAppConfig;

  const mockConfig = {
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
    config = TestBed.inject(KEIRA_APP_CONFIG_TOKEN);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Web Environment Integration Tests', () => {
    beforeEach(() => {
      // Force web environment
      when(electronService.isElectron()).thenReturn(false);
      service['isWebEnvironment'] = true;
    });

    describe('Database Connection Integration', () => {
      it('should successfully connect to database via HTTP API', (done) => {
        const connectionConfig = {
          host: 'localhost',
          port: 3306,
          user: 'root',
          password: 'password',
          database: 'test_db',
        };

        const mockResponse = {
          success: true,
          message: 'Connected to database successfully',
        };

        service.connect(connectionConfig).subscribe({
          next: (result) => {
            expect(service.connectionEstablished).toBe(true);
            done();
          },
          error: done.fail,
        });

        const req = httpMock.expectOne('/api/database/connect');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ config: connectionConfig });
        req.flush(mockResponse);
      });

      it('should handle connection failure via HTTP API', (done) => {
        const connectionConfig = {
          host: 'invalid-host',
          port: 3306,
          user: 'root',
          password: 'wrong-password',
          database: 'test_db',
        };

        const mockErrorResponse = {
          success: false,
          error: 'Access denied for user',
          code: 'ER_ACCESS_DENIED_ERROR',
          errno: 1045,
          sqlState: '28000',
        };

        service.connect(connectionConfig).subscribe({
          next: () => done.fail('Should have failed'),
          error: (error) => {
            expect(service.connectionEstablished).toBe(false);
            done();
          },
        });

        const req = httpMock.expectOne('/api/database/connect');
        expect(req.request.method).toBe('POST');
        req.flush(mockErrorResponse, { status: 500, statusText: 'Internal Server Error' });
      });

      it('should get connection state via method call', () => {
        const state = service.getConnectionState();
        expect(state).toBeDefined();
        expect(typeof state).toBe('string');
      });
    });

    describe('Query Execution Integration', () => {
      it('should execute SELECT query via HTTP API', (done) => {
        const query = 'SELECT * FROM creature_template WHERE entry = ?';
        const params = ['1'];

        const mockQueryResponse = {
          success: true,
          result: [{ entry: 1, name: 'Test Creature', minlevel: 1, maxlevel: 1 }],
          fields: [{ name: 'entry' }, { name: 'name' }, { name: 'minlevel' }, { name: 'maxlevel' }],
        };

        service.dbQuery(query, params).subscribe({
          next: (result: MysqlResult<any>) => {
            expect(result.result).toEqual(mockQueryResponse.result);
            expect(result.fields).toEqual(mockQueryResponse.fields);
            done();
          },
          error: done.fail,
        });

        const req = httpMock.expectOne('/api/database/query');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ sql: query, params });
        req.flush(mockQueryResponse);
      });

      it('should handle query execution errors via HTTP API', (done) => {
        const query = 'SELECT * FROM non_existent_table';
        const params: string[] = [];

        const mockErrorResponse = {
          success: false,
          error: "Table 'test_db.non_existent_table' doesn't exist",
          code: 'ER_NO_SUCH_TABLE',
          errno: 1146,
          sqlState: '42S02',
        };

        service.dbQuery(query, params).subscribe({
          next: () => done.fail('Should have failed'),
          error: (error) => {
            expect(error).toBeDefined();
            done();
          },
        });

        const req = httpMock.expectOne('/api/database/query');
        expect(req.request.method).toBe('POST');
        req.flush(mockErrorResponse, { status: 500, statusText: 'Internal Server Error' });
      });

      it('should execute INSERT query via HTTP API', (done) => {
        const query = 'INSERT INTO test_table (name, value) VALUES (?, ?)';
        const params = ['test', '123'];

        const mockInsertResponse = {
          success: true,
          result: {
            affectedRows: 1,
            insertId: 42,
            warningStatus: 0,
          },
          fields: [],
        };

        service.dbQuery(query, params).subscribe({
          next: (result: MysqlResult<any>) => {
            expect(result.result.affectedRows).toBe(1);
            expect(result.result.insertId).toBe(42);
            done();
          },
          error: done.fail,
        });

        const req = httpMock.expectOne('/api/database/query');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ sql: query, params });
        req.flush(mockInsertResponse);
      });

      it('should execute UPDATE query via HTTP API', (done) => {
        const query = 'UPDATE creature_template SET name = ? WHERE entry = ?';
        const params = ['Updated Name', '1'];

        const mockUpdateResponse = {
          success: true,
          result: {
            affectedRows: 1,
            changedRows: 1,
            warningStatus: 0,
          },
          fields: [],
        };

        service.dbQuery(query, params).subscribe({
          next: (result: MysqlResult<any>) => {
            expect(result.result.affectedRows).toBe(1);
            expect(result.result.changedRows).toBe(1);
            done();
          },
          error: done.fail,
        });

        const req = httpMock.expectOne('/api/database/query');
        expect(req.request.method).toBe('POST');
        req.flush(mockUpdateResponse);
      });

      it('should execute DELETE query via HTTP API', (done) => {
        const query = 'DELETE FROM test_table WHERE id = ?';
        const params = ['1'];

        const mockDeleteResponse = {
          success: true,
          result: {
            affectedRows: 1,
            warningStatus: 0,
          },
          fields: [],
        };

        service.dbQuery(query, params).subscribe({
          next: (result: MysqlResult<any>) => {
            expect(result.result.affectedRows).toBe(1);
            done();
          },
          error: done.fail,
        });

        const req = httpMock.expectOne('/api/database/query');
        expect(req.request.method).toBe('POST');
        req.flush(mockDeleteResponse);
      });
    });

    describe('Error Handling Integration', () => {
      it('should handle network errors gracefully', (done) => {
        const query = 'SELECT 1';

        service.dbQuery(query).subscribe({
          next: () => done.fail('Should have failed'),
          error: (error) => {
            expect(error).toBeDefined();
            done();
          },
        });

        const req = httpMock.expectOne('/api/database/query');
        req.error(new ProgressEvent('Network error'));
      });

      it('should handle malformed API responses', (done) => {
        const query = 'SELECT 1';

        service.dbQuery(query).subscribe({
          next: () => done.fail('Should have failed'),
          error: (error) => {
            expect(error).toBeDefined();
            done();
          },
        });

        const req = httpMock.expectOne('/api/database/query');
        req.flush('invalid json response', { status: 200, statusText: 'OK' });
      });

      it('should handle API server errors', (done) => {
        const query = 'SELECT 1';

        service.dbQuery(query).subscribe({
          next: () => done.fail('Should have failed'),
          error: (error) => {
            expect(error).toBeDefined();
            done();
          },
        });

        const req = httpMock.expectOne('/api/database/query');
        req.flush({ message: 'Internal server error' }, { status: 500, statusText: 'Internal Server Error' });
      });
    });

    describe('Configuration Integration', () => {
      it('should use correct API base URL from configuration', (done) => {
        service.dbQuery('SELECT 1').subscribe({
          next: () => done(),
          error: done.fail,
        });

        const req = httpMock.expectOne('/api/database/query');
        expect(req.request.url).toBe('/api/database/query');
        req.flush({ success: true, result: [], fields: [] });
      });

      it('should handle missing databaseApiUrl configuration', () => {
        // Create service with config missing databaseApiUrl
        const configWithoutApi = {
          production: false,
          environment: 'test',
          sqlitePath: 'test.db',
          sqliteItem3dPath: 'test_item.db',
        };

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [HttpClientTestingModule],
          providers: [
            provideZonelessChangeDetection(),
            MysqlService,
            { provide: ElectronService, useValue: electronService },
            { provide: KEIRA_APP_CONFIG_TOKEN, useValue: configWithoutApi },
          ],
        });

        const serviceWithoutApi = TestBed.inject(MysqlService);
        // Force web environment
        serviceWithoutApi['isWebEnvironment'] = true;

        // This should use the default API URL '/api/database'
        serviceWithoutApi.dbQuery('SELECT 1').subscribe();
        const req = TestBed.inject(HttpTestingController).expectOne('/api/database/query');
        req.flush({ success: true, result: [], fields: [] });
      });
    });
  });

  describe('Environment Detection Integration', () => {
    it('should detect Electron environment correctly', () => {
      when(electronService.isElectron()).thenReturn('renderer');
      // Reset the service to trigger constructor logic
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          MysqlService,
          { provide: ElectronService, useValue: electronService },
          { provide: KEIRA_APP_CONFIG_TOKEN, useValue: mockConfig },
        ],
      });

      const freshService = TestBed.inject(MysqlService);
      expect(freshService['isWebEnvironment']).toBe(false);
    });

    it('should detect Web environment correctly', () => {
      when(electronService.isElectron()).thenReturn(false);
      // Reset the service to trigger constructor logic
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          MysqlService,
          { provide: ElectronService, useValue: electronService },
          { provide: KEIRA_APP_CONFIG_TOKEN, useValue: mockConfig },
        ],
      });

      const freshService = TestBed.inject(MysqlService);
      expect(freshService['isWebEnvironment']).toBe(true);
    });

    it('should use appropriate connection method based on environment', (done) => {
      when(electronService.isElectron()).thenReturn(false);
      service['isWebEnvironment'] = true;

      const connectionConfig = {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'password',
        database: 'test_db',
      };

      // Should use HTTP API in web environment
      service.connect(connectionConfig).subscribe({
        next: () => done(),
        error: done.fail,
      });

      const req = httpMock.expectOne('/api/database/connect');
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, message: 'Connected' });
    });
  });
});
