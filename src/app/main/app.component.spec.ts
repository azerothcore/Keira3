import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SidebarComponent } from './main-window/sidebar/sidebar.component';
import { MainWindowComponent } from './main-window/main-window.component';
import { ElectronService } from '../shared/services/electron.service';
import { instance, reset } from 'ts-mockito';
import { MockedElectronService, MockedMysqlService } from '@keira-testing/mocks';
import { MysqlService } from '../shared/services/mysql.service';
import { ConnectionWindowComponent } from './connection-window/connection-window.component';
import { QueryErrorComponent } from '../shared/modules/query-output/query-error/query-error.component';
import { ModalConfirmModule } from '../shared/modules/modal-confirm/modal-confirm.module';
import { LogoutBtnComponent } from './main-window/sidebar/logout-btn/logout-btn.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

fdescribe('AppComponent', () => {

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
        HttpClientModule,
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

    const subject = new Subject<boolean>();
    // @ts-ignore
    TestBed.inject(MysqlService)['connectionLost$'] = subject.asObservable();

    fixture.detectChanges();

    return { fixture, component, subject, toastrService };
  };

  it('should correctly react on connectionLost$ [connection lost]', () => {
    const { toastrService, subject } = setup();
    spyOnAllFunctions(toastrService);

    subject.next(false);
    subject.next(false);
    subject.next(false);

    expect(toastrService.success).toHaveBeenCalledTimes(0);
    expect(toastrService.error).toHaveBeenCalledTimes(1);
    expect(toastrService.error).toHaveBeenCalledWith('Database connection lost');
  });

  it('should correctly react on connectionLost$ [reconnected]', () => {
    const { subject, toastrService } = setup();
    spyOnAllFunctions(toastrService);

    subject.next(true);

    expect(toastrService.error).toHaveBeenCalledTimes(0);
    expect(toastrService.success).toHaveBeenCalledTimes(1);
    expect(toastrService.success).toHaveBeenCalledWith('Database reconnected');
  });

  afterEach(() => {
    reset(MockedElectronService);
    reset(MockedMysqlService);
  });
});
