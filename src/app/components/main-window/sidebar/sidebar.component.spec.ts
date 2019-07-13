import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { instance, reset } from 'ts-mockito';

import { SidebarComponent } from './sidebar.component';
import { ElectronService } from '../../../services/electron.service';
import { MockedElectronService, MockedMysqlService } from '../../../test-utils/mocks';
import { MysqlService } from '../../../services/mysql.service';
import { PageObject } from '../../../test-utils/page-object';

class SidebarComponentPage extends PageObject<SidebarComponent> {
  get toggleSidebarBtn() { return this.query<HTMLButtonElement>('.sidebar-button'); }
  get dashboardToggle() { return this.query<HTMLLIElement>('#dashboard-toggle'); }
  get collapseAll() { return this.query<HTMLLIElement>('#collapse-all'); }
  get creatureEditorToggle() { return this.query<HTMLLIElement>('#creature-editor-toggle'); }
}

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
