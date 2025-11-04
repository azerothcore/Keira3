import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ElectronService } from '@keira/shared/common-services';
import { Connection, ConnectionOptions, QueryError } from 'mysql2';
import { tickAsync } from 'ngx-page-object-model';
import { Subscriber } from 'rxjs';
import { instance, mock, reset } from 'ts-mockito';
import { MysqlService } from './mysql.service';
import Spy = jasmine.Spy;

class MockMySql {
  createConnection() {}
}

class MockConnection {
  query() {}
  connect() {}
}

describe('MysqlService', () => {
  let service: MysqlService;

  const config: ConnectionOptions = { host: 'azerothcore.org' };

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        MysqlService,
        { provide: ElectronService, useValue: instance(mock(ElectronService)) },
      ],
    }),
  );

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
    spyOn(console, 'info');
    (service as any).mysql = new MockMySql();
    const mockConnection = new MockConnection();
    spyOn((service as any).mysql, 'createConnection').and.returnValue(mockConnection);

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

  afterEach(() => {
    reset(mock(ElectronService));
  });
});
