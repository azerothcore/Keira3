import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SidebarComponent } from './sidebar.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ElectronService } from '../../../services/electron.service';
import { instance, reset } from 'ts-mockito';
import { MockedElectronService, MockedMysqlService } from '../../../test-utils/mocks';
import { MysqlService } from '../../../services/mysql.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SidebarComponent,
      ],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        PerfectScrollbarModule,
      ],
      providers: [
        { provide : ElectronService, useValue: instance(MockedElectronService) },
        { provide : MysqlService, useValue: instance(MockedMysqlService) },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
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
