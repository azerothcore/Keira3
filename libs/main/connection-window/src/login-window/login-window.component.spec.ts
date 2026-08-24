import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { instance, mock } from 'ts-mockito';
import { WebAuthService } from '@keira/shared/login-config';
import { MysqlService } from '@keira/shared/db-layer';
import { ElectronService } from '@keira/shared/common-services';
import { LoginWindowComponent } from './login-window.component';

describe('LoginWindowComponent', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        provideHttpClient(),
        MysqlService,
        { provide: ElectronService, useValue: instance(mock(ElectronService)) },
      ],
    });
    const webAuthService = TestBed.inject(WebAuthService);
    const mysqlService = TestBed.inject(MysqlService);
    const fixture = TestBed.createComponent(LoginWindowComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component, webAuthService, mysqlService };
  }

  it('logs in and connects on success', () => {
    const { component, webAuthService, mysqlService } = setup();
    vi.spyOn(webAuthService, 'login').mockReturnValue(of({ success: true }));
    const connectSpy = vi.spyOn(mysqlService, 'connectWeb').mockReturnValue(of(true));

    component.form.setValue({ username: 'admin', password: 'pw' });
    component.onLogin();

    expect(webAuthService.login).toHaveBeenCalledWith('admin', 'pw');
    expect(connectSpy).toHaveBeenCalled();
    expect(component.error).toBeUndefined();
    expect(component.loading).toBe(false);
  });

  it('shows an invalid-credentials error on 401', () => {
    const { component, webAuthService } = setup();
    vi.spyOn(webAuthService, 'login').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })));

    component.form.setValue({ username: 'admin', password: 'bad' });
    component.onLogin();

    expect(component.error).toBe('Invalid username or password.');
    expect(component.loading).toBe(false);
  });

  it('shows a generic error when the server is unreachable', () => {
    const { component, webAuthService } = setup();
    vi.spyOn(webAuthService, 'login').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0, statusText: 'Unknown' })));

    component.onLogin();

    expect(component.error).toBe('Unable to reach the server. Please try again.');
  });

  it('reports a database problem when login succeeds but the pool is down', () => {
    const { component, webAuthService, mysqlService } = setup();
    vi.spyOn(webAuthService, 'login').mockReturnValue(of({ success: true }));
    vi.spyOn(mysqlService, 'connectWeb').mockReturnValue(of(false));

    component.onLogin();

    expect(component.error).toBe('Logged in, but the database is not reachable.');
  });
});
