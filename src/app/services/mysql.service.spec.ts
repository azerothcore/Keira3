import { async, TestBed } from '@angular/core/testing';
import { instance, reset } from 'ts-mockito';
import { Connection, ConnectionConfig, MysqlError } from 'mysql';
import { Subscriber } from 'rxjs';
import Spy = jasmine.Spy;

import { MysqlService } from './mysql.service';
import { ElectronService } from './electron.service';
import { MockedElectronService } from '../test-utils/mocks';

class MockMySql {
  createConnection() {}
}

class MockConnection {
  query() {}
  connect() {}
}

describe('MysqlService', () => {
  let service: MysqlService;

  const config: ConnectionConfig = { host: 'azerothcore.org' };

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      MysqlService,
      { provide : ElectronService, useValue: instance(MockedElectronService) },
    ]
  }));

  beforeEach(() => {
    service = TestBed.get(MysqlService);
  });

  it('connectionEstablished getter', () => {
    service['_connectionEstablished'] = true;
    expect(service.connectionEstablished).toBe(true);
  });

  it('getConnectionState should return null when there is no connection', () => {
    (service as any)._connection = null;
    expect(service.getConnectionState()).toBeNull();

    const connection: Partial<Connection> = { state:  'connected' };
    (service as any)._connection = connection;
    expect(service.getConnectionState()).toEqual(connection.state);
  });

  it('connect(config) should properly work', async(() => {
    (service as any).mysql = new MockMySql();
    const mockConnection = new MockConnection();
    const createConnectionSpy = spyOn((service as any).mysql, 'createConnection').and.returnValue(mockConnection);
    const connectSpy = spyOn(mockConnection, 'connect');

    const obs = service.connect(config);

    expect(createConnectionSpy).toHaveBeenCalledWith(config);
    expect(service.config).toEqual(config);

    obs.subscribe(() => {
      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(connectSpy).toHaveBeenCalledWith(service['connectCallback']);
    });
  }));

  it('dbQuery(queryString) should properly work', async(() => {
    (service as any).mysql = new MockMySql();
    const mockConnection = new MockConnection();
    service['_connection'] = mockConnection as undefined as Connection;
    const querySpy = spyOn(mockConnection, 'query');
    const queryStr = '--some mock query';

    const obs = service.dbQuery(queryStr, []);

    obs.subscribe(() => {
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(queryStr, [], service['queryCallback']);
    });
  }));

  describe('callbacks', () => {
    let subscriber: Subscriber<any>;
    let errorSpy: Spy;
    let nextSpy: Spy;
    let completeSpy: Spy;
    let callback: Function;

    const error = { code: 'some error', errno: 1234 } as MysqlError;

    beforeEach(() => {
      subscriber = new Subscriber();
      errorSpy = spyOn(subscriber, 'error');
      nextSpy = spyOn(subscriber, 'next');
      completeSpy = spyOn(subscriber, 'complete');
    });

    describe('connect', () => {
      beforeEach(() => {
        callback = service['getConnectCallback'](subscriber);
      });

      it('should correctly work', () => {
        service['_connectionEstablished'] = false;

        callback();

        expect(errorSpy).toHaveBeenCalledTimes(0);
        expect(nextSpy).toHaveBeenCalledTimes(1);
        expect(completeSpy).toHaveBeenCalledTimes(1);
        expect(service['_connectionEstablished']).toBe(true);
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
      const results = 'some mock result';
      const fields = 'some mock fields';

      beforeEach(() => {
        callback = service['getQueryCallback'](subscriber);
      });

      it('should correctly work', () => {
        callback(null, results, fields);

        expect(errorSpy).toHaveBeenCalledTimes(0);
        expect(nextSpy).toHaveBeenCalledTimes(1);
        expect(nextSpy).toHaveBeenCalledWith({ results, fields });
        expect(completeSpy).toHaveBeenCalledTimes(1);
      });

      it('should correctly handle errors', () => {
        callback(error, results, fields);

        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(error);
        expect(nextSpy).toHaveBeenCalledTimes(0);
        expect(completeSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  afterEach(() => {
    reset(MockedElectronService);
  });
});
