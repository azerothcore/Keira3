import { EditorSettingsService } from '@keira/shared/common-services';
import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { GossipMenu } from '@keira/shared/acore-world-model';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { GossipHandlerService } from '../gossip-handler.service';
import { SelectGossipComponent } from './select-gossip.component';
import { SelectGossipService } from './select-gossip.service';

class SelectGossipComponentPage extends SelectPageObject<SelectGossipComponent> {
  override ID_FIELD = 'MenuID';
}

describe('SelectGossip integration tests', () => {
  const value = 1200;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, SelectGossipComponent, TranslateTestingModule],
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), GossipHandlerService],
    }).compileComponents();
  });

  function setup() {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(() => undefined);
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([{ max: 1 }]));

    const selectService = TestBed.inject(SelectGossipService);

    const fixture = TestBed.createComponent(SelectGossipComponent);
    const page = new SelectGossipComponentPage(fixture);
    const component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { navigateSpy, queryService, querySpy, selectService, fixture, page, component };
  }

  it('should correctly initialise', async () => {
    const { fixture, page, querySpy, component } = setup();
    await fixture.whenStable();
    expect(page.createInput.value).toEqual(`${component.customStartingId}`);
    page.expectNewEntityFree();
    expect(querySpy).toHaveBeenCalledWith('SELECT MAX(MenuID) AS max FROM gossip_menu;');
    expect(page.queryWrapper.innerText).toContain('SELECT * FROM `gossip_menu` LIMIT 50');
  });

  it('should correctly behave when inserting and selecting free id', async () => {
    const { fixture, page, querySpy, navigateSpy } = setup();
    await fixture.whenStable();
    querySpy.mockClear();
    querySpy.mockReturnValue(of([]));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`gossip_menu\` WHERE (MenuID = ${value})`);
    page.expectNewEntityFree();

    page.clickElement(page.selectNewBtn);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['gossip/gossip-menu']);
    page.expectTopBarCreatingNew(value);
  });

  it('should correctly behave when inserting an existing entity', async () => {
    const { fixture, page, querySpy } = setup();
    await fixture.whenStable();
    querySpy.mockClear();
    querySpy.mockReturnValue(of(['mock value'] as any));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`gossip_menu\` WHERE (MenuID = ${value})`);
    page.expectEntityAlreadyInUse();
  });

  for (const { testId, MenuID, TextID, limit, expectedQuery } of [
    {
      testId: 1,
      MenuID: 1200,
      TextID: 123,
      limit: '100',
      expectedQuery: "SELECT * FROM `gossip_menu` WHERE (`MenuID` LIKE '%1200%') AND (`TextID` LIKE '%123%') LIMIT 100",
    },
    {
      testId: 2,
      MenuID: '',
      TextID: 123,
      limit: '100',
      expectedQuery: "SELECT * FROM `gossip_menu` WHERE (`TextID` LIKE '%123%') LIMIT 100",
    },
    {
      testId: 3,
      MenuID: 1200,
      TextID: '',
      limit: '',
      expectedQuery: "SELECT * FROM `gossip_menu` WHERE (`MenuID` LIKE '%1200%')",
    },
  ]) {
    it(`searching an existing entity should correctly work [${testId}]`, () => {
      const { page, querySpy } = setup();
      querySpy.mockClear();
      // Note: this is different than in other editors
      if (MenuID) {
        page.setInputValue(page.searchIdInput, MenuID);
      }
      if (TextID) {
        page.setInputValue(page.searchNameInput, TextID);
      }
      page.setInputValue(page.searchLimitInput, limit);

      expect(page.queryWrapper.innerText).toContain(expectedQuery);

      page.clickElement(page.searchBtn);

      expect(querySpy).toHaveBeenCalled();
      expect(querySpy).toHaveBeenCalledWith(expectedQuery);
    });
  }

  it('searching and selecting an existing entity from the datatable should correctly work', () => {
    const { navigateSpy, page, querySpy } = setup();
    const results: GossipMenu[] = [
      { MenuID: 1, TextID: 1 },
      { MenuID: 1, TextID: 2 },
      { MenuID: 1, TextID: 3 },
    ];
    querySpy.mockClear();
    querySpy.mockReturnValue(of(results));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRowExternal(0);
    const row1 = page.getDatatableRowExternal(1);
    const row2 = page.getDatatableRowExternal(2);

    expect(row0.innerText).toContain(`${results[0].TextID}`);
    expect(row1.innerText).toContain(`${results[1].TextID}`);
    expect(row2.innerText).toContain(`${results[2].TextID}`);

    page.clickElement(page.getDatatableCellExternal(1, 1));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['gossip/gossip-menu']);
    // Note: this is different than in other editors
    expect(page.topBar.innerText).toContain(`Editing: gossip_menu (${results[1].MenuID})`);
  });

  it('searches the menus by the texts they show, through npc_text', async () => {
    const { fixture, page } = setup();
    await fixture.whenStable();
    page.setInputValueById('text0_0', "Greetings, it's");
    expect(page.queryWrapper.innerText).toContain(
      "SELECT * FROM `gossip_menu` WHERE (`TextID` IN (SELECT `ID` FROM `npc_text` WHERE `text0_0` LIKE '%Greetings, it\\'s%')) LIMIT 50",
    );
    page.setInputValueById('search-id', 12);
    page.setInputValueById('text0_1', 'traveller');
    expect(page.queryWrapper.innerText).toContain(
      "WHERE (`MenuID` LIKE '%12%') AND (`TextID` IN (SELECT `ID` FROM `npc_text` WHERE `text0_0` LIKE '%Greetings, it\\'s%' AND `text0_1` LIKE '%traveller%'))",
    );
    page.setInputValueById('limit', '');
    expect(page.queryWrapper.innerText).not.toContain('LIMIT');
  });

  it('searches numbers and texts exactly when set so', async () => {
    const { fixture, page } = setup();
    await fixture.whenStable();
    TestBed.inject(EditorSettingsService).saveSearch('gossip_menu', { exactNumbers: true, exactNames: true });
    page.setInputValueById('search-id', 12);
    page.setInputValueById('text0_0', 'Hello');
    expect(page.queryWrapper.innerText).toContain(
      "WHERE (`MenuID` = '12') AND (`TextID` IN (SELECT `ID` FROM `npc_text` WHERE `text0_0` = 'Hello'))",
    );
    localStorage.clear();
  });
});
