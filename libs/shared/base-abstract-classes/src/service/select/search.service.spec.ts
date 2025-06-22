import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { ITEM_TEMPLATE_SEARCH_FIELDS, ITEM_TEMPLATE_TABLE, ItemTemplate } from '@keira/shared/acore-world-model';
import { SearchService } from './search.service';

import { mockChangeDetectorRef } from '@keira/shared/test-utils';
import { Injectable, inject as inject_1 } from '@angular/core';
import Spy = jasmine.Spy;

describe('SearchService', () => {
  let service: SearchService<ItemTemplate>;

  const newQuery = '-- new query';

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) }],
    }),
  );

  @Injectable({
    providedIn: 'root',
  })
  class TestSearchService extends SearchService<ItemTemplate> {
    override readonly queryService = inject_1(MysqlQueryService);
    protected readonly entityTable = ITEM_TEMPLATE_TABLE;
    protected readonly fieldList = ITEM_TEMPLATE_SEARCH_FIELDS;
    private readonly init = this.init();
  }

  beforeEach(() => {
    service = TestBed.inject(TestSearchService);
  });

  describe('when queryForm value is changed', () => {
    let spy: Spy;

    beforeEach(() => {
      spy = spyOn(TestBed.inject(MysqlQueryService), 'getSearchQuery').and.returnValue(newQuery);
      service.query = undefined as any;
    });

    it('should update the query if the form is valid', () => {
      service.queryForm.controls.limit?.setValue(123);

      expect(spy).toHaveBeenCalledWith(service['entityTable'], service.queryForm.getRawValue(), undefined, undefined);
      expect(service.query).toEqual(newQuery);
    });

    it('should not update the query if the form is invalid', () => {
      service.queryForm.controls.fields?.setErrors({ error: 'some error' });

      service.queryForm.controls.limit?.setValue(123);

      expect(spy).toHaveBeenCalledTimes(0);
      expect(service.query).toBeUndefined();
    });
  });

  it('onSearch() should execute the query and update the rows with the result', () => {
    const newRows = [{ entry: 1 }, { entry: 2 }] as ItemTemplate[];
    const spy = spyOn(TestBed.inject(MysqlQueryService), 'query').and.returnValue(of(newRows));
    service.rows = undefined;
    service.query = newQuery;

    service.onSearch(mockChangeDetectorRef);

    expect(spy).toHaveBeenCalledWith(newQuery);
    expect(service.rows).toEqual(newRows as any);
  });
});
