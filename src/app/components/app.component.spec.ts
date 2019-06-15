import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SidebarComponent } from './main-window/sidebar/sidebar.component';
import { MainWindowComponent } from './main-window/main-window.component';
import { ElectronService } from '../services/electron.service';
import { instance, reset } from 'ts-mockito';
import { MockedElectronService, MockedMysqlService } from '../test-utils/mocks';
import { MysqlService } from '../services/mysql.service';
import { ConnectionWindowComponent } from './connection-window/connection-window.component';
import { QueryErrorComponent } from './editors/shared/query-output/query-error/query-error.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MainWindowComponent,
        ConnectionWindowComponent,
        AppComponent,
        SidebarComponent,
        QueryErrorComponent,
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        PerfectScrollbarModule,
      ],
      providers: [
        { provide : ElectronService, useValue: instance(MockedElectronService) },
        { provide : MysqlService, useValue: instance(MockedMysqlService) },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    fixture.debugElement.nativeElement.remove();
    reset(MockedElectronService);
    reset(MockedMysqlService);
  });
});
