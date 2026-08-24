import { vi } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { LATEST_RELEASE_API_URL } from '@keira/shared/constants';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { Observable, Subject, of } from 'rxjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import packageInfo from '../../../../package.json';

import { AppComponent } from './app.component';

import { BsDropdownDirective, BsDropdownMenuDirective, BsDropdownToggleDirective } from 'ngx-bootstrap/dropdown';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { MainWindowComponent } from '@keira/main/main-window';
import { ConnectionWindowComponent, LoginWindowComponent } from '@keira/main/connection-window';
import { ModalConfirmComponent, QueryErrorComponent } from '@keira/shared/base-editor-components';
import { ElectronService } from '@keira/shared/common-services';
import { MysqlService } from '@keira/shared/db-layer';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BsDropdownDirective,
        BsDropdownToggleDirective,
        BsDropdownMenuDirective,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        ModalConfirmComponent,
        ToastrModule.forRoot(),
        TranslateTestingModule,
        MainWindowComponent,
        ConnectionWindowComponent,
        LoginWindowComponent,
        QueryErrorComponent,
        AppComponent,
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: ElectronService, useValue: instance(mock(ElectronService)) },
        { provide: MysqlService, useValue: instance(mock(MysqlService)) },
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  const setup = () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const toastrService: ToastrService = TestBed.inject(ToastrService);
    const httpTestingController = TestBed.inject(HttpTestingController);

    const connectionLostSubject = new Subject<boolean>();
    (TestBed.inject(MysqlService) as { connectionLost$: Observable<boolean> }).connectionLost$ = connectionLostSubject.asObservable();

    return { fixture, component, connectionLostSubject, toastrService, httpTestingController };
  };

  describe('handleConnectionLostAlerts', () => {
    it('should correctly react on connectionLost$ [connection lost]', () => {
      const { fixture, toastrService, connectionLostSubject } = setup();
      fixture.detectChanges();
      vi.spyOn(toastrService, 'success').mockImplementation(() => undefined);
      vi.spyOn(toastrService, 'error').mockImplementation(() => undefined);

      connectionLostSubject.next(false);
      connectionLostSubject.next(false);
      connectionLostSubject.next(false);

      expect(toastrService.success).toHaveBeenCalledTimes(0);
      expect(toastrService.error).toHaveBeenCalledTimes(1);
      expect(toastrService.error).toHaveBeenCalledWith('Database connection lost');
    });

    it('should correctly react on connectionLost$ [reconnected]', () => {
      const { fixture, connectionLostSubject, toastrService } = setup();
      fixture.detectChanges();
      vi.spyOn(toastrService, 'success').mockImplementation(() => undefined);
      vi.spyOn(toastrService, 'error').mockImplementation(() => undefined);

      connectionLostSubject.next(true);

      expect(toastrService.error).toHaveBeenCalledTimes(0);
      expect(toastrService.success).toHaveBeenCalledTimes(1);
      expect(toastrService.success).toHaveBeenCalledWith('Database reconnected');
    });
  });

  describe('handleNewerVersionAlert', () => {
    it('should correctly query and show the alert when the latest version is different than the current one', () => {
      const { fixture, httpTestingController } = setup();

      fixture.detectChanges();

      const req = httpTestingController.expectOne(LATEST_RELEASE_API_URL);
      expect(req.request.method).toEqual('GET');
      req.flush({ tag_name: 'some newer version' });

      httpTestingController.verify();
    });

    it('should correctly query and NOT show the alert when the latest version the same as the current one', () => {
      const { fixture, httpTestingController } = setup();

      fixture.detectChanges();

      const req = httpTestingController.expectOne(LATEST_RELEASE_API_URL);
      expect(req.request.method).toEqual('GET');
      req.flush({ tag_name: `v${packageInfo.version}` });

      httpTestingController.verify();
    });

    it('should set showNewerVersionAlert to false when the fa-xmark button is clicked', async () => {
      const { fixture, httpTestingController, component } = setup();
      fixture.detectChanges();
      const req = httpTestingController.expectOne(LATEST_RELEASE_API_URL);
      req.flush({ tag_name: 'some newer version' });
      await fixture.whenStable();
      fixture.detectChanges();

      // Check if the alert is shown with the close button
      expect(component.showNewerVersionAlert).toBe(true);
      const closeBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector('.newer-version-alert .fa-xmark').closest('button');
      expect(closeBtn).toBeTruthy();

      // click the close button
      closeBtn!.click();
      fixture.detectChanges();

      // the alert should be hidden now
      expect(component.showNewerVersionAlert).toBe(false);
    });
  });

  describe('web environment', () => {
    // The outer beforeEach already provides KEIRA_APP_CONFIG_TOKEN with the (non-web) KEIRA_MOCK_CONFIG
    // and has already compiled the testing module. TestBed.overrideProvider() after compileComponents()
    // is unreliable, so these tests reconfigure their own TestBed instance instead of overriding the outer one.
    // ts-mockito's mock(MysqlService) instance proxies `connectionEstablished` as a non-configurable getter,
    // which vi.spyOn(..., 'get') cannot redefine. These tests need to flip that flag from within a
    // `connectWeb` mock implementation, so they use a plain object mock instead (same pattern already used
    // for LoginConfigService elsewhere in this codebase).
    const setupWebEnvironment = () => {
      TestBed.resetTestingModule();
      const mysqlServiceMock = {
        connectionEstablished: false,
        connectionLost$: new Subject<boolean>().asObservable(),
        webSessionExpired$: new Subject<void>().asObservable(),
        connectWeb: vi.fn(),
      };
      TestBed.configureTestingModule({
        imports: [
          BsDropdownDirective,
          BsDropdownToggleDirective,
          BsDropdownMenuDirective,
          FormsModule,
          ReactiveFormsModule,
          RouterTestingModule,
          ModalConfirmComponent,
          ToastrModule.forRoot(),
          TranslateTestingModule,
          MainWindowComponent,
          ConnectionWindowComponent,
          LoginWindowComponent,
          QueryErrorComponent,
          AppComponent,
        ],
        providers: [
          provideZonelessChangeDetection(),
          provideNoopAnimations(),
          { provide: ElectronService, useValue: instance(mock(ElectronService)) },
          { provide: MysqlService, useValue: mysqlServiceMock },
          {
            provide: KEIRA_APP_CONFIG_TOKEN,
            useValue: { production: true, environment: 'DOCKER', sqlitePath: 'assets/sqlite.db', databaseApiUrl: '/api/database' },
          },
          provideHttpClient(withInterceptorsFromDi()),
          provideHttpClientTesting(),
        ],
      }).compileComponents();

      return { mysqlService: TestBed.inject(MysqlService) as unknown as typeof mysqlServiceMock };
    };

    it('renders the login window instead of the connection window when web-like and not connected', () => {
      const { mysqlService } = setupWebEnvironment();
      mysqlService.connectWeb.mockReturnValue(of(false));

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();

      const html: HTMLElement = fixture.nativeElement;
      expect(html.querySelector('keira-login-window')).toBeTruthy();
      expect(html.querySelector('keira-connection-window')).toBeFalsy();
    });

    it('probes the session on startup and shows the main window when it succeeds', async () => {
      const { mysqlService } = setupWebEnvironment();
      mysqlService.connectWeb.mockImplementation(() => {
        mysqlService.connectionEstablished = true;
        return of(true);
      });

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(mysqlService.connectWeb).toHaveBeenCalled();
      expect((fixture.nativeElement as HTMLElement).querySelector('keira-main-window')).toBeTruthy();
    });

    it('keeps the connection window for non-web environments', () => {
      // default outer TestBed config: KEIRA_MOCK_CONFIG = LOCAL (non-web)
      const { fixture } = setup();
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).querySelector('keira-connection-window')).toBeTruthy();
    });

    it('does not run the newer-version release check in web environments', () => {
      // The fork's -dev version never equals the latest release tag, so in a
      // server-managed web deployment the banner would always show and never be actionable.
      const { mysqlService } = setupWebEnvironment();
      mysqlService.connectWeb.mockReturnValue(of(false));

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();

      TestBed.inject(HttpTestingController).expectNone(LATEST_RELEASE_API_URL);
      expect(fixture.componentInstance.showNewerVersionAlert).toBe(false);
    });
  });
});
