import { TestBed } from '@angular/core/testing';

import { instance, mock } from 'ts-mockito';

import { ItemLimitCategorySearchService } from './item-limit-category-search.service';
import { SqliteQueryService } from '@keira/shared/db-layer';

describe('ItemLimitCategorySearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(mock(SqliteQueryService)) }],
    }),
  );

  it('should be created', () => {
    const service: ItemLimitCategorySearchService = TestBed.inject(ItemLimitCategorySearchService);
    expect(service).toBeTruthy();
  });
});
