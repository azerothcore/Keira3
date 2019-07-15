import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance, reset } from 'ts-mockito';

import { MainWindowComponent } from './main-window.component';
import { ElectronService } from '../../services/electron.service';
import { MockedElectronService, MockedMysqlService } from '../../test-utils/mocks';
import { MysqlService } from '../../services/mysql.service';
import { MainWindowModule } from './main-window.module';

describe('MainWindowComponent', () => {
  let component: MainWindowComponent;
  let fixture: ComponentFixture<MainWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MainWindowModule,
        RouterTestingModule,
      ],
      providers: [
        { provide : ElectronService, useValue: instance(MockedElectronService) },
        { provide : MysqlService, useValue: instance(MockedMysqlService) },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainWindowComponent);
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
