import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HttpClient } from '@angular/common/http';
import { Connection, ConnectionOptions, QueryError } from 'mysql2';
import { tickAsync } from 'ngx-page-object-model';
import { Subscriber, of, throwError } from 'rxjs';
import { instance, mock, reset, when } from 'ts-mockito';
import { ElectronService } from '@keira/shared/common-services';
import { KEIRA_APP_CONFIG_TOKEN, KeiraAppConfig } from '@keira/shared/config';
import { MysqlService } from './mysql.service';
import { KeiraConnectionOptions } from './mysql.model';

class MockMySql {
  createConnection() {}
}

class MockConnection {
  query() {}
  connect() {}
}

describe('MysqlService', () => {
  let mockElectronService: ElectronService;
  let mockHttpClient: HttpClient;
  let mockAppConfig: { -readonly [K in keyof KeiraAppConfig]: KeiraAppConfig[K] };

  const config: ConnectionOptions = { host: 'azerothcore.org' };

  beforeEach(() => {
    mockElectronService = mock(ElectronService);
    mockHttpClient = mock(HttpClient);
    mockAppConfig = {
      production: false,
      environment: 'test',
      sqlitePath: 'test.db',
      databaseApiUrl: '/api/database',
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        MysqlService,
        { provide: ElectronService, useValue: instance(mockElectronService) },
        { provide: HttpClient, useValue: instance(mockHttpClient) },
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: mockAppConfig },
      ],
    });
  });

  function setup() {
    const service = TestBed.inject(MysqlService);
    return { service };
  }

  it('connectionEstablished getter', () => {
    const { service } = setup();
    service['_connectionEstablished'] = true;
    expect(service.connectionEstablished).toBe(true);
  });

  it('getConnectionState should return null when there is no connection', () => {
    const { service } = setup();
    (service as any)._connection = null;
    expect(service.getConnectionState()).toBe('DISCONNECTED');

    (service as any)._connection = {};
    expect(service.getConnectionState()).toBe('CONNECTED');
  });

  it('connect(config) should properly work', () => {
    const { service } = setup();
    service['isWebEnvironment'] = false;
    (service as any).mysql = new MockMySql();
    const mockConnection = new MockConnection();
    const createConnectionSpy = vi.spyOn((service as any).mysql, 'createConnection').mockReturnValue(mockConnection);
    const connectSpy = vi.spyOn(mockConnection, 'connect').mockImplementation(() => undefined);

    const obs = service.connect(config);

    expect(createConnectionSpy).toHaveBeenCalledWith(config);
    expect(service.config).toEqual(config);

    obs.subscribe(() => {
      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(connectSpy).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('dbQuery(queryString)', () => {
    it('should properly work', () => {
      const { service } = setup();
      service['isWebEnvironment'] = false;
      (service as any).mysql = new MockMySql();
      const mockConnection = new MockConnection();
      service['_connection'] = mockConnection as unknown as Connection;
      const querySpy = vi.spyOn(mockConnection, 'query').mockImplementation(() => undefined);
      const queryStr = '--some mock query';

      const obs = service.dbQuery(queryStr, []);

      obs.subscribe(() => {
        expect(querySpy).toHaveBeenCalledTimes(1);
        expect(querySpy).toHaveBeenCalledWith(queryStr, [], expect.any(Function));
      });
    });

    it('should give error if _connection is not defined', () => {
      const { service } = setup();
      service['isWebEnvironment'] = false;
      (service as any).mysql = new MockMySql();
      service['_connection'] = undefined as any;
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const queryStr = '--some mock query';

      const obs = service.dbQuery(queryStr, []);

      obs.subscribe(() => {
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(`_connection was not defined when trying to run query: ${queryStr}`);
      });
    });

    it('should give error if reconnection is in progress', () => {
      const { service } = setup();
      service['isWebEnvironment'] = false;
      (service as any).mysql = new MockMySql();
      service['_reconnecting'] = true;
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const queryStr = '--some mock query';

      const obs = service.dbQuery(queryStr);

      obs.subscribe(() => {
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(`Reconnection in progress while trying to run query: ${queryStr}`);
      });
    });
  });

  describe('callbacks', () => {
    const error = { code: 'some error', errno: 1234 } as QueryError;

    function setupCallbacks() {
      const { service } = setup();
      const subscriber = new Subscriber();
      const errorSpy = vi.spyOn(subscriber, 'error').mockImplementation(() => undefined);
      const nextSpy = vi.spyOn(subscriber, 'next').mockImplementation(() => undefined);
      const completeSpy = vi.spyOn(subscriber, 'complete').mockImplementation(() => undefined);
      return { service, subscriber, errorSpy, nextSpy, completeSpy };
    }

    describe('connect', () => {
      function setupConnect() {
        const result = setupCallbacks();
        const callback = result.service['getConnectCallback'](result.subscriber) as any;
        return { ...result, callback };
      }

      it('should correctly work', () => {
        const { service, errorSpy, nextSpy, completeSpy, callback } = setupConnect();
        service['_connectionEstablished'] = false;
        service['_connection'] = { on: vi.fn() } as any;

        callback();

        expect(errorSpy).toHaveBeenCalledTimes(0);
        expect(nextSpy).toHaveBeenCalledTimes(1);
        expect(completeSpy).toHaveBeenCalledTimes(1);
        expect(service['_connectionEstablished']).toBe(true);
        expect(service['_connection'].on).toHaveBeenCalledTimes(1);
      });

      it('should correctly handle errors', () => {
        const { service, errorSpy, nextSpy, completeSpy, callback } = setupConnect();
        service['_connectionEstablished'] = true;

        callback(error);

        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(error);
        expect(nextSpy).toHaveBeenCalledTimes(0);
        expect(completeSpy).toHaveBeenCalledTimes(1);
        expect(service['_connectionEstablished']).toBe(false);
      });
    });

    describe('query', () => {
      const result = 'some mock result';
      const fields = 'some mock fields';

      function setupQuery() {
        const callbacksResult = setupCallbacks();
        const callback = callbacksResult.service['getQueryCallback'](callbacksResult.subscriber) as any;
        return { ...callbacksResult, callback };
      }

      it('should correctly work', () => {
        const { errorSpy, nextSpy, completeSpy, callback } = setupQuery();
        callback(undefined, result, fields);

        expect(errorSpy).toHaveBeenCalledTimes(0);
        expect(nextSpy).toHaveBeenCalledTimes(1);
        expect(nextSpy).toHaveBeenCalledWith({ result, fields });
        expect(completeSpy).toHaveBeenCalledTimes(1);
      });

      it('should correctly handle errors', () => {
        const { errorSpy, nextSpy, completeSpy, callback } = setupQuery();
        callback(error, result, fields);

        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(error);
        expect(nextSpy).toHaveBeenCalledTimes(0);
        expect(completeSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('handleConnectionError(error)', () => {
    it('should call reconnect if the error is PROTOCOL_CONNECTION_LOST', () => {
      const { service } = setup();
      const error = { code: 'PROTOCOL_CONNECTION_LOST' };
      vi.spyOn<any>(service, 'reconnect').mockImplementation(() => undefined);

      service['handleConnectionError'](error);

      expect(service['reconnect']).toHaveBeenCalledTimes(1);
    });

    it('should NOT call reconnect if the error is something else', () => {
      const { service } = setup();
      const error = { code: 'SOME_OTHER_ERROR' };
      vi.spyOn<any>(service, 'reconnect').mockImplementation(() => undefined);

      service['handleConnectionError'](error);

      expect(service['reconnect']).toHaveBeenCalledTimes(0);
    });
  });

  it('reconnect() should correctly work ', async () => {
    const { service } = setup();
    service['_reconnecting'] = false;
    service['_config'] = {} as KeiraConnectionOptions;
    vi.spyOn(service['_connectionLostSubject'], 'next').mockImplementation(() => undefined);
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    (service as any).mysql = new MockMySql();
    const mockConnection = new MockConnection();
    vi.spyOn((service as any).mysql, 'createConnection').mockReturnValue(mockConnection);

    service['reconnect']();

    expect(service['_reconnecting']).toBe(true);
    expect(service['_connectionLostSubject'].next).toHaveBeenCalledTimes(1);
    expect(service['_connectionLostSubject'].next).toHaveBeenCalledWith(false);
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledWith(`DB connection lost. Reconnecting in 500 ms...`);

    await tickAsync(500);
    expect(service['_connection']).toEqual(mockConnection as unknown as Connection);
  });

  describe('reconnectCallback(err)', () => {
    it('should call reconnect() in case of error', () => {
      const { service } = setup();
      service['_reconnecting'] = true;
      vi.spyOn(service['_connectionLostSubject'], 'next').mockImplementation(() => undefined);
      vi.spyOn<any>(service, 'reconnect').mockImplementation(() => undefined);
      service['_connection'] = { on: vi.fn() } as any;

      service['reconnectCallback']({ code: 'mock-error' } as unknown as QueryError);

      expect(service['reconnect']).toHaveBeenCalledTimes(1);
      expect(service['_reconnecting']).toBe(true);
      expect(service['_connectionLostSubject'].next).toHaveBeenCalledTimes(0);
      expect(service['_connection'].on).toHaveBeenCalledTimes(0);
    });

    it('should correctly work otherwise', () => {
      const { service } = setup();
      service['_reconnecting'] = true;
      vi.spyOn(service['_connectionLostSubject'], 'next').mockImplementation(() => undefined);
      vi.spyOn<any>(service, 'reconnect').mockImplementation(() => undefined);
      service['_connection'] = { on: vi.fn() } as any;

      service['reconnectCallback'](null);

      expect(service['reconnect']).toHaveBeenCalledTimes(0);
      expect(service['_reconnecting']).toBe(false);
      expect(service['_connectionLostSubject'].next).toHaveBeenCalledTimes(1);
      expect(service['_connectionLostSubject'].next).toHaveBeenCalledWith(true);
      expect(service['_connection'].on).toHaveBeenCalledTimes(1);
    });
  });

  describe('Environment Detection', () => {
    afterEach(() => {
      delete (window as any).require;
    });

    it('should set isWebEnvironment to false when ElectronService.isElectron() returns electron process type', () => {
      // the Electron constructor path calls window.require('mysql2') / window.require('ssh2')
      (window as any).require = vi.fn().mockReturnValue({});
      when(mockElectronService.isElectron()).thenReturn('renderer' as any);

      // Create new service instance to trigger constructor
      const { service } = setup();

      expect(service['isWebEnvironment']).toBe(false);
    });

    it('should set isWebEnvironment to true when ElectronService.isElectron() returns falsy', () => {
      when(mockElectronService.isElectron()).thenReturn(null as any);

      // Create new service instance to trigger constructor
      const { service } = setup();

      expect(service['isWebEnvironment']).toBe(true);
    });
  });

  describe('Web Environment - HTTP API Tests', () => {
    let service: MysqlService;
    let postSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      service = setup().service;
      // Mock web environment
      service['isWebEnvironment'] = true;
      postSpy = vi.fn();
      (service as any).http = { post: postSpy };
    });

    describe('connect() in web environment', () => {
      it('should use HTTP API for connection in web environment', () => {
        const mockResponse = { success: true, message: 'Connected to database' };
        postSpy.mockReturnValue(of(mockResponse));
        const connectViaAPISpy = vi.spyOn(service as any, 'connectViaAPI');

        const result = service.connect(config);

        expect(connectViaAPISpy).toHaveBeenCalledWith(config);
        result.subscribe(() => {
          expect(service['_connectionEstablished']).toBe(true);
          expect(service['_connection']).toEqual({ state: 'CONNECTED' } as any);
        });
      });

      it('should handle connection errors in web environment', () => {
        const mockError = { success: false, error: 'Connection failed' };
        postSpy.mockReturnValue(of(mockError));

        const result = service.connect(config);

        result.subscribe({
          error: (error) => {
            expect(error.message).toContain('Connection failed');
            expect(service['_connectionEstablished']).toBe(false);
          },
        });
      });

      it('should handle HTTP errors in web environment', () => {
        const httpError = new Error('Network error');
        postSpy.mockReturnValue(throwError(() => httpError));

        const result = service.connect(config);

        result.subscribe({
          error: (error) => {
            expect(error).toBe(httpError);
            expect(service['_connectionEstablished']).toBe(false);
          },
        });
      });
    });

    describe('connectViaAPI()', () => {
      it('should make POST request to correct API endpoint', () => {
        const mockResponse = { success: true };
        postSpy.mockReturnValue(of(mockResponse));

        service['connectViaAPI'](config).subscribe();

        expect(postSpy).toHaveBeenCalledWith('/api/database/connect', { config });
      });

      it('should use custom API URL from config', () => {
        mockAppConfig.databaseApiUrl = '/custom/api/db';
        const mockResponse = { success: true };
        postSpy.mockReturnValue(of(mockResponse));

        service['connectViaAPI'](config).subscribe();

        expect(postSpy).toHaveBeenCalledWith('/custom/api/db/connect', { config });
      });

      it('should use default API URL when config is undefined', () => {
        mockAppConfig.databaseApiUrl = undefined;
        const mockResponse = { success: true };
        postSpy.mockReturnValue(of(mockResponse));

        service['connectViaAPI'](config).subscribe();

        expect(postSpy).toHaveBeenCalledWith('/api/database/connect', { config });
      });
    });

    describe('dbQuery() in web environment', () => {
      it('should use HTTP API for queries in web environment', () => {
        const queryString = 'SELECT * FROM test';
        const values = ['param1'];
        const mockResponse = {
          result: [{ id: 1, name: 'test' }],
          fields: [],
        };

        const queryViaAPISpy = vi.spyOn(service as any, 'queryViaAPI').mockReturnValue(of(mockResponse));

        const result = service.dbQuery(queryString, values);

        expect(queryViaAPISpy).toHaveBeenCalledWith(queryString, values);
        result.subscribe((response) => {
          expect(response).toEqual(mockResponse);
        });
      });
    });

    describe('queryViaAPI()', () => {
      it('should make POST request with correct parameters', () => {
        const queryString = 'SELECT * FROM test';
        const values = ['param1'];
        const mockResponse = { success: true, result: [], fields: [] };
        postSpy.mockReturnValue(of(mockResponse));

        service['queryViaAPI'](queryString, values).subscribe();

        expect(postSpy).toHaveBeenCalledWith('/api/database/query', {
          sql: queryString,
          params: values,
        });
      });

      it('should transform successful response correctly', () => {
        const queryString = 'SELECT * FROM test';
        const mockApiResponse = {
          success: true,
          result: [{ id: 1, name: 'test' }],
          fields: [],
        };
        postSpy.mockReturnValue(of(mockApiResponse));

        service['queryViaAPI'](queryString).subscribe((response) => {
          expect(response).toEqual({
            result: mockApiResponse.result,
            fields: mockApiResponse.fields,
          });
        });
      });

      it('should handle query errors from API', () => {
        const queryString = 'INVALID SQL';
        const mockErrorResponse = { success: false, error: 'SQL syntax error' };
        postSpy.mockReturnValue(of(mockErrorResponse));
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        service['queryViaAPI'](queryString).subscribe({
          error: (error) => {
            expect(error.message).toContain('SQL syntax error');
            expect(console.error).toHaveBeenCalledWith('Database query error:', error);
          },
        });
      });

      it('should handle HTTP errors during query', () => {
        const queryString = 'SELECT * FROM test';
        const httpError = new Error('Network timeout');
        postSpy.mockReturnValue(throwError(() => httpError));
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        service['queryViaAPI'](queryString).subscribe({
          error: (error) => {
            expect(error).toBe(httpError);
            expect(console.error).toHaveBeenCalledWith('Database query error:', httpError);
          },
        });
      });

      it('should default to an empty params array when values is undefined', () => {
        const queryString = 'SELECT * FROM test';
        const mockResponse = { success: true, result: [], fields: [] };
        postSpy.mockReturnValue(of(mockResponse));

        service['queryViaAPI'](queryString, undefined).subscribe();

        expect(postSpy).toHaveBeenCalledWith('/api/database/query', {
          sql: queryString,
          params: [],
        });
      });
    });
  });

  describe('Electron Environment Tests', () => {
    let service: MysqlService;

    beforeEach(() => {
      service = setup().service;
      // Mock Electron environment
      service['isWebEnvironment'] = false;
      (service as any).mysql = new MockMySql();
    });

    it('should use direct mysql2 connection in Electron environment', () => {
      const mockConnection = new MockConnection();
      const createConnectionSpy = vi.spyOn((service as any).mysql, 'createConnection').mockReturnValue(mockConnection);
      const connectSpy = vi.spyOn(mockConnection, 'connect').mockImplementation(() => undefined);

      const result = service.connect(config);

      expect(createConnectionSpy).toHaveBeenCalledWith(config);

      result.subscribe();
      expect(connectSpy).toHaveBeenCalled();
    });

    it('should use direct mysql2 query in Electron environment', () => {
      const mockConnection = new MockConnection();
      service['_connection'] = mockConnection as unknown as Connection;
      service['_reconnecting'] = false;
      const querySpy = vi.spyOn(mockConnection, 'query').mockImplementation(() => undefined);
      const queryString = 'SELECT * FROM test';

      const result = service.dbQuery(queryString);

      result.subscribe();
      expect(querySpy).toHaveBeenCalled();
    });
  });

  describe('connectWeb() / disconnectWeb()', () => {
    it('connectWeb should establish the connection when state is CONNECTED', async () => {
      const { service } = setup();
      (service as any).http = { get: vi.fn().mockReturnValue(of({ state: 'CONNECTED' })) };

      const result = await new Promise((resolve) => service.connectWeb().subscribe(resolve));

      expect(result).toBe(true);
      expect(service.connectionEstablished).toBe(true);
      expect((service as any).http.get).toHaveBeenCalledWith('/api/database/state');
    });

    it('connectWeb should emit false and stay disconnected on non-CONNECTED state', async () => {
      const { service } = setup();
      (service as any).http = { get: vi.fn().mockReturnValue(of({ state: 'DISCONNECTED' })) };

      const result = await new Promise((resolve) => service.connectWeb().subscribe(resolve));

      expect(result).toBe(false);
      expect(service.connectionEstablished).toBe(false);
    });

    it('connectWeb should emit false instead of erroring on HTTP failure', async () => {
      const { service } = setup();
      (service as any).http = { get: vi.fn().mockReturnValue(throwError(() => new Error('401'))) };

      const result = await new Promise((resolve) => service.connectWeb().subscribe(resolve));

      expect(result).toBe(false);
      expect(service.connectionEstablished).toBe(false);
    });

    it('disconnectWeb should clear the connection and emit webSessionExpired$', () => {
      const { service } = setup();
      service['_connectionEstablished'] = true;
      const expired = vi.fn();
      service.webSessionExpired$.subscribe(expired);

      service.disconnectWeb();

      expect(service.connectionEstablished).toBe(false);
      expect(expired).toHaveBeenCalledTimes(1);
    });

    it('disconnectWeb should NOT emit webSessionExpired$ when not established', () => {
      const { service } = setup();
      service['_connectionEstablished'] = false;
      const expired = vi.fn();
      service.webSessionExpired$.subscribe(expired);

      service.disconnectWeb();

      expect(service.connectionEstablished).toBe(false);
      expect(expired).toHaveBeenCalledTimes(0);
    });
  });

  afterEach(() => {
    reset(mockElectronService);
    reset(mockHttpClient);
  });
});
