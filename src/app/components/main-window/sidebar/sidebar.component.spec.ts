import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { instance, reset } from 'ts-mockito';
import { RouterTestingModule } from '@angular/router/testing';

import { SidebarComponent } from './sidebar.component';
import { ElectronService } from '../../../services/electron.service';
import { MockedElectronService, MockedMysqlService } from '../../../test-utils/mocks';
import { MysqlService } from '../../../services/mysql.service';
import { PageObject } from '../../../test-utils/page-object';
import { SidebarService } from './sidebar.service';
import { SidebarModule } from './sidebar.module';

class SidebarComponentPage extends PageObject<SidebarComponent> {
  get toggleSidebarBtn() { return this.query<HTMLButtonElement>('.sidebar-button'); }
  get collapseAll() { return this.query<HTMLAnchorElement>('#collapse-all'); }
  get creatureEditorToggle() { return this.query<HTMLAnchorElement>('#creature-editor-toggle'); }
}

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let page: SidebarComponentPage;
  let sidebarService: SidebarService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SidebarModule,
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
    sidebarService = TestBed.get(SidebarService);

    fixture = TestBed.createComponent(SidebarComponent);
    page = new SidebarComponentPage(fixture);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('clicking the toggle button should correctly change the toggled status', () => {
    sidebarService.setSidebarState(false);

    page.clickElement(page.toggleSidebarBtn);
    expect(sidebarService.getSidebarState()).toBe(true);

    page.clickElement(page.toggleSidebarBtn);
    expect(sidebarService.getSidebarState()).toBe(false);
  });

  it('toggling a section should correctly work', () => {
    component.menuStates.creature = 'down';

    page.clickElement(page.creatureEditorToggle);
    expect(component.menuStates.creature).toBe('up');

    page.clickElement(page.creatureEditorToggle);
    expect(component.menuStates.creature).toBe('down');
  });

  it('collapse all button should correctly work ', () => {
    component.menuStates.creature = 'down';
    component.menuStates.quest = 'down';

    page.clickElement(page.collapseAll);

    for (const key in component.menuStates) {
      if (component.menuStates.hasOwnProperty(key)) {
        expect(component.menuStates[key]).toEqual('up');
      }
    }
  });

  afterEach(() => {
    fixture.debugElement.nativeElement.remove();
    reset(MockedElectronService);
    reset(MockedMysqlService);
  });
});
