import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { instance, mock } from 'ts-mockito';
import { ConditionsHandlerService } from '@keira/features/conditions';
import { CreatureHandlerService, SaiCreatureHandlerService } from '@keira/features/creature';
import { GameobjectHandlerService, SaiGameobjectHandlerService } from '@keira/features/gameobject';
import { GossipHandlerService } from '@keira/features/gossip';
import { ItemHandlerService } from '@keira/features/item';
import {
  FishingLootHandlerService,
  MailLootHandlerService,
  ReferenceLootHandlerService,
  SpellLootHandlerService,
} from '@keira/features/other-loots';
import { QuestHandlerService } from '@keira/features/quest';
import { SpellHandlerService } from '@keira/features/spell';
import { SidebarComponent } from './sidebar.component';
import { SidebarService } from './sidebar.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MysqlService } from '@keira/shared/db-layer';
import { ElectronService, LocationService } from '@keira/shared/common-services';

class SidebarComponentPage extends PageObject<SidebarComponent> {
  get toggleSidebarBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('.sidebar-button');
  }
  get collapseAll(): HTMLAnchorElement {
    return this.query<HTMLAnchorElement>('#collapse-all');
  }
  get creatureEditorToggle(): HTMLAnchorElement {
    return this.query<HTMLAnchorElement>('#creature-editor-toggle');
  }
}

describe('SidebarComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, SidebarComponent, RouterTestingModule, TranslateTestingModule],
      providers: [
        { provide: ElectronService, useValue: instance(mock(ElectronService)) },
        { provide: MysqlService, useValue: instance(mock(MysqlService)) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        QuestHandlerService,
        ItemHandlerService,
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
        GossipHandlerService,
        ConditionsHandlerService,
        ReferenceLootHandlerService,
        SpellLootHandlerService,
        FishingLootHandlerService,
        MailLootHandlerService,
        SpellHandlerService,
      ],
    }).compileComponents();
  }));

  const setup = () => {
    const sidebarService = TestBed.inject(SidebarService);

    const fixture = TestBed.createComponent(SidebarComponent);
    const page = new SidebarComponentPage(fixture);
    const component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { sidebarService, fixture, page, component };
  };

  it('clicking the toggle button should correctly change the toggled status', () => {
    const { sidebarService, page } = setup();
    sidebarService.setSidebarState(false);

    page.clickElement(page.toggleSidebarBtn);
    expect(sidebarService.getSidebarState()).toBe(true);

    page.clickElement(page.toggleSidebarBtn);
    expect(sidebarService.getSidebarState()).toBe(false);

    page.removeElement();
  });

  it('toggling a section should correctly work', () => {
    const { page, component } = setup();
    component.menuStates['creature'] = 'down';

    page.clickElement(page.creatureEditorToggle);
    expect(component.menuStates['creature']).toBe('up');

    page.clickElement(page.creatureEditorToggle);
    expect(component.menuStates['creature']).toBe('down');

    page.removeElement();
  });

  it('collapse all button should correctly work ', () => {
    const { page, component } = setup();
    component.menuStates['creature'] = 'down';
    component.menuStates['quest'] = 'down';

    page.clickElement(page.collapseAll);

    for (const key of Object.keys(component.menuStates)) {
      expect(component.menuStates[key]).toEqual('up');
    }

    page.removeElement();
  });

  it('reload the app on logout', () => {
    const { page, component } = setup();
    const reloadSpy = spyOn(TestBed.inject(LocationService), 'reload');

    component.logout();

    expect(reloadSpy).toHaveBeenCalledTimes(1);

    page.removeElement();
  });
});
