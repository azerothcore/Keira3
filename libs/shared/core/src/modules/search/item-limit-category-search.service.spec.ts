import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';

import { ItemLimitCategorySearchService } from './item-limit-category-search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';
import { MockedSqliteQueryService } from '../../services/services.mock';

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
