import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { instance, reset } from 'ts-mockito';

import { AppComponent } from './app.component';
import { SidebarComponent } from './main-window/sidebar/sidebar.component';
import { MainWindowComponent } from './main-window/main-window.component';
import { ElectronService } from '../shared/services/electron.service';
import { MockedElectronService, MockedMysqlService } from '@keira-testing/mocks';
import { MysqlService } from '../shared/services/mysql.service';
import { ConnectionWindowComponent } from './connection-window/connection-window.component';
import { QueryErrorComponent } from '../shared/modules/query-output/query-error/query-error.component';
import { ModalConfirmModule } from '../shared/modules/modal-confirm/modal-confirm.module';
import { LogoutBtnComponent } from './main-window/sidebar/logout-btn/logout-btn.component';
import { LATEST_RELEASE_API_URL } from '@keira-constants/general';
import { version } from '../../../package.json';

describe('AppComponent', () => {

  beforeEach(async(() => {
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
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        PerfectScrollbarModule,
        HttpClientTestingModule,
        ModalConfirmModule,
        ToastrModule.forRoot(),
      ],
      providers: [
        { provide : ElectronService, useValue: instance(MockedElectronService) },
        { provide : MysqlService, useValue: instance(MockedMysqlService) },
      ]
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
      spyOnAllFunctions(toastrService);

      connectionLostSubject.next(false);
      connectionLostSubject.next(false);
      connectionLostSubject.next(false);

      expect(toastrService.success).toHaveBeenCalledTimes(0);
      expect(toastrService.error).toHaveBeenCalledTimes(1);
      expect(toastrService.error).toHaveBeenCalledWith('Database connection lost');
    });

    fit('should correctly react on connectionLost$ [reconnected]', () => {
      const { fixture, connectionLostSubject, toastrService } = setup();
      fixture.detectChanges();
      spyOnAllFunctions(toastrService);

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
      req.flush({ tag_name: `v${version}` });

      httpTestingController.verify();
    });
  });

  afterEach(() => {
    reset(MockedElectronService);
    reset(MockedMysqlService);
  });
});
