import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ElectronService } from '@keira/shared/common-services';
import { KEIRA_APP_CONFIG_TOKEN } from '@keira/shared/config';
import { MysqlResult, TableRow } from '@keira/shared/constants';
import { Observable } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';
import { vi } from 'vitest';

import { MysqlService } from './mysql.service';

describe('MysqlService Integration Tests', () => {
  let service: MysqlService;
  let httpMock: HttpTestingController;
  let electronServiceMock: ElectronService;
  let electronService: ElectronService;

  const mockConfig = {
    production: true,
    environment: 'DOCKER',
    sqlitePath: 'assets/sqlite.db',
    databaseApiUrl: '/api/database',
  };

  /** Subscribe to an observable, returning a promise that resolves with its first emission. */
  function nextToPromise<T>(obs: Observable<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      obs.subscribe({
        next: (value) => resolve(value),
        error: (error) => reject(error),
      });
    });
  }

  /** Subscribe to an observable expected to error, returning a promise that resolves with the error. */
  function errorToPromise(obs: Observable<unknown>): Promise<unknown> {
    return new Promise<unknown>((resolve, reject) => {
      obs.subscribe({
        next: () => reject(new Error('Should have failed')),
        error: (error) => resolve(error),
      });
    });
  }

  beforeEach(() => {
    electronServiceMock = mock(ElectronService);
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
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Web Environment Integration Tests', () => {
    beforeEach(() => {
      // Force web environment
      when(electronServiceMock.isElectron()).thenReturn(false as never);
      service['isWebEnvironment'] = true;
    });

    describe('Database Connection Integration', () => {
      it('should successfully connect to database via HTTP API', async () => {
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

        const result = nextToPromise(service.connect(connectionConfig));

        const req = httpMock.expectOne('/api/database/connect');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ config: connectionConfig });
        req.flush(mockResponse);

        await result;
        expect(service.connectionEstablished).toBe(true);
      });

      it('should handle connection failure via HTTP API', async () => {
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

        const error = errorToPromise(service.connect(connectionConfig));

        const req = httpMock.expectOne('/api/database/connect');
        expect(req.request.method).toBe('POST');
        req.flush(mockErrorResponse, { status: 500, statusText: 'Internal Server Error' });

        expect(await error).toBeDefined();
        expect(service.connectionEstablished).toBe(false);
      });

      it('should get connection state via method call', () => {
        const state = service.getConnectionState();
        expect(state).toBeDefined();
        expect(typeof state).toBe('string');
      });
    });

    describe('Query Execution Integration', () => {
      it('should execute SELECT query via HTTP API', async () => {
        const query = 'SELECT * FROM creature_template WHERE entry = ?';
        const params = ['1'];

        const mockQueryResponse = {
          success: true,
          result: [{ entry: 1, name: 'Test Creature', minlevel: 1, maxlevel: 1 }],
          fields: [{ name: 'entry' }, { name: 'name' }, { name: 'minlevel' }, { name: 'maxlevel' }],
        };

        const resultPromise = nextToPromise(service.dbQuery(query, params));

        const req = httpMock.expectOne('/api/database/query');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ sql: query, params });
        req.flush(mockQueryResponse);

        const result: MysqlResult<TableRow> = await resultPromise;
        expect(result.result).toEqual(mockQueryResponse.result);
        expect(result.fields).toEqual(mockQueryResponse.fields);
      });

      it('should handle query execution errors via HTTP API', async () => {
        const query = 'SELECT * FROM non_existent_table';
        const params: string[] = [];
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const mockErrorResponse = {
          success: false,
          error: "Table 'test_db.non_existent_table' doesn't exist",
          code: 'ER_NO_SUCH_TABLE',
          errno: 1146,
          sqlState: '42S02',
        };

        const error = errorToPromise(service.dbQuery(query, params));

        const req = httpMock.expectOne('/api/database/query');
        expect(req.request.method).toBe('POST');
        req.flush(mockErrorResponse, { status: 500, statusText: 'Internal Server Error' });

        expect(await error).toBeDefined();
      });

      it('should execute INSERT query via HTTP API', async () => {
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

        const resultPromise = nextToPromise(service.dbQuery(query, params));

        const req = httpMock.expectOne('/api/database/query');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ sql: query, params });
        req.flush(mockInsertResponse);

        const result = (await resultPromise) as MysqlResult<TableRow> & { result: { affectedRows: number; insertId: number } };
        expect(result.result.affectedRows).toBe(1);
        expect(result.result.insertId).toBe(42);
      });

      it('should execute UPDATE query via HTTP API', async () => {
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

        const resultPromise = nextToPromise(service.dbQuery(query, params));

        const req = httpMock.expectOne('/api/database/query');
        expect(req.request.method).toBe('POST');
        req.flush(mockUpdateResponse);

        const result = (await resultPromise) as MysqlResult<TableRow> & { result: { affectedRows: number; changedRows: number } };
        expect(result.result.affectedRows).toBe(1);
        expect(result.result.changedRows).toBe(1);
      });

      it('should execute DELETE query via HTTP API', async () => {
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

        const resultPromise = nextToPromise(service.dbQuery(query, params));

        const req = httpMock.expectOne('/api/database/query');
        expect(req.request.method).toBe('POST');
        req.flush(mockDeleteResponse);

        const result = (await resultPromise) as MysqlResult<TableRow> & { result: { affectedRows: number } };
        expect(result.result.affectedRows).toBe(1);
      });
    });

    describe('Error Handling Integration', () => {
      it('should handle network errors gracefully', async () => {
        const query = 'SELECT 1';
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const error = errorToPromise(service.dbQuery(query));

        const req = httpMock.expectOne('/api/database/query');
        req.error(new ProgressEvent('Network error'));

        expect(await error).toBeDefined();
      });

      it('should handle malformed API responses', async () => {
        const query = 'SELECT 1';
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const error = errorToPromise(service.dbQuery(query));

        const req = httpMock.expectOne('/api/database/query');
        req.flush('invalid json response', { status: 200, statusText: 'OK' });

        expect(await error).toBeDefined();
      });

      it('should handle API server errors', async () => {
        const query = 'SELECT 1';
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const error = errorToPromise(service.dbQuery(query));

        const req = httpMock.expectOne('/api/database/query');
        req.flush({ message: 'Internal server error' }, { status: 500, statusText: 'Internal Server Error' });

        expect(await error).toBeDefined();
      });
    });

    describe('Configuration Integration', () => {
      it('should use correct API base URL from configuration', async () => {
        const resultPromise = nextToPromise(service.dbQuery('SELECT 1'));

        const req = httpMock.expectOne('/api/database/query');
        expect(req.request.url).toBe('/api/database/query');
        req.flush({ success: true, result: [], fields: [] });

        await resultPromise;
      });

      it('should handle missing databaseApiUrl configuration', () => {
        // Create service with config missing databaseApiUrl
        const configWithoutApi = {
          production: false,
          environment: 'test',
          sqlitePath: 'test.db',
        };

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            provideZonelessChangeDetection(),
            provideHttpClient(),
            provideHttpClientTesting(),
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
        const freshHttpMock = TestBed.inject(HttpTestingController);
        const req = freshHttpMock.expectOne('/api/database/query');
        req.flush({ success: true, result: [], fields: [] });
        freshHttpMock.verify();
      });
    });
  });

  describe('Environment Detection Integration', () => {
    it('should detect Electron environment correctly', () => {
      when(electronServiceMock.isElectron()).thenReturn('renderer' as never);
      // The Electron constructor path loads mysql2/ssh2 via window.require
      (window as unknown as { require: unknown }).require = vi.fn().mockReturnValue({});

      try {
        // Reset the service to trigger constructor logic
        TestBed.resetTestingModule();
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

        const freshService = TestBed.inject(MysqlService);
        expect(freshService['isWebEnvironment']).toBe(false);
      } finally {
        delete (window as unknown as { require?: unknown }).require;
      }
    });

    it('should detect Web environment correctly', () => {
      when(electronServiceMock.isElectron()).thenReturn(false as never);
      // Reset the service to trigger constructor logic
      TestBed.resetTestingModule();
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

      const freshService = TestBed.inject(MysqlService);
      expect(freshService['isWebEnvironment']).toBe(true);
    });

    it('should use appropriate connection method based on environment', async () => {
      when(electronServiceMock.isElectron()).thenReturn(false as never);
      service['isWebEnvironment'] = true;

      const connectionConfig = {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'password',
        database: 'test_db',
      };

      // Should use HTTP API in web environment
      const resultPromise = nextToPromise(service.connect(connectionConfig));

      const req = httpMock.expectOne('/api/database/connect');
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, message: 'Connected' });

      await resultPromise;
    });
  });
});
