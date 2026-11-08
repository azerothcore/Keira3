import { EditorSettingsService } from '@keira/shared/common-services';
import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { inject, Service, provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { ITEM_TEMPLATE_SEARCH_FIELDS, ITEM_TEMPLATE_TABLE, ItemTemplate } from '@keira/shared/acore-world-model';
import { SearchService } from './search.service';

import { mockChangeDetectorRef } from '@keira/shared/test-utils';

describe('SearchService', () => {
  const newQuery = '-- new query';

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
    }),
  );

  @Service()
  class TestSearchService extends SearchService<ItemTemplate> {
    override readonly queryService = inject(MysqlQueryService);
    protected override readonly entityTable = ITEM_TEMPLATE_TABLE;
    protected override readonly fieldList = ITEM_TEMPLATE_SEARCH_FIELDS;
    constructor() {
      super();
      this.init();
    }
  }

  function setup() {
    const service = TestBed.inject(TestSearchService);
    return { service };
  }

  describe('when queryForm value is changed', () => {
    function setupQueryFormChanged() {
      const parent = setup();
      const spy = vi.spyOn(TestBed.inject(MysqlQueryService), 'getSearchQuery').mockReturnValue(newQuery);
      parent.service.query = undefined as any;
      return { ...parent, spy };
    }

    it('should update the query if the form is valid', () => {
      const { service, spy } = setupQueryFormChanged();
      service.queryForm.controls.limit?.setValue(123);

      expect(spy).toHaveBeenCalledWith(service['entityTable'], service.queryForm.getRawValue(), undefined, undefined, undefined, {
        numbers: false,
        names: false,
      });
      expect(service.query).toEqual(newQuery);
    });

    it('should not update the query if the form is invalid', () => {
      const { service, spy } = setupQueryFormChanged();
      service.queryForm.controls.fields?.setErrors({ error: 'some error' });

      service.queryForm.controls.limit?.setValue(123);

      expect(spy).toHaveBeenCalledTimes(0);
      expect(service.query).toBeUndefined();
    });
  });

  it('onSearch() should execute the query and update the rows with the result', () => {
    const { service } = setup();
    const newRows = [{ entry: 1 }, { entry: 2 }] as ItemTemplate[];
    const spy = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockReturnValue(of(newRows));
    service.rows = undefined;
    service.query = newQuery;

    service.onSearch(mockChangeDetectorRef);

    expect(spy).toHaveBeenCalledWith(newQuery);
    expect(service.rows).toEqual(newRows as any);
  });

  it('follows Settings > Editors as they change (row limit, exact matching), without a restart', () => {
    const { service } = setup();
    const settings = TestBed.inject(EditorSettingsService);
    const before = settings.settings();
    const build = vi.spyOn(TestBed.inject(MysqlQueryService), 'getSearchQuery').mockReturnValue(newQuery);

    settings.saveSearch(service['entityTable'], { limit: 7, exactNumbers: true });

    expect(service.queryForm.controls.limit?.value).toBe(7);
    expect(build).toHaveBeenLastCalledWith(service['entityTable'], expect.objectContaining({ limit: 7 }), undefined, undefined, undefined, {
      numbers: true,
      names: false,
    });
    expect(service.query).toBe(newQuery);
    settings.save(before);
    localStorage.clear();
  });

  describe('searchExact() (#3245)', () => {
    it('shows the rows having exactly the value, in the form too, the rest of the form cleared', () => {
      const { service } = setup();
      service.fields.controls.name.setValue('Sword');
      const build = vi.spyOn(TestBed.inject(MysqlQueryService), 'getSearchQuery').mockReturnValue(newQuery);
      const run = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockReturnValue(of([{ entry: 25 }]));

      service.searchExact('entry', 25, mockChangeDetectorRef);

      expect(build).toHaveBeenCalledWith(service['entityTable'], expect.anything(), undefined, undefined, undefined, {
        numbers: true,
        names: false,
      });
      expect((build.mock.calls.at(-2)?.[1] as { fields: { entry: number } }).fields.entry).toBe(25);
      expect(run).toHaveBeenCalledWith(newQuery);
      expect(service.rows).toEqual([{ entry: 25 }] as never);
      expect(service.fields.getRawValue()).toEqual(expect.objectContaining({ entry: null, name: null }));
      expect(service.query).toEqual(newQuery);
    });

    it('does nothing for a field the search does not have', () => {
      const { service } = setup();
      const run = vi.spyOn(TestBed.inject(MysqlQueryService), 'query');

      service.searchExact('nope', 25, mockChangeDetectorRef);

      expect(run).not.toHaveBeenCalled();
    });
  });

  describe('when the sub-class supplies orderFields', () => {
    @Service()
    class TestOrderedSearchService extends SearchService<ItemTemplate> {
      override readonly queryService = inject(MysqlQueryService);
      protected override readonly entityTable = ITEM_TEMPLATE_TABLE;
      protected override readonly fieldList = ITEM_TEMPLATE_SEARCH_FIELDS;
      protected override readonly orderFields = ['entry'];
      constructor() {
        super();
        this.init();
      }
    }

    it('should pass them to the query builder', () => {
      const spy = vi.spyOn(TestBed.inject(MysqlQueryService), 'getSearchQuery').mockReturnValue(newQuery);

      const service = TestBed.inject(TestOrderedSearchService);

      expect(spy).toHaveBeenCalledWith(service['entityTable'], service.queryForm.getRawValue(), undefined, undefined, ['entry'], {
        numbers: false,
        names: false,
      });
      expect(service.query).toEqual(newQuery);
    });
  });
});
