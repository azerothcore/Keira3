import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QueryService } from '../../../../services/query.service';
import { SelectItemComponent } from './select-item.component';
import { ItemSelectService } from '../../../../services/select/item-select.service';
import { SelectItemModule } from './select-item.module';
import { ItemTemplate } from '../../../../types/item-template.type';
import { SelectPageObject } from '../../../../test-utils/select-page-object';

class SelectItemComponentPage extends SelectPageObject<SelectItemComponent> {
  ID_FIELD = 'entry';
}

describe('SelectItem integration tests', () => {
  let component: SelectItemComponent;
  let fixture: ComponentFixture<SelectItemComponent>;
  let selectService: ItemSelectService;
  let page: SelectItemComponentPage;
  let queryService: QueryService;
  let querySpy: Spy;
  let navigateSpy: Spy;

  const value = 1200;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SelectItemModule,
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

    selectService = TestBed.get(ItemSelectService);

    fixture = TestBed.createComponent(SelectItemComponent);
    page = new SelectItemComponentPage(fixture);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('should correctly initialise', async(() => {
    fixture.whenStable().then(() => {
      expect(page.createInput.value).toEqual(`${component.customStartingId}`);
      page.expectNewEntityFree();
      expect(querySpy).toHaveBeenCalledWith(
        'SELECT MAX(entry) AS max FROM item_template;'
      );
      expect(page.queryWrapper.innerText).toContain(
        'SELECT * FROM `item_template` LIMIT 100'
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
        `SELECT * FROM \`item_template\` WHERE (entry = ${value})`
      );
      page.expectNewEntityFree();

      page.clickElement(page.selectNewBtn);

      expect(navigateSpy).toHaveBeenCalledTimes(1);
      expect(navigateSpy).toHaveBeenCalledWith(['item/item-template']);
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
        `SELECT * FROM \`item_template\` WHERE (entry = ${value})`
      );
      page.expectEntityAlreadyInUse();
    });
  }));

  for (const { testId, id, name, limit, expectedQuery } of [
    {
      testId: 1, id: 1200, name: `The People's Militia`, limit: '100', expectedQuery:
        'SELECT * FROM `item_template` WHERE (`entry` LIKE \'%1200%\') AND (`name` LIKE \'%The People\\\'s Militia%\') LIMIT 100'
    },
    {
      testId: 2, id: '', name: `The People's Militia`, limit: '100', expectedQuery:
        'SELECT * FROM `item_template` WHERE (`name` LIKE \'%The People\\\'s Militia%\') LIMIT 100'
    },
    {
      testId: 3, id: '', name: `The People's Militia`, limit: '100', expectedQuery:
        'SELECT * FROM `item_template` WHERE (`name` LIKE \'%The People\\\'s Militia%\') LIMIT 100'
    },
    {
      testId: 4, id: 1200, name: '', limit: '', expectedQuery:
        'SELECT * FROM `item_template` WHERE (`entry` LIKE \'%1200%\')'
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
    const results: Partial<ItemTemplate>[] = [
      { id: 1, name: 'An awesome Item 1', ItemType: 0, ItemLevel: 1, MinLevel: 10, ItemDescription: ''   },
      { id: 2, name: 'An awesome Item 2', ItemType: 0, ItemLevel: 2, MinLevel: 20, ItemDescription: ''   },
      { id: 3, name: 'An awesome Item 3', ItemType: 0, ItemLevel: 3, MinLevel: 30, ItemDescription: ''   },
    ];
    querySpy.calls.reset();
    querySpy.and.returnValue(of({ results }));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRow(page.DT_SELECTOR, 0);
    const row1 = page.getDatatableRow(page.DT_SELECTOR, 1);
    const row2 = page.getDatatableRow(page.DT_SELECTOR, 2);

    expect(row0.innerText).toContain(results[0].name);
    expect(row1.innerText).toContain(results[1].name);
    expect(row2.innerText).toContain(results[2].name);

    page.clickElement(page.getDatatableCell(page.DT_SELECTOR, 1, 1));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['item/item-template']);
    page.expectTopBarEditing(results[1].entry, results[1].name);
  });
});
