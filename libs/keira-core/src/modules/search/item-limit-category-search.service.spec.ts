import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';
import { MockedSqliteQueryService } from '@keira/test-utils';
import { ItemLimitCategorySearchService } from './item-limit-category-search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';

describe('ItemLimitCategorySearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(MockedSqliteQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: ItemLimitCategorySearchService = TestBed.inject(ItemLimitCategorySearchService);
    expect(service).toBeTruthy();
  });
});
