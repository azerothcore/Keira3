import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { instance, reset } from 'ts-mockito';
import { RouterTestingModule } from '@angular/router/testing';

import { SidebarComponent } from './sidebar.component';
import { ElectronService } from '@keira-shared/services/electron.service';
import { MockedElectronService, MockedMysqlService } from '@keira-testing/mocks';
import { MysqlService } from '@keira-shared/services/mysql.service';
import { PageObject } from '@keira-testing/page-object';
import { SidebarService } from './sidebar.service';
import { SidebarModule } from './sidebar.module';
import { LocationService } from '@keira-shared/services/location.service';
import { CreatureHandlerService } from '../../../features/creature/creature-handler.service';
import { SaiCreatureHandlerService } from '../../../features/creature/sai-creature-handler.service';
import { QuestHandlerService } from '../../../features/quest/quest-handler.service';
import { ItemHandlerService } from '../../../features/item/item-handler.service';
import { GameobjectHandlerService } from '../../../features/gameobject/gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../../../features/gameobject/sai-gameobject-handler.service';
import { GossipHandlerService } from '../../../features/gossip/gossip-handler.service';
import { ConditionsHandlerService } from '../../../features/conditions/conditions-handler.service';

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
        CreatureHandlerService,
        SaiCreatureHandlerService,
        QuestHandlerService,
        ItemHandlerService,
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
        GossipHandlerService,
        ConditionsHandlerService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    sidebarService = TestBed.inject(SidebarService);

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

  it('reload the app on logout', () => {
    const reloadSpy = spyOn(TestBed.inject(LocationService), 'reload');

    component.logout();

    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    fixture.debugElement.nativeElement.remove();
    reset(MockedElectronService);
    reset(MockedMysqlService);
  });
});
