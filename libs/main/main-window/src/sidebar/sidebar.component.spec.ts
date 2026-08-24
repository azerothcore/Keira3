import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter, Router } from '@angular/router';

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
import { provideHttpClient } from '@angular/common/http';
import { SidebarComponent } from './sidebar.component';
import { SidebarService } from './sidebar.service';
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
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidebarComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        provideHttpClient(),
        provideRouter([
          { path: 'conditions/select', children: [] },
          { path: 'creature/select', children: [] },
          { path: 'sql-editor', children: [] },
        ]),
        provideLocationMocks(),
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
  });

  const setup = () => {
    const sidebarService = TestBed.inject(SidebarService);

    const fixture = TestBed.createComponent(SidebarComponent);
    const page = new SidebarComponentPage(fixture);
    const component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { sidebarService, fixture, page, component };
  };

  it('shows the logout button even when no mysql config is present (web mode)', () => {
    const { fixture, page } = setup();

    expect(fixture.nativeElement.querySelector('keira-logout-btn')).toBeTruthy();

    page.removeNativeElement();
  });

  it('clicking the toggle button should correctly change the toggled status', () => {
    const { sidebarService, page } = setup();
    sidebarService.setSidebarState(false);

    page.clickElement(page.toggleSidebarBtn);
    expect(sidebarService.getSidebarState()).toBe(true);

    page.clickElement(page.toggleSidebarBtn);
    expect(sidebarService.getSidebarState()).toBe(false);

    page.removeNativeElement();
  });

  it('toggling a section should correctly work', () => {
    const { page, component } = setup();
    component.menuStates['creature'] = 'down';

    page.clickElement(page.creatureEditorToggle);
    expect(component.menuStates['creature']).toBe('up');

    page.clickElement(page.creatureEditorToggle);
    expect(component.menuStates['creature']).toBe('down');

    page.removeNativeElement();
  });

  it('collapse all button should correctly work ', () => {
    const { page, component } = setup();
    component.menuStates['creature'] = 'down';
    component.menuStates['quest'] = 'down';

    page.clickElement(page.collapseAll);

    for (const key of Object.keys(component.menuStates)) {
      expect(component.menuStates[key as keyof typeof component.menuStates]).toEqual('up');
    }

    page.removeNativeElement();
  });

  it('navigating to an editor should expand the menu listing it', async () => {
    const { page, component, fixture } = setup();
    const router = TestBed.inject(Router);
    expect(component.menuStates['conditions']).toBe('up');

    await router.navigateByUrl('/conditions/select?sourceType=19&sourceEntry=42');
    await fixture.whenStable();

    expect(component.menuStates['conditions']).toBe('down');

    await router.navigateByUrl('/creature/select');
    await fixture.whenStable();

    expect(component.menuStates['creature']).toBe('down');

    page.removeNativeElement();
  });

  it('navigating to a route without a menu should leave the sections alone', async () => {
    const { page, component, fixture } = setup();

    await TestBed.inject(Router).navigateByUrl('/sql-editor');
    await fixture.whenStable();

    for (const key of Object.keys(component.menuStates)) {
      expect(component.menuStates[key as keyof typeof component.menuStates]).toEqual('up');
    }

    page.removeNativeElement();
  });

  it('reload the app on logout', () => {
    const { page, component } = setup();
    const reloadSpy = vi.spyOn(TestBed.inject(LocationService), 'reload').mockImplementation(() => undefined);

    component.logout();

    expect(reloadSpy).toHaveBeenCalledTimes(1);

    page.removeNativeElement();
  });
});
