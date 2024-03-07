import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { LATEST_RELEASE_API_URL } from '@keira/shared/constants';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { instance, reset } from 'ts-mockito';
// eslint-disable-next-line @nx/enforce-module-boundaries
import packageInfo from '../../../../../package.json';

import { AppComponent } from './app.component';
import { ConnectionWindowComponent } from './connection-window/connection-window.component';
import { MainWindowComponent } from './main-window/main-window.component';
import { LogoutBtnComponent } from './main-window/sidebar/logout-btn/logout-btn.component';
import { SidebarComponent } from './main-window/sidebar/sidebar.component';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import {
  ElectronService,
  MockedElectronService,
  MockedMysqlService,
  ModalConfirmModule,
  MysqlService,
  QueryErrorComponent,
  SwitchLanguageModule,
} from '@keira/shared/core';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        MainWindowComponent,
        ConnectionWindowComponent,
        AppComponent,
        SidebarComponent,
        QueryErrorComponent,
        LogoutBtnComponent,
      ],
      imports: [
        BsDropdownModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        ModalConfirmModule,
        SwitchLanguageModule,
        ToastrModule.forRoot(),
        TranslateTestingModule,
      ],
      providers: [
        { provide: ElectronService, useValue: instance(MockedElectronService) },
        { provide: MysqlService, useValue: instance(MockedMysqlService) },
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
      ],
    }).compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const toastrService: ToastrService = TestBed.inject(ToastrService);
    const httpTestingController = TestBed.inject(HttpTestingController);

    const connectionLostSubject = new Subject<boolean>();
    // @ts-ignore
    TestBed.inject(MysqlService)['connectionLost$'] = connectionLostSubject.asObservable();

    return { fixture, component, connectionLostSubject, toastrService, httpTestingController };
  };

  describe('handleConnectionLostAlerts', () => {
    it('should correctly react on connectionLost$ [connection lost]', () => {
      const { fixture, toastrService, connectionLostSubject } = setup();
      fixture.detectChanges();
      spyOn(toastrService, 'success');
      spyOn(toastrService, 'error');

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
      spyOn(toastrService, 'success');
      spyOn(toastrService, 'error');

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
  });

  afterEach(() => {
    reset(MockedElectronService);
    reset(MockedMysqlService);
  });
});
