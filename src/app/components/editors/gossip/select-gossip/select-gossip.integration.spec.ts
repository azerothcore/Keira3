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
  ID_FIELD = 'ID';
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
        'SELECT MAX(ID) AS max FROM gossip_menu;'
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
        `SELECT * FROM \`gossip_menu\` WHERE (ID = ${value})`
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
        `SELECT * FROM \`gossip_menu\` WHERE (ID = ${value})`
      );
      page.expectEntityAlreadyInUse();
    });
  }));

  for (const { testId, id, name, limit, expectedQuery } of [
    {
      testId: 1, id: 1200, name: `The People's Militia`, limit: '100', expectedQuery:
        'SELECT * FROM `gossip_menu` WHERE (`ID` LIKE \'%1200%\') AND (`LogTitle` LIKE \'%The People\\\'s Militia%\') LIMIT 100'
    },
    {
      testId: 2, id: '', name: `The People's Militia`, limit: '100', expectedQuery:
        'SELECT * FROM `gossip_menu` WHERE (`LogTitle` LIKE \'%The People\\\'s Militia%\') LIMIT 100'
    },
    {
      testId: 3, id: '', name: `The People's Militia`, limit: '100', expectedQuery:
        'SELECT * FROM `gossip_menu` WHERE (`LogTitle` LIKE \'%The People\\\'s Militia%\') LIMIT 100'
    },
    {
      testId: 4, id: 1200, name: '', limit: '', expectedQuery:
        'SELECT * FROM `gossip_menu` WHERE (`ID` LIKE \'%1200%\')'
    },
  ]) {
    it(`searching an existing entity should correctly work [${testId}]`, () => {
      querySpy.calls.reset();
      if (id) {
        page.setInputValue(page.searchIdInput, id);
      }
      if (name) {
        page.setInputValue(page.searchNameInput, name);
      }
      page.setInputValue(page.searchLimitInput, limit);

      expect(page.queryWrapper.innerText).toContain(expectedQuery);

      page.clickElement(page.searchBtn);

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(expectedQuery);
    });
  }

  it('searching and selecting an existing entity from the datatable should correctly work', () => {
    const results: Partial<GossipMenu>[] = [
      { id: 1, LogTitle: 'An awesome Gossip 1', GossipType: 0, GossipLevel: 1, MinLevel: 10, GossipDescription: ''   },
      { id: 2, LogTitle: 'An awesome Gossip 2', GossipType: 0, GossipLevel: 2, MinLevel: 20, GossipDescription: ''   },
      { id: 3, LogTitle: 'An awesome Gossip 3', GossipType: 0, GossipLevel: 3, MinLevel: 30, GossipDescription: ''   },
    ];
    querySpy.calls.reset();
    querySpy.and.returnValue(of({ results }));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRow(page.DT_SELECTOR, 0);
    const row1 = page.getDatatableRow(page.DT_SELECTOR, 1);
    const row2 = page.getDatatableRow(page.DT_SELECTOR, 2);

    expect(row0.innerText).toContain(results[0].LogTitle);
    expect(row1.innerText).toContain(results[1].LogTitle);
    expect(row2.innerText).toContain(results[2].LogTitle);

    page.clickElement(page.getDatatableCell(page.DT_SELECTOR, 1, 1));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['gossip/gossip-menu']);
    page.expectTopBarEditing(results[1].ID, results[1].LogTitle);
  });
});
