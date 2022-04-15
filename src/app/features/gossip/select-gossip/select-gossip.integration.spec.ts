import { TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SelectPageObject } from '@keira-testing/select-page-object';
import { GossipMenu } from '@keira-types/gossip-menu.type';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { GossipHandlerService } from '../gossip-handler.service';
import { SelectGossipComponent } from './select-gossip.component';
import { SelectGossipModule } from './select-gossip.module';
import { SelectGossipService } from './select-gossip.service';

class SelectGossipComponentPage extends SelectPageObject<SelectGossipComponent> {
  ID_FIELD = 'MenuID';
}

describe('SelectGossip integration tests', () => {
  const value = 1200;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ToastrModule.forRoot(), ModalModule.forRoot(), SelectGossipModule, RouterTestingModule],
        providers: [GossipHandlerService],
      }).compileComponents();
    }),
  );

  function setup() {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([{ max: 1 }]));

    const selectService = TestBed.inject(SelectGossipService);

    const fixture = TestBed.createComponent(SelectGossipComponent);
    const page = new SelectGossipComponentPage(fixture);
    const component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { navigateSpy, queryService, querySpy, selectService, fixture, page, component };
  }

  it(
    'should correctly initialise',
    waitForAsync(async () => {
      const { fixture, page, querySpy, component } = setup();
      await fixture.whenStable();
      expect(page.createInput.value).toEqual(`${component.customStartingId}`);
      page.expectNewEntityFree();
      expect(querySpy).toHaveBeenCalledWith('SELECT MAX(MenuID) AS max FROM gossip_menu;');
      expect(page.queryWrapper.innerText).toContain('SELECT * FROM `gossip_menu` LIMIT 50');
    }),
  );

  it(
    'should correctly behave when inserting and selecting free id',
    waitForAsync(async () => {
      const { fixture, page, querySpy, navigateSpy } = setup();
      await fixture.whenStable();
      querySpy.calls.reset();
      querySpy.and.returnValue(of([]));

      page.setInputValue(page.createInput, value);

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`gossip_menu\` WHERE (MenuID = ${value})`);
      page.expectNewEntityFree();

      page.clickElement(page.selectNewBtn);

      expect(navigateSpy).toHaveBeenCalledTimes(1);
      expect(navigateSpy).toHaveBeenCalledWith(['gossip/gossip-menu']);
      page.expectTopBarCreatingNew(value);
    }),
  );

  it(
    'should correctly behave when inserting an existing entity',
    waitForAsync(async () => {
      const { fixture, page, querySpy } = setup();
      await fixture.whenStable();
      querySpy.calls.reset();
      querySpy.and.returnValue(of(['mock value'] as any));

      page.setInputValue(page.createInput, value);

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`gossip_menu\` WHERE (MenuID = ${value})`);
      page.expectEntityAlreadyInUse();
    }),
  );

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
      querySpy.calls.reset();
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
    querySpy.calls.reset();
    querySpy.and.returnValue(of(results));

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
});
