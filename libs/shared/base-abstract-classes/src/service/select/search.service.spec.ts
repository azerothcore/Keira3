import { TestBed } from '@angular/core/testing';
import { inject, Injectable, provideZonelessChangeDetection } from '@angular/core';
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

  @Injectable({
    providedIn: 'root',
  })
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
      const spy = spyOn(TestBed.inject(MysqlQueryService), 'getSearchQuery').and.returnValue(newQuery);
      parent.service.query = undefined as any;
      return { ...parent, spy };
    }

    it('should update the query if the form is valid', () => {
      const { service, spy } = setupQueryFormChanged();
      service.queryForm.controls.limit?.setValue(123);

      expect(spy).toHaveBeenCalledWith(service['entityTable'], service.queryForm.getRawValue(), undefined, undefined);
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
    const spy = spyOn(TestBed.inject(MysqlQueryService), 'query').and.returnValue(of(newRows));
    service.rows = undefined;
    service.query = newQuery;

    service.onSearch(mockChangeDetectorRef);

    expect(spy).toHaveBeenCalledWith(newQuery);
    expect(service.rows).toEqual(newRows as any);
  });
});
