import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { instance } from 'ts-mockito';
import { MysqlQueryService } from '../../services/query/mysql-query.service';
import { mockChangeDetectorRef, MockedMysqlQueryService } from '@keira/shared/test-utils';
import { ItemTemplate } from '@keira/shared/acore-world-model';
import { ItemSearchService } from './item-search.service';
import { SearchService } from './search.service';
import Spy = jasmine.Spy;

describe('SearchService', () => {
  let service: SearchService<ItemTemplate>;

  const newQuery = '-- new query';

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }),
  );

  beforeEach(() => {
    service = TestBed.inject(ItemSearchService);
  });

  describe('when queryForm value is changed', () => {
    let spy: Spy;

    beforeEach(() => {
      spy = spyOn(TestBed.inject(MysqlQueryService), 'getSearchQuery').and.returnValue(newQuery);
      service.query = null;
    });

    it('should update the query if the form is valid', () => {
      service.queryForm.controls.limit.setValue(123);

      expect(spy).toHaveBeenCalledWith(service['entityTable'], service.queryForm.getRawValue(), null, null);
      expect(service.query).toEqual(newQuery);
    });

    it('should not update the query if the form is invalid', () => {
      service.queryForm.controls.fields.setErrors({ error: 'some error' });

      service.queryForm.controls.limit.setValue(123);

      expect(spy).toHaveBeenCalledTimes(0);
      expect(service.query).toBeNull();
    });
  });

  it('onSearch() should execute the query and update the rows with the result', () => {
    const newRows = [{ entry: 1 }, { entry: 2 }] as ItemTemplate[];
    const spy = spyOn(TestBed.inject(MysqlQueryService), 'query').and.returnValue(of(newRows));
    service.rows = null;
    service.query = newQuery;

    service.onSearch(mockChangeDetectorRef);

    expect(spy).toHaveBeenCalledWith(newQuery);
    expect(service.rows).toEqual(newRows);
  });
});
