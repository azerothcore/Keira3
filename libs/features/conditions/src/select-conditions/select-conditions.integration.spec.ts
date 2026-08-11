import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { ConditionsSearchService } from '@keira/shared/selectors';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { ConditionsHandlerService } from '../conditions-handler.service';
import { SelectConditionsComponent } from './select-conditions.component';
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
  get searchSourceIdInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('input#SourceId');
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
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule, SelectConditionsComponent, RouterTestingModule, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        ConditionsHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup() {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(() => undefined);
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([{ max: 1 }]));

    const fixture = TestBed.createComponent(SelectConditionsComponent);
    const page = new SelectConditionsComponentPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { fixture, page, querySpy, navigateSpy };
  }

  it('should correctly initialise', async () => {
    const { fixture, page } = setup();
    await fixture.whenStable();
    expect(page.queryWrapper.innerText).toContain('SELECT * FROM `conditions` LIMIT 50');
  });

  describe('deep link via query params', () => {
    const setupWithQueryParams = (queryParams: Record<string, string>) => {
      TestBed.overrideProvider(ActivatedRoute, { useValue: { snapshot: { queryParams } } });
      return setup();
    };

    /** The handler has to be spied on before the component is created, since ngOnInit already calls it. */
    const setupWatchingSelect = (queryParams: Record<string, string>) => {
      TestBed.overrideProvider(ActivatedRoute, { useValue: { snapshot: { queryParams } } });
      const selectSpy = vi.spyOn(TestBed.inject(ConditionsHandlerService), 'select').mockImplementation(() => undefined);
      return { ...setup(), selectSpy };
    };

    it('should prefill the search and run it when a source type and entry are given', async () => {
      // The quest chain links here to show the availability conditions of one quest.
      const { fixture, page, querySpy } = setupWithQueryParams({ sourceType: '19', sourceEntry: '13117' });
      await fixture.whenStable();

      expect(page.searchIdSelect.value).toContain('19');
      expect(page.searchEntryInput.value).toBe('13117');
      expect(querySpy).toHaveBeenCalledWith(
        "SELECT * FROM `conditions` WHERE (`SourceTypeOrReferenceId` LIKE '%19%') AND (`SourceEntry` LIKE '%13117%') LIMIT 50",
      );
    });

    it('should prefill the source group, which is how SmartAI events are addressed', async () => {
      // smart_scripts.id 3 is conditions.SourceGroup 4.
      const { fixture, page, querySpy } = setupWithQueryParams({ sourceType: '22', sourceEntry: '-141234', sourceGroup: '4' });
      await fixture.whenStable();

      expect(page.searchGroupInput.value).toBe('4');
      expect(querySpy).toHaveBeenCalledWith(
        "SELECT * FROM `conditions` WHERE (`SourceTypeOrReferenceId` LIKE '%22%') AND (`SourceGroup` LIKE '%4%') AND (`SourceEntry` LIKE '%-141234%') LIMIT 50",
      );
    });

    it('should prefill only what is given', async () => {
      const { fixture, page } = setupWithQueryParams({ sourceEntry: '13117' });
      await fixture.whenStable();

      expect(page.searchEntryInput.value).toBe('13117');
      expect(page.searchIdSelect.value).not.toContain('19');
    });

    it('should open the new-condition form instead of searching when create is requested', async () => {
      const { fixture, page, querySpy, navigateSpy } = setupWithQueryParams({
        sourceType: '22',
        sourceEntry: '-141234',
        sourceGroup: '4',
        sourceId: '1',
        create: 'true',
      });
      await fixture.whenStable();

      // The key is prefilled, then we go straight to the editor without running a search.
      expect(page.searchGroupInput.value).toBe('4');
      expect(querySpy).not.toHaveBeenCalledWith(expect.stringContaining('SourceEntry` LIKE'));
      expect(navigateSpy).toHaveBeenCalledWith(['conditions/conditions']);
    });

    it('should carry the SourceId into the key of the condition being created', async () => {
      const { fixture, selectSpy } = setupWatchingSelect({
        sourceType: '22',
        sourceEntry: '-141234',
        sourceGroup: '4',
        sourceId: '1',
        create: 'true',
      });
      await fixture.whenStable();

      // SourceId 1 = a gameobject SmartAI script; without it the condition would target a creature.
      expect(selectSpy).toHaveBeenCalledWith(true, expect.objectContaining({ SourceId: 1 }));
    });

    it('should keep a SourceId of 0 instead of treating it as absent', async () => {
      const { fixture, selectSpy } = setupWatchingSelect({
        sourceType: '22',
        sourceEntry: '55',
        sourceGroup: '1',
        sourceId: '0',
        create: 'true',
      });
      await fixture.whenStable();

      expect(selectSpy).toHaveBeenCalledWith(true, expect.objectContaining({ SourceId: 0 }));
    });

    it('should prefill the SourceId on its own', async () => {
      const { fixture, page } = setupWithQueryParams({ sourceId: '2' });
      await fixture.whenStable();

      expect(page.searchSourceIdInput.value).toBe('2');
    });

    it('should still search when create is not requested', async () => {
      const { fixture, querySpy } = setupWithQueryParams({ sourceType: '22', sourceEntry: '-141234', sourceGroup: '4' });
      await fixture.whenStable();

      expect(querySpy).toHaveBeenCalledWith(expect.stringContaining('SourceEntry` LIKE'));
    });

    it('should not search when there are no query params', async () => {
      const { fixture, querySpy } = setupWithQueryParams({});
      await fixture.whenStable();

      // Only the initial max-id lookup, no search triggered.
      expect(querySpy).not.toHaveBeenCalledWith(expect.stringContaining('SourceEntry` LIKE'));
    });

    it('should drop the keys a previous link left behind', async () => {
      // The search form outlives this screen, so a SmartAI link (which sets SourceGroup and SourceId)
      // followed by a quest-chain link (which sets neither) must not keep filtering on the SmartAI key.
      TestBed.overrideProvider(ActivatedRoute, { useValue: { snapshot: { queryParams: { sourceType: '19', sourceEntry: '13117' } } } });
      TestBed.inject(ConditionsSearchService).fields.patchValue({ SourceGroup: 4, SourceId: 1 });

      const { fixture, page, querySpy } = setup();
      await fixture.whenStable();

      expect(page.searchGroupInput.value).toBe('');
      expect(page.searchSourceIdInput.value).toBe('');
      expect(querySpy).toHaveBeenCalledWith(
        "SELECT * FROM `conditions` WHERE (`SourceTypeOrReferenceId` LIKE '%19%') AND (`SourceEntry` LIKE '%13117%') LIMIT 50",
      );
    });
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
      const { page, querySpy } = setup();
      querySpy.mockClear();
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
    const { page, querySpy, navigateSpy } = setup();
    const results = [
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

    querySpy.mockClear();
    querySpy.mockReturnValue(of(results));

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
    const { page, navigateSpy } = setup();
    page.setInputValue(page.searchIdSelect, 1 + ': ' + 1);
    page.setInputValue(page.searchGroupInput, 2);
    page.setInputValue(page.searchEntryInput, 3);
    page.setInputValue(page.searchLimitInput, 100);

    page.clickElement(page.createBtn);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['conditions/conditions']);
  });
});
