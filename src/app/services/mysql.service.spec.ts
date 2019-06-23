import { async, TestBed } from '@angular/core/testing';
import { instance, reset } from 'ts-mockito';
import { Connection, ConnectionConfig } from 'mysql';

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
    const createConnectionSpy = spyOn((service as any).mysql, 'createConnection').and.returnValue(new MockConnection());

    service.connect(config);

    expect(createConnectionSpy).toHaveBeenCalledWith(config);
    expect(service.config).toEqual(config);
  }));

  afterEach(() => {
    reset(MockedElectronService);
  });
});
