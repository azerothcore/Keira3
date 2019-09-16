import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QueryService } from '../../../../services/query.service';
import { SelectGossipComponent } from './select-gossip.component';
import { GossipSelectService } from '../../../../services/select/gossip-select.service';
import { SelectGossipModule } from './select-gossip.module';
import { GossipMenu } from '../../../../types/gossip-menu.type';
import { SelectPageObject } from '../../../../test-utils/select-page-object';

class SelectGossipComponentPage extends SelectPageObject<SelectGossipComponent> {
  ID_FIELD = 'MenuID';
}

describe('SelectGossip integration tests', () => {
  let component: SelectGossipComponent;
  let fixture: ComponentFixture<SelectGossipComponent>;
  let selectService: GossipSelectService;
  let page: SelectGossipComponentPage;
  let queryService: QueryService;
  let querySpy: Spy;
  let navigateSpy: Spy;

  const value = 1200;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SelectGossipModule,
        RouterTestingModule,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    navigateSpy = spyOn(TestBed.get(Router), 'navigate');
    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of(
      { results: [{ max: 1 }] }
    ));

    selectService = TestBed.get(GossipSelectService);

    fixture = TestBed.createComponent(SelectGossipComponent);
    page = new SelectGossipComponentPage(fixture);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('should correctly initialise', async(() => {
    fixture.whenStable().then(() => {
      expect(page.createInput.value).toEqual(`${component.customStartingId}`);
      page.expectNewEntityFree();
      expect(querySpy).toHaveBeenCalledWith(
        'SELECT MAX(MenuID) AS max FROM gossip_menu;'
      );
      expect(page.queryWrapper.innerText).toContain(
        'SELECT * FROM `gossip_menu` LIMIT 100'
      );
    });
  }));

  it('should correctly behave when inserting and selecting free id', async(() => {
    fixture.whenStable().then(() => {
      querySpy.calls.reset();
      querySpy.and.returnValue(of(
        { results: [] }
      ));

      page.setInputValue(page.createInput, value);

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(
        `SELECT * FROM \`gossip_menu\` WHERE (MenuID = ${value})`
      );
      page.expectNewEntityFree();

      page.clickElement(page.selectNewBtn);

      expect(navigateSpy).toHaveBeenCalledTimes(1);
      expect(navigateSpy).toHaveBeenCalledWith(['gossip/gossip-menu']);
      page.expectTopBarCreatingNew(value);
    });
  }));

  it('should correctly behave when inserting an existing entity', async(() => {
    fixture.whenStable().then(() => {
      querySpy.calls.reset();
      querySpy.and.returnValue(of(
        { results: ['mock value'] }
      ));

      page.setInputValue(page.createInput, value);

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(
        `SELECT * FROM \`gossip_menu\` WHERE (MenuID = ${value})`
      );
      page.expectEntityAlreadyInUse();
    });
  }));

  for (const { testId, MenuID, TextID, limit, expectedQuery } of [
    {
      testId: 1, MenuID: 1200, TextID: 123, limit: '100', expectedQuery:
        'SELECT * FROM `gossip_menu` WHERE (`MenuID` LIKE \'%1200%\') AND (`TextID` LIKE \'%123%\') LIMIT 100'
    },
    {
      testId: 2, MenuID: '', TextID: 123, limit: '100', expectedQuery:
        'SELECT * FROM `gossip_menu` WHERE (`TextID` LIKE \'%123%\') LIMIT 100'
    },
    {
      testId: 3, MenuID: 1200, TextID: '', limit: '', expectedQuery:
        'SELECT * FROM `gossip_menu` WHERE (`MenuID` LIKE \'%1200%\')'
    },
  ]) {
    it(`searching an existing entity should correctly work [${testId}]`, () => {
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

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(expectedQuery);
    });
  }

  it('searching and selecting an existing entity from the datatable should correctly work', () => {
    const results: GossipMenu[] = [
      { MenuID: 1, TextID: 1 },
      { MenuID: 1, TextID: 2 },
      { MenuID: 1, TextID: 3 },
    ];
    querySpy.calls.reset();
    querySpy.and.returnValue(of({ results }));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRow(page.DT_SELECTOR, 0);
    const row1 = page.getDatatableRow(page.DT_SELECTOR, 1);
    const row2 = page.getDatatableRow(page.DT_SELECTOR, 2);

    expect(row0.innerText).toContain(`${results[0].TextID}`);
    expect(row1.innerText).toContain(`${results[1].TextID}`);
    expect(row2.innerText).toContain(`${results[2].TextID}`);

    page.clickElement(page.getDatatableCell(page.DT_SELECTOR, 1, 1));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['gossip/gossip-menu']);
    // Note: this is different than in other editors
    expect(page.topBar.innerText).toContain(`Editing: gossip_menu (${results[1].MenuID})`);
  });
});
