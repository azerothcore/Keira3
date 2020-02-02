import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QueryService } from '@keira-shared/services/query.service';
import { SelectConditionsComponent } from './select-conditions.component';
import { ConditionsSearchService } from '@keira-shared/modules/search/conditions-search.service';
import { SelectConditionsModule } from './select-conditions.module';
import { PageObject } from '@keira-testing/page-object';
import { Conditions } from '@keira-types/conditions.type';
import { ConditionsHandlerService } from '../conditions-handler.service';

class SelectConditionsComponentPage extends PageObject<SelectConditionsComponent> {
  get queryWrapper() { return this.query<HTMLElement>('code.hljs'); }

  get searchIdSelect() { return this.query<HTMLInputElement>('select#SourceTypeOrReferenceId'); }
  get searchGroupInput() { return this.query<HTMLInputElement>('input#SourceGroup'); }
  get searchEntryInput() { return this.query<HTMLInputElement>('input#SourceEntry'); }
  get searchLimitInput() { return this.query<HTMLInputElement>('input#limit'); }
  get searchBtn() { return this.query<HTMLButtonElement>('#search-btn'); }
  get createBtn() { return this.query<HTMLButtonElement>('#create-new-btn'); }

  get topBar() { return this.query<HTMLElement>('app-top-bar'); }
}

describe('SelectConditions integration tests', () => {
  let component: SelectConditionsComponent;
  let fixture: ComponentFixture<SelectConditionsComponent>;
  let selectService: ConditionsSearchService;
  let page: SelectConditionsComponentPage;
  let queryService: QueryService;
  let querySpy: Spy;
  let navigateSpy: Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SelectConditionsModule,
        RouterTestingModule,
      ],
      providers: [
        ConditionsHandlerService,
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

    selectService = TestBed.get(ConditionsSearchService);

    fixture = TestBed.createComponent(SelectConditionsComponent);
    page = new SelectConditionsComponentPage(fixture);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('should correctly initialise', async(() => {
    fixture.whenStable().then(() => {
      expect(page.queryWrapper.innerText).toContain(
        'SELECT * FROM `conditions` LIMIT 100'
      );
    });
  }));

  for (const { testId, sourceIdorRef, group, entry, limit, expectedQuery } of [
    {
      testId: 1, sourceIdorRef: 1, group: 2, entry: 3, limit: '100', expectedQuery:
        'SELECT * FROM `conditions` WHERE (`SourceTypeOrReferenceId` LIKE \'%1%\') AND (`SourceGroup` LIKE \'%2%\') AND (`SourceEntry` LIKE \'%3%\') LIMIT 100'
    },
    {
      testId: 2, sourceIdorRef: 1, group: '', entry: '', limit: '100', expectedQuery:
        'SELECT * FROM `conditions` WHERE (`SourceTypeOrReferenceId` LIKE \'%1%\') LIMIT 100'
    },
    {
      testId: 3, sourceIdorRef: 1, group: 2, entry: '', limit: '100', expectedQuery:
        'SELECT * FROM `conditions` WHERE (`SourceTypeOrReferenceId` LIKE \'%1%\') AND (`SourceGroup` LIKE \'%2%\') LIMIT 100'
    },
    {
      testId: 4, sourceIdorRef: '', group: 2, entry: 3, limit: '100', expectedQuery:
        'SELECT * FROM `conditions` WHERE (`SourceGroup` LIKE \'%2%\') AND (`SourceEntry` LIKE \'%3%\') LIMIT 100'
    },
    {
      testId: 5, sourceIdorRef: 1, group: '', entry: 3, limit: '100', expectedQuery:
        'SELECT * FROM `conditions` WHERE (`SourceTypeOrReferenceId` LIKE \'%1%\') AND (`SourceEntry` LIKE \'%3%\') LIMIT 100'
    },
    {
      testId: 6, sourceIdorRef: 1, group: '', entry: '', limit: '', expectedQuery:
        'SELECT * FROM `conditions` WHERE (`SourceTypeOrReferenceId` LIKE \'%1%\')'
    },
    {
      testId: 7, sourceIdorRef: 0, group: 2, entry: 3, limit: '100', expectedQuery:
        'SELECT * FROM `conditions` WHERE (`SourceGroup` LIKE \'%2%\') AND (`SourceEntry` LIKE \'%3%\') LIMIT 100'
    },
  ]) {
    it(`searching an existing entity should correctly work [${testId}]`, () => {
      querySpy.calls.reset();
      if (sourceIdorRef) {
        page.setInputValue(page.searchIdSelect, sourceIdorRef + ': ' + sourceIdorRef);
      }
      if (group) {
        page.setInputValue(page.searchGroupInput, group);
      }
      if (entry) {
        page.setInputValue(page.searchEntryInput, entry);
      }
      page.setInputValue(page.searchLimitInput, limit);

      expect(page.queryWrapper.innerText).toContain(expectedQuery);

      page.clickElement(page.searchBtn);

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(expectedQuery);
    });
  }

  it('searching and selecting an existing entity from the datatable should correctly work', () => {
    const results: Partial<Conditions>[] = [
      {
        SourceTypeOrReferenceId: 1, SourceGroup: 4, SourceEntry: 7, SourceId: 0, ElseGroup: 0,
        ConditionTypeOrReference: 0, ConditionTarget: 0, ConditionValue1: 0, ConditionValue2: 0,
        ConditionValue3: 0, NegativeCondition: 0, ErrorType: 0, ErrorTextId: 0, ScriptName: '', Comment: ''
      },
      { SourceTypeOrReferenceId: 2, SourceGroup: 5, SourceEntry: 8, SourceId: 0, ElseGroup: 0,
        ConditionTypeOrReference: 0, ConditionTarget: 0, ConditionValue1: 0, ConditionValue2: 0,
        ConditionValue3: 0, NegativeCondition: 0, ErrorType: 0, ErrorTextId: 0, ScriptName: '', Comment: ''
      },
      { SourceTypeOrReferenceId: 3, SourceGroup: 6, SourceEntry: 9, SourceId: 0, ElseGroup: 0,
        ConditionTypeOrReference: 0, ConditionTarget: 0, ConditionValue1: 0, ConditionValue2: 0,
        ConditionValue3: 0, NegativeCondition: 0, ErrorType: 0, ErrorTextId: 0, ScriptName: '', Comment: ''
      },
    ];

    querySpy.calls.reset();
    querySpy.and.returnValue(of({ results }));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRowExternal(page.DT_SELECTOR, 0);
    const row1 = page.getDatatableRowExternal(page.DT_SELECTOR, 1);
    const row2 = page.getDatatableRowExternal(page.DT_SELECTOR, 2);

    expect(row0.innerText).toContain(results[0].SourceGroup.toString());
    expect(row1.innerText).toContain(results[1].SourceGroup.toString());
    expect(row2.innerText).toContain(results[2].SourceGroup.toString());

    page.clickElement(page.getDatatableCellExternal(page.DT_SELECTOR, 1, 1));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['conditions/conditions']);
  });

  it('creating new should correctly work', () => {
    page.setInputValue(page.searchIdSelect, 1 + ': ' + 1);
    page.setInputValue(page.searchGroupInput, 2);
    page.setInputValue(page.searchEntryInput, 3);
    page.setInputValue(page.searchLimitInput, 100);

    page.clickElement(page.createBtn);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['conditions/conditions']);
  });
});
