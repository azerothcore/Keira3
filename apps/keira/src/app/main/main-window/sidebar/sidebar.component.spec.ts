import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MockedElectronService, MockedMysqlService, PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { instance } from 'ts-mockito';
import { ConditionsHandlerService } from '../../../features/conditions/conditions-handler.service';
import { CreatureHandlerService } from '../../../features/creature/creature-handler.service';
import { SaiCreatureHandlerService } from '../../../features/creature/sai-creature-handler.service';
import { GameobjectHandlerService } from '../../../features/gameobject/gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../../../features/gameobject/sai-gameobject-handler.service';
import { GossipHandlerService } from '../../../features/gossip/gossip-handler.service';
import { ItemHandlerService } from '../../../features/item/item-handler.service';
import { FishingLootHandlerService } from '../../../features/other-loots/fishing-loot/fishing-loot-handler.service';
import { MailLootHandlerService } from '../../../features/other-loots/mail-loot/mail-loot-handler.service';
import { ReferenceLootHandlerService } from '../../../features/other-loots/reference-loot/reference-loot-handler.service';
import { SpellLootHandlerService } from '../../../features/other-loots/spell-loot/spell-loot-handler.service';
import { QuestHandlerService } from '../../../features/quest/quest-handler.service';
import { SpellHandlerService } from '../../../features/spell/spell-handler.service';
import { SidebarComponent } from './sidebar.component';
import { SidebarModule } from './sidebar.module';
import { SidebarService } from './sidebar.service';
import { ElectronService, LocationService, MysqlService } from '@keira/shared/core';

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
      imports: [SidebarModule, RouterTestingModule, TranslateTestingModule],
      providers: [
        { provide: ElectronService, useValue: instance(MockedElectronService) },
        { provide: MysqlService, useValue: instance(MockedMysqlService) },
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
    component.menuStates.creature = 'down';

    page.clickElement(page.creatureEditorToggle);
    expect(component.menuStates.creature).toBe('up');

    page.clickElement(page.creatureEditorToggle);
    expect(component.menuStates.creature).toBe('down');

    page.removeElement();
  });

  it('collapse all button should correctly work ', () => {
    const { page, component } = setup();
    component.menuStates.creature = 'down';
    component.menuStates.quest = 'down';

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
