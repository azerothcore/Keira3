import { async, TestBed } from '@angular/core/testing';
import { instance, reset } from 'ts-mockito';
import { Connection, ConnectionConfig } from 'mysql';

import { MysqlService } from './mysql.service';
import { ElectronService } from './electron.service';
import { MockedElectronService } from '../test-utils/mocks';
import any = jasmine.any;

class MockMySql {
  createConnection() {}
}

class MockConnection {
  query() {}
  connect() {}
}

fdescribe('MysqlService', () => {
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
    });
  }));

  it('query(queryString) should properly work', async(() => {
    (service as any).mysql = new MockMySql();
    const mockConnection = new MockConnection();
    service['_connection'] = mockConnection as undefined as Connection;
    const querySpy = spyOn(mockConnection, 'query');
    const queryStr = '--some mock query';

    const obs = service.query(queryStr, []);

    obs.subscribe(() => {
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(queryStr, [], any);
    });
  }));

  afterEach(() => {
    reset(MockedElectronService);
  });
});
