import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { KEIRA_APP_CONFIG_TOKEN } from '@keira/shared/config';
import { MysqlService } from '@keira/shared/db-layer';
import { ElectronService } from '@keira/shared/common-services';
import { instance, mock } from 'ts-mockito';
import { vi } from 'vitest';
import { webAuth401Interceptor } from './web-auth.interceptor';

describe('webAuth401Interceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let disconnectSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([webAuth401Interceptor])),
        provideHttpClientTesting(),
        MysqlService,
        { provide: ElectronService, useValue: instance(mock(ElectronService)) },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    disconnectSpy = vi.spyOn(TestBed.inject(MysqlService), 'disconnectWeb');
  });

  afterEach(() => httpMock.verify());

  it('disconnects on 401 from /api/database/*', async () => {
    const call = new Promise((resolve) => http.get('/api/database/state').subscribe({ error: resolve }));
    httpMock.expectOne('/api/database/state').flush({ success: false }, { status: 401, statusText: 'Unauthorized' });
    await call;
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });

  it('does not disconnect on 401 from the login endpoint itself', async () => {
    const call = new Promise((resolve) => http.post('/api/auth/login', {}).subscribe({ error: resolve }));
    httpMock.expectOne('/api/auth/login').flush({ success: false }, { status: 401, statusText: 'Unauthorized' });
    await call;
    expect(disconnectSpy).not.toHaveBeenCalled();
  });

  it('disconnects on 401 from a configured non-default API base', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([webAuth401Interceptor])),
        provideHttpClientTesting(),
        MysqlService,
        { provide: ElectronService, useValue: instance(mock(ElectronService)) },
        {
          provide: KEIRA_APP_CONFIG_TOKEN,
          useValue: { production: true, environment: 'DOCKER', sqlitePath: 'assets/sqlite.db', databaseApiUrl: '/keira-api' },
        },
      ],
    });
    const localHttp = TestBed.inject(HttpClient);
    const localMock = TestBed.inject(HttpTestingController);
    const spy = vi.spyOn(TestBed.inject(MysqlService), 'disconnectWeb');

    const call = new Promise((resolve) => localHttp.get('/keira-api/state').subscribe({ error: resolve }));
    localMock.expectOne('/keira-api/state').flush({ success: false }, { status: 401, statusText: 'Unauthorized' });
    await call;

    expect(spy).toHaveBeenCalledTimes(1);
    localMock.verify();
  });

  it('does not disconnect on non-401 errors or non-API urls', async () => {
    const apiCall = new Promise((resolve) => http.get('/api/database/state').subscribe({ error: resolve }));
    httpMock.expectOne('/api/database/state').flush({}, { status: 500, statusText: 'Server Error' });
    await apiCall;

    const otherCall = new Promise((resolve) => http.get('/assets/x.json').subscribe({ error: resolve }));
    httpMock.expectOne('/assets/x.json').flush({}, { status: 401, statusText: 'Unauthorized' });
    await otherCall;

    expect(disconnectSpy).not.toHaveBeenCalled();
  });
});
