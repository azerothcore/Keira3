import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QueryService } from '@keira-shared/services/query.service';
import { PageObject } from '@keira-testing/page-object';
import { SaiSearchExistingComponent } from './sai-search-existing.component';
import { SaiSearchService } from '@keira-shared/modules/search/sai-search.service';
import { SaiSearchExistingModule } from './sai-search-existing.module';
import { SmartScripts } from '@keira-types/smart-scripts.type';

class SaiSearchExistingComponentPage extends PageObject<SaiSearchExistingComponent> {
  get queryWrapper() { return this.query<HTMLElement>('code.hljs'); }

  get searchSourceTypeSelect() { return this.query<HTMLInputElement>('select#source_type'); }
  get searchEntryOrGuid() { return this.query<HTMLInputElement>('input#entryorguid'); }
  get searchLimitInput() { return this.query<HTMLInputElement>('input#limit'); }
  get searchBtn() { return this.query<HTMLButtonElement>('#search-btn'); }
}

describe('SaiSearchExisting integration tests', () => {
  let component: SaiSearchExistingComponent;
  let fixture: ComponentFixture<SaiSearchExistingComponent>;
  let selectService: SaiSearchService;
  let page: SaiSearchExistingComponentPage;
  let queryService: QueryService;
  let querySpy: Spy;
  let navigateSpy: Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SaiSearchExistingModule,
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

    selectService = TestBed.get(SaiSearchService);

    fixture = TestBed.createComponent(SaiSearchExistingComponent);
    page = new SaiSearchExistingComponentPage(fixture);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('should correctly initialise', async(() => {
    fixture.whenStable().then(() => {
      expect(page.queryWrapper.innerText).toContain(
        'SELECT * FROM `smart_scripts` LIMIT 100'
      );
    });
  }));

  for (const { testId, entryorguid, source_type, limit, expectedQuery } of [
    {
      testId: 1, entryorguid: 1, source_type: 2, limit: '100', expectedQuery:
        'SELECT `entryorguid`, `source_type` FROM `smart_scripts` WHERE (`entryorguid` LIKE \'%1%\') AND (`source_type` LIKE \'%2%\') GROUP BY entryorguid, source_type LIMIT 100'
    },
    {
      testId: 2, entryorguid: '', source_type: 2, limit: '100', expectedQuery:
        'SELECT `entryorguid`, `source_type` FROM `smart_scripts` WHERE (`source_type` LIKE \'%2%\') GROUP BY entryorguid, source_type LIMIT 100'
    },
    {
      testId: 3, entryorguid: 123, source_type: '', limit: '100', expectedQuery:
        'SELECT `entryorguid`, `source_type` FROM `smart_scripts` WHERE (`entryorguid` LIKE \'%123%\') GROUP BY entryorguid, source_type LIMIT 100'
    },
    {
      testId: 4, entryorguid: 123, source_type: '', limit: '', expectedQuery:
        'SELECT `entryorguid`, `source_type` FROM `smart_scripts` WHERE (`entryorguid` LIKE \'%123%\') GROUP BY entryorguid, source_type'
    },
  ]) {
    it(`searching an existing entity should correctly work [${testId}]`, () => {
      querySpy.calls.reset();
      if (source_type) {
        page.setInputValue(page.searchSourceTypeSelect, source_type + ': ' + source_type);
      }
      if (entryorguid) {
        page.setInputValue(page.searchEntryOrGuid, entryorguid);
      }

      page.setInputValue(page.searchLimitInput, limit);

      expect(page.queryWrapper.innerText).toContain(expectedQuery);

      page.clickElement(page.searchBtn);

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(expectedQuery);
    });
  }

  it('searching and selecting an existing entity from the datatable should correctly work', () => {
    const results: Partial<SmartScripts>[] = [
      { entryorguid: 1, source_type: 2 },
      { entryorguid: 2, source_type: 3 },
      { entryorguid: 3, source_type: 4 },
      { entryorguid: 4, source_type: 5 },
    ];

    querySpy.calls.reset();
    querySpy.and.returnValue(of({ results }));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRowExternal(page.DT_SELECTOR, 0);
    const row1 = page.getDatatableRowExternal(page.DT_SELECTOR, 1);
    const row2 = page.getDatatableRowExternal(page.DT_SELECTOR, 2);

    expect(row0.innerText).toContain(results[0].entryorguid.toString());
    expect(row1.innerText).toContain(results[1].entryorguid.toString());
    expect(row2.innerText).toContain(results[2].entryorguid.toString());

    page.clickElement(page.getDatatableCellExternal(page.DT_SELECTOR, 1, 1));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['smart-ai/editors']);
  });
});
