import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ElectronService } from '@keira/shared/common-services';
import { Connection, ConnectionOptions, QueryError } from 'mysql2';
import { tickAsync } from 'ngx-page-object-model';
import { ElectronService } from '@keira/shared/common-services';
import { KEIRA_APP_CONFIG_TOKEN, KeiraAppConfig } from '@keira/shared/config';
import { MysqlService } from './mysql.service';

class MockMySql {
  readonly createConnection = jasmine.createSpy('createConnection');
}

class MockConnection {
  readonly query = jasmine.createSpy('query');
  readonly connect = jasmine.createSpy('connect');
  readonly on = jasmine.createSpy('on');
}

const ELECTRON_CONFIG: KeiraAppConfig = {
  production: false,
  environment: 'ELECTRON',
  sqlitePath: 'sqlite.db',
  sqliteItem3dPath: 'item.db',
};

const WEB_CONFIG: KeiraAppConfig = {
  production: true,
  environment: 'WEB',
  sqlitePath: 'assets/sqlite.db',
  sqliteItem3dPath: 'assets/item_display.db',
  databaseApiUrl: '/api/database',
};

describe('MysqlService (electron)', () => {
  const originalRequire = (window as any).require;
  let service: MysqlService;
  let mysqlMock: MockMySql;
  let mockConnection: MockConnection;

  beforeEach(() => {
    mysqlMock = new MockMySql();
    mockConnection = new MockConnection();
    mysqlMock.createConnection.and.returnValue(mockConnection as unknown as Connection);

    (window as any).require = jasmine.createSpy('require').and.returnValue(mysqlMock);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        MysqlService,
        { provide: ElectronService, useValue: { isElectron: () => 'renderer' } },
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: ELECTRON_CONFIG },
      ],
    });

    service = TestBed.inject(MysqlService);
  });

  afterEach(() => {
    (window as any).require = originalRequire;
    TestBed.resetTestingModule();
  });

  it('should expose connectionEstablished flag', () => {
    service['_connectionEstablished'] = true;
    expect(service.connectionEstablished).toBeTrue();
  });

  it('should report connection state based on internal connection', () => {
    service['_connection'] = undefined as unknown as Connection;
    expect(service.getConnectionState()).toBe('DISCONNECTED');

    service['_connection'] = {} as Connection;
    expect(service.getConnectionState()).toBe('CONNECTED');
  });

  it('should connect via mysql driver in electron mode', () => {
    const config: ConnectionOptions = { host: 'azerothcore.org' };

    service.connect(config).subscribe();

    expect(mysqlMock.createConnection).toHaveBeenCalledWith({ ...config, multipleStatements: true });
    expect(mockConnection.connect).toHaveBeenCalledTimes(1);
  });

  it('should execute queries through the mysql connection', () => {
    const query = 'SELECT 1';
    service['_connection'] = mockConnection as unknown as Connection;

    service.dbQuery(query).subscribe();

    expect(mockConnection.query).toHaveBeenCalledTimes(1);
  });

  it('should trigger reconnect logic on connection loss', async () => {
    spyOn(console, 'log');
    const connectionLostSpy = spyOn(service['_connectionLostSubject'], 'next');
    service['_connection'] = mockConnection as unknown as Connection;
    service['_reconnecting'] = false;

    service['handleConnectionError']({ code: 'PROTOCOL_CONNECTION_LOST' } as QueryError);

    expect(service['_reconnecting']).toBeTrue();
    expect(connectionLostSpy).toHaveBeenCalledWith(false);

    await tickAsync(500);
    expect(mysqlMock.createConnection).toHaveBeenCalledTimes(1);
  });
});

describe('MysqlService (web)', () => {
  let service: MysqlService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        MysqlService,
        { provide: ElectronService, useValue: { isElectron: () => undefined } },
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: WEB_CONFIG },
      ],
    });

    service = TestBed.inject(MysqlService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should connect via HTTP API', () => {
    const config: ConnectionOptions = { host: 'azerothcore.org' };

    service.connect(config).subscribe({
      next: () => expect(service.connectionEstablished).toBeTrue(),
    });

    const request = httpTestingController.expectOne('/api/database/connect');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ config });
    request.flush({ success: true, message: 'connected' });
  });

  it('should proxy queries through the HTTP API', () => {
    const query = 'SELECT 1';

    service.dbQuery(query).subscribe((result) => {
      expect(result.result).toEqual([{ id: 1 }]);
    });

    const request = httpTestingController.expectOne('/api/database/query');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ sql: query, params: [] });
    request.flush({ success: true, result: [{ id: 1 }], fields: [] });
  });

  it('should fetch connection state from the API', () => {
    service.getConnectionStateViaAPI().subscribe((state) => {
      expect(state.state).toBe('CONNECTED');
    });

    const request = httpTestingController.expectOne('/api/database/state');
    expect(request.request.method).toBe('GET');
    request.flush({ state: 'CONNECTED' });
  });
});
