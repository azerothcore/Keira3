import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { TranslateTestingModule } from '@keira/test-utils';
import { PageObject } from '@keira/test-utils';
import { SmartScripts } from '@keira/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { SaiSearchExistingComponent } from './sai-search-existing.component';
import { SaiSearchExistingModule } from './sai-search-existing.module';
import Spy = jasmine.Spy;

class SaiSearchExistingComponentPage extends PageObject<SaiSearchExistingComponent> {
  get searchSourceTypeSelect(): HTMLInputElement {
    return this.query<HTMLInputElement>('select#source_type');
  }
  get searchEntryOrGuid(): HTMLInputElement {
    return this.query<HTMLInputElement>('input#entryorguid');
  }
  get searchLimitInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('input#limit');
  }
  get searchBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#search-btn');
  }
}

describe('SaiSearchExisting integration tests', () => {
  let fixture: ComponentFixture<SaiSearchExistingComponent>;
  let page: SaiSearchExistingComponentPage;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let navigateSpy: Spy;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), SaiSearchExistingModule, RouterTestingModule, TranslateTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([{ max: 1 }]));

    fixture = TestBed.createComponent(SaiSearchExistingComponent);
    page = new SaiSearchExistingComponentPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('should correctly initialise', waitForAsync(async () => {
    await fixture.whenStable();
    expect(page.queryWrapper.innerText).toContain(
      'SELECT `entryorguid`, `source_type` FROM `smart_scripts` GROUP BY entryorguid, source_type LIMIT 50',
    );
  }));

  for (const { testId, entryorguid, selectIndex, source_type, limit, expectedQuery } of [
    {
      testId: 1,
      entryorguid: 1,
      selectIndex: 3,
      source_type: 2,
      limit: '100',
      expectedQuery:
        "SELECT `entryorguid`, `source_type` FROM `smart_scripts` WHERE (`entryorguid` LIKE '%1%') AND (`source_type` LIKE '%2%') GROUP BY entryorguid, source_type LIMIT 100",
    },
    {
      testId: 2,
      entryorguid: '',
      selectIndex: 3,
      source_type: 2,
      limit: '100',
      expectedQuery:
        "SELECT `entryorguid`, `source_type` FROM `smart_scripts` WHERE (`source_type` LIKE '%2%') GROUP BY entryorguid, source_type LIMIT 100",
    },
    {
      testId: 3,
      entryorguid: 123,
      selectIndex: '',
      source_type: '',
      limit: '100',
      expectedQuery:
        "SELECT `entryorguid`, `source_type` FROM `smart_scripts` WHERE (`entryorguid` LIKE '%123%') GROUP BY entryorguid, source_type LIMIT 100",
    },
    {
      testId: 4,
      entryorguid: 123,
      selectIndex: '',
      source_type: '',
      limit: '',
      expectedQuery:
        "SELECT `entryorguid`, `source_type` FROM `smart_scripts` WHERE (`entryorguid` LIKE '%123%') GROUP BY entryorguid, source_type",
    },
  ]) {
    it(`searching an existing entity should correctly work [${testId}]`, () => {
      querySpy.calls.reset();
      if (source_type) {
        page.setInputValue(page.searchSourceTypeSelect, selectIndex + ': ' + source_type);
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
    querySpy.and.returnValue(of(results));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRowExternal(0);
    const row1 = page.getDatatableRowExternal(1);
    const row2 = page.getDatatableRowExternal(2);

    expect(row0.innerText).toContain(results[0].entryorguid.toString());
    expect(row1.innerText).toContain(results[1].entryorguid.toString());
    expect(row2.innerText).toContain(results[2].entryorguid.toString());

    page.clickElement(page.getDatatableCellExternal(1, 1));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['smart-ai/editors']);
  });
});
