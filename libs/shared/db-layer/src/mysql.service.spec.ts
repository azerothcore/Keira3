import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HttpClient } from '@angular/common/http';
import { Connection, ConnectionOptions, QueryError } from 'mysql2';
import { Subscriber } from 'rxjs';
import { of, throwError } from 'rxjs';
import { instance, mock, reset, when } from 'ts-mockito';
import { ElectronService } from '@keira/shared/common-services';
import { KEIRA_APP_CONFIG_TOKEN, KeiraAppConfig } from '@keira/shared/config';
import { MysqlService } from './mysql.service';
import Spy = jasmine.Spy;
import { tickAsync } from 'ngx-page-object-model';

class MockMySql {
  createConnection() {}
}

class MockConnection {
  query() {}
  connect() {}
}

describe('MysqlService', () => {
  let service: MysqlService;
  let mockElectronService: ElectronService;
  let mockHttpClient: HttpClient;
  let mockAppConfig: KeiraAppConfig;

  const config: ConnectionOptions = { host: 'azerothcore.org' };

  beforeEach(() => {
    mockElectronService = mock(ElectronService);
    mockHttpClient = mock(HttpClient);
    mockAppConfig = {
      production: false,
      environment: 'TEST',
      sqlitePath: 'test.db',
      sqliteItem3dPath: 'test_item.db',
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

  beforeEach(() => {
    service = TestBed.inject(MysqlService);
  });

  it('connectionEstablished getter', () => {
    service['_connectionEstablished'] = true;
    expect(service.connectionEstablished).toBe(true);
  });

  it('getConnectionState should return null when there is no connection', () => {
    (service as any)._connection = null;
    expect(service.getConnectionState()).toBe('EMPTY');

    (service as any)._connection = {};
    expect(service.getConnectionState()).toBe('CONNECTED');
  });

  it('connect(config) should properly work', () => {
    (service as any).mysql = new MockMySql();
    const mockConnection = new MockConnection();
    const createConnectionSpy = spyOn((service as any).mysql, 'createConnection').and.returnValue(mockConnection);
    const connectSpy = spyOn(mockConnection, 'connect');

    const obs = service.connect(config);

    expect(createConnectionSpy).toHaveBeenCalledWith(config);
    expect(service.config).toEqual(config);

    obs.subscribe(() => {
      expect(connectSpy).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(connectSpy).toHaveBeenCalledWith(service['connectCallback']);
    });
  });

  describe('dbQuery(queryString)', () => {
    it('should properly work', () => {
      (service as any).mysql = new MockMySql();
      const mockConnection = new MockConnection();
      service['_connection'] = mockConnection as unknown as Connection;
      const querySpy = spyOn(mockConnection, 'query');
      const queryStr = '--some mock query';

      const obs = service.dbQuery(queryStr, []);

      obs.subscribe(() => {
        expect(querySpy).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(querySpy).toHaveBeenCalledWith(queryStr, [], service['queryCallback']);
      });
    });

    it('should give error if _connection is not defined', () => {
      (service as any).mysql = new MockMySql();
      service['_connection'] = undefined as any;
      spyOn(console, 'error');
      const queryStr = '--some mock query';

      const obs = service.dbQuery(queryStr, []);

      obs.subscribe(() => {
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(`_connection was not defined when trying to run query: ${queryStr}`);
      });
    });

    it('should give error if reconnection is in progress', () => {
      (service as any).mysql = new MockMySql();
      service['_reconnecting'] = true;
      spyOn(console, 'error');
      const queryStr = '--some mock query';

      const obs = service.dbQuery(queryStr);

      obs.subscribe(() => {
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(`Reconnection in progress while trying to run query: ${queryStr}`);
      });
    });
  });

  describe('callbacks', () => {
    let subscriber: Subscriber<any>;
    let errorSpy: Spy;
    let nextSpy: Spy;
    let completeSpy: Spy;
    let callback: (err?: QueryError, result?: any, fields?: any) => void;

    const error = { code: 'some error', errno: 1234 } as QueryError;

    beforeEach(() => {
      subscriber = new Subscriber();
      errorSpy = spyOn(subscriber, 'error');
      nextSpy = spyOn(subscriber, 'next');
      completeSpy = spyOn(subscriber, 'complete');
    });

    describe('connect', () => {
      beforeEach(() => {
        callback = service['getConnectCallback'](subscriber) as any;
      });

      it('should correctly work', () => {
        service['_connectionEstablished'] = false;
        service['_connection'] = { on: jasmine.createSpy() } as any;

        callback();

        expect(errorSpy).toHaveBeenCalledTimes(0);
        expect(nextSpy).toHaveBeenCalledTimes(1);
        expect(completeSpy).toHaveBeenCalledTimes(1);
        expect(service['_connectionEstablished']).toBe(true);
        expect(service['_connection'].on).toHaveBeenCalledTimes(1);
      });

      it('should correctly handle errors', () => {
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

      beforeEach(() => {
        callback = service['getQueryCallback'](subscriber) as any;
      });

      it('should correctly work', () => {
        callback(undefined, result, fields);

        expect(errorSpy).toHaveBeenCalledTimes(0);
        expect(nextSpy).toHaveBeenCalledTimes(1);
        expect(nextSpy).toHaveBeenCalledWith({ result, fields });
        expect(completeSpy).toHaveBeenCalledTimes(1);
      });

      it('should correctly handle errors', () => {
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
      const error = { code: 'PROTOCOL_CONNECTION_LOST' };
      spyOn<any>(service, 'reconnect');

      service['handleConnectionError'](error);

      expect(service['reconnect']).toHaveBeenCalledTimes(1);
    });

    it('should NOT call reconnect if the error is something else', () => {
      const error = { code: 'SOME_OTHER_ERROR' };
      spyOn<any>(service, 'reconnect');

      service['handleConnectionError'](error);

      expect(service['reconnect']).toHaveBeenCalledTimes(0);
    });
  });

  it('reconnect() should correctly work ', async () => {
    service['_reconnecting'] = false;
    spyOn(service['_connectionLostSubject'], 'next');
    spyOn(console, 'log');
    (service as any).mysql = new MockMySql();
    const mockConnection = new MockConnection();
    spyOn((service as any).mysql, 'createConnection').and.returnValue(mockConnection);

    service['reconnect']();

    expect(service['_reconnecting']).toBe(true);
    expect(service['_connectionLostSubject'].next).toHaveBeenCalledTimes(1);
    expect(service['_connectionLostSubject'].next).toHaveBeenCalledWith(false);
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(`DB connection lost. Reconnecting in 500 ms...`);

    await tickAsync(500);
    expect(service['_connection']).toEqual(mockConnection as unknown as Connection);
  });

  describe('reconnectCallback(err)', () => {
    it('should call reconnect() in case of error', () => {
      service['_reconnecting'] = true;
      spyOn(service['_connectionLostSubject'], 'next');
      spyOn<any>(service, 'reconnect');
      service['_connection'] = { on: jasmine.createSpy() } as any;

      service['reconnectCallback']({ code: 'mock-error' } as unknown as QueryError);

      expect(service['reconnect']).toHaveBeenCalledTimes(1);
      expect(service['_reconnecting']).toBe(true);
      expect(service['_connectionLostSubject'].next).toHaveBeenCalledTimes(0);
      expect(service['_connection'].on).toHaveBeenCalledTimes(0);
    });

    it('should correctly work otherwise', () => {
      service['_reconnecting'] = true;
      spyOn(service['_connectionLostSubject'], 'next');
      spyOn<any>(service, 'reconnect');
      service['_connection'] = { on: jasmine.createSpy() } as any;

      service['reconnectCallback'](null);

      expect(service['reconnect']).toHaveBeenCalledTimes(0);
      expect(service['_reconnecting']).toBe(false);
      expect(service['_connectionLostSubject'].next).toHaveBeenCalledTimes(1);
      expect(service['_connectionLostSubject'].next).toHaveBeenCalledWith(true);
      expect(service['_connection'].on).toHaveBeenCalledTimes(1);
    });
  });

  describe('Environment Detection', () => {
    it('should set isWebEnvironment to false when ElectronService.isElectron() returns electron process type', () => {
      const electronService = instance(mockElectronService);
      spyOn(electronService, 'isElectron').and.returnValue('renderer');

      // Create new service instance to trigger constructor
      TestBed.overrideProvider(ElectronService, { useValue: electronService });
      const testService = TestBed.inject(MysqlService);

      expect(testService['isWebEnvironment']).toBe(false);
    });

    it('should set isWebEnvironment to true when ElectronService.isElectron() returns falsy', () => {
      const electronService = instance(mockElectronService);
      spyOn(electronService, 'isElectron').and.returnValue(null as any);

      // Create new service instance to trigger constructor
      TestBed.overrideProvider(ElectronService, { useValue: electronService });
      const testService = TestBed.inject(MysqlService);

      expect(testService['isWebEnvironment']).toBe(true);
    });
  });

  describe('Web Environment - HTTP API Tests', () => {
    beforeEach(() => {
      // Mock web environment
      service['isWebEnvironment'] = true;
    });

    describe('connect() in web environment', () => {
      it('should use HTTP API for connection in web environment', () => {
        const mockResponse = { success: true, message: 'Connected to database' };
        spyOn(service['http'], 'post').and.returnValue(of(mockResponse));
        spyOn(service, 'connectViaAPI' as any).and.callThrough();

        const result = service.connect(config);

        expect(service['connectViaAPI']).toHaveBeenCalledWith(config);
        result.subscribe(() => {
          expect(service['_connectionEstablished']).toBe(true);
          expect(service['_connection']).toEqual({ state: 'CONNECTED' } as any);
        });
      });

      it('should handle connection errors in web environment', () => {
        const mockError = { success: false, error: 'Connection failed' };
        spyOn(service['http'], 'post').and.returnValue(of(mockError));

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
        spyOn(service['http'], 'post').and.returnValue(throwError(() => httpError));

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
        const httpSpy = spyOn(service['http'], 'post').and.returnValue(of(mockResponse));

        service['connectViaAPI'](config).subscribe();

        expect(httpSpy).toHaveBeenCalledWith('/api/database/connect', { config });
      });

      it('should use custom API URL from config', () => {
        mockAppConfig.databaseApiUrl = '/custom/api/db';
        const mockResponse = { success: true };
        const httpSpy = spyOn(service['http'], 'post').and.returnValue(of(mockResponse));

        service['connectViaAPI'](config).subscribe();

        expect(httpSpy).toHaveBeenCalledWith('/custom/api/db/connect', { config });
      });

      it('should use default API URL when config is undefined', () => {
        mockAppConfig.databaseApiUrl = undefined;
        const mockResponse = { success: true };
        const httpSpy = spyOn(service['http'], 'post').and.returnValue(of(mockResponse));

        service['connectViaAPI'](config).subscribe();

        expect(httpSpy).toHaveBeenCalledWith('/api/database/connect', { config });
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

        spyOn(service, 'queryViaAPI' as any).and.returnValue(of(mockResponse));

        const result = service.dbQuery(queryString, values);

        expect(service['queryViaAPI']).toHaveBeenCalledWith(queryString, values);
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
        const httpSpy = spyOn(service['http'], 'post').and.returnValue(of(mockResponse));

        service['queryViaAPI'](queryString, values).subscribe();

        expect(httpSpy).toHaveBeenCalledWith('/api/database/query', {
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
        spyOn(service['http'], 'post').and.returnValue(of(mockApiResponse));

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
        spyOn(service['http'], 'post').and.returnValue(of(mockErrorResponse));
        spyOn(console, 'error');

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
        spyOn(service['http'], 'post').and.returnValue(throwError(() => httpError));
        spyOn(console, 'error');

        service['queryViaAPI'](queryString).subscribe({
          error: (error) => {
            expect(error).toBe(httpError);
            expect(console.error).toHaveBeenCalledWith('Database query error:', httpError);
          },
        });
      });

      it('should handle undefined values parameter', () => {
        const queryString = 'SELECT * FROM test';
        const mockResponse = { success: true, result: [], fields: [] };
        const httpSpy = spyOn(service['http'], 'post').and.returnValue(of(mockResponse));

        service['queryViaAPI'](queryString, undefined).subscribe();

        expect(httpSpy).toHaveBeenCalledWith('/api/database/query', {
          sql: queryString,
          params: undefined,
        });
      });
    });
  });

  describe('Electron Environment Tests', () => {
    beforeEach(() => {
      // Mock Electron environment
      service['isWebEnvironment'] = false;
      (service as any).mysql = new MockMySql();
    });

    it('should use direct mysql2 connection in Electron environment', () => {
      const mockConnection = new MockConnection();
      const createConnectionSpy = spyOn((service as any).mysql, 'createConnection').and.returnValue(mockConnection);
      const connectSpy = spyOn(mockConnection, 'connect');

      const result = service.connect(config);

      expect(createConnectionSpy).toHaveBeenCalledWith(config);
      result.subscribe(() => {
        expect(connectSpy).toHaveBeenCalled();
      });
    });

    it('should use direct mysql2 query in Electron environment', () => {
      const mockConnection = new MockConnection();
      service['_connection'] = mockConnection as unknown as Connection;
      service['_reconnecting'] = false;
      const querySpy = spyOn(mockConnection, 'query');
      const queryString = 'SELECT * FROM test';

      const result = service.dbQuery(queryString);

      result.subscribe(() => {
        expect(querySpy).toHaveBeenCalled();
      });
    });
  });

  afterEach(() => {
    reset(mockElectronService);
    reset(mockHttpClient);
  });
});
