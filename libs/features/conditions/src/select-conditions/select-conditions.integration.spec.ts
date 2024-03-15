import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { Conditions } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ConditionsHandlerService } from '../conditions-handler.service';
import { SelectConditionsComponent } from './select-conditions.component';
import Spy = jasmine.Spy;
import { instance, mock } from 'ts-mockito';

class SelectConditionsComponentPage extends PageObject<SelectConditionsComponent> {
  get searchIdSelect(): HTMLInputElement {
    return this.query<HTMLInputElement>('select#SourceTypeOrReferenceId');
  }
  get searchGroupInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('input#SourceGroup');
  }
  get searchEntryInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('input#SourceEntry');
  }
  get searchLimitInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('input#limit');
  }
  get searchBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#search-btn');
  }
  get createBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#create-new-btn');
  }

  get topBar(): HTMLElement {
    return this.query<HTMLElement>('keira-top-bar');
  }
}

describe('SelectConditions integration tests', () => {
  let fixture: ComponentFixture<SelectConditionsComponent>;
  let page: SelectConditionsComponentPage;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let navigateSpy: Spy;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        SelectConditionsComponent,
        RouterTestingModule,
        TranslateTestingModule,
      ],
      providers: [ConditionsHandlerService, { provide: SqliteService, useValue: instance(mock(SqliteService)) }],
    }).compileComponents();
  }));

  beforeEach(() => {
    navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([{ max: 1 }]));

    fixture = TestBed.createComponent(SelectConditionsComponent);
    page = new SelectConditionsComponentPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('should correctly initialise', async () => {
    await fixture.whenStable();
    expect(page.queryWrapper.innerText).toContain('SELECT * FROM `conditions` LIMIT 50');
  });

  for (const { testId, sourceIdorRef, group, entry, limit, expectedQuery } of [
    {
      testId: 1,
      sourceIdorRef: 1,
      group: 2,
      entry: 3,
      limit: '100',
      expectedQuery:
        "SELECT * FROM `conditions` WHERE (`SourceTypeOrReferenceId` LIKE '%1%') AND (`SourceGroup` LIKE '%2%') AND (`SourceEntry` LIKE '%3%') LIMIT 100",
    },
    {
      testId: 2,
      sourceIdorRef: 1,
      group: '',
      entry: '',
      limit: '100',
      expectedQuery: "SELECT * FROM `conditions` WHERE (`SourceTypeOrReferenceId` LIKE '%1%') LIMIT 100",
    },
    {
      testId: 3,
      sourceIdorRef: 1,
      group: 2,
      entry: '',
      limit: '100',
      expectedQuery: "SELECT * FROM `conditions` WHERE (`SourceTypeOrReferenceId` LIKE '%1%') AND (`SourceGroup` LIKE '%2%') LIMIT 100",
    },
    {
      testId: 4,
      sourceIdorRef: '',
      group: 2,
      entry: 3,
      limit: '100',
      expectedQuery: "SELECT * FROM `conditions` WHERE (`SourceGroup` LIKE '%2%') AND (`SourceEntry` LIKE '%3%') LIMIT 100",
    },
    {
      testId: 5,
      sourceIdorRef: 1,
      group: '',
      entry: 3,
      limit: '100',
      expectedQuery: "SELECT * FROM `conditions` WHERE (`SourceTypeOrReferenceId` LIKE '%1%') AND (`SourceEntry` LIKE '%3%') LIMIT 100",
    },
    {
      testId: 6,
      sourceIdorRef: 1,
      group: '',
      entry: '',
      limit: '',
      expectedQuery: "SELECT * FROM `conditions` WHERE (`SourceTypeOrReferenceId` LIKE '%1%')",
    },
    {
      testId: 7,
      sourceIdorRef: 0,
      group: 2,
      entry: 3,
      limit: '100',
      expectedQuery: "SELECT * FROM `conditions` WHERE (`SourceGroup` LIKE '%2%') AND (`SourceEntry` LIKE '%3%') LIMIT 100",
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
        SourceTypeOrReferenceId: 1,
        SourceGroup: 4,
        SourceEntry: 7,
        SourceId: 0,
        ElseGroup: 0,
        ConditionTypeOrReference: 0,
        ConditionTarget: 0,
        ConditionValue1: 0,
        ConditionValue2: 0,
        ConditionValue3: 0,
        NegativeCondition: 0,
        ErrorType: 0,
        ErrorTextId: 0,
        ScriptName: '',
        Comment: '',
      },
      {
        SourceTypeOrReferenceId: 2,
        SourceGroup: 5,
        SourceEntry: 8,
        SourceId: 0,
        ElseGroup: 0,
        ConditionTypeOrReference: 0,
        ConditionTarget: 0,
        ConditionValue1: 0,
        ConditionValue2: 0,
        ConditionValue3: 0,
        NegativeCondition: 0,
        ErrorType: 0,
        ErrorTextId: 0,
        ScriptName: '',
        Comment: '',
      },
      {
        SourceTypeOrReferenceId: 3,
        SourceGroup: 6,
        SourceEntry: 9,
        SourceId: 0,
        ElseGroup: 0,
        ConditionTypeOrReference: 0,
        ConditionTarget: 0,
        ConditionValue1: 0,
        ConditionValue2: 0,
        ConditionValue3: 0,
        NegativeCondition: 0,
        ErrorType: 0,
        ErrorTextId: 0,
        ScriptName: '',
        Comment: '',
      },
    ];

    querySpy.calls.reset();
    querySpy.and.returnValue(of(results));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRowExternal(0);
    const row1 = page.getDatatableRowExternal(1);
    const row2 = page.getDatatableRowExternal(2);

    expect(row0.innerText).toContain(results[0].SourceGroup.toString());
    expect(row1.innerText).toContain(results[1].SourceGroup.toString());
    expect(row2.innerText).toContain(results[2].SourceGroup.toString());

    page.clickElement(page.getDatatableCellExternal(1, 1));

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
