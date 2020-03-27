import { TestBed } from '@angular/core/testing';
import { instance } from 'ts-mockito';

import { ItemLimitCategorySearchService } from './item-limit-category-search.service';
import { MockedSqliteQueryService } from '../../testing/mocks';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';

describe('ItemLimitCategorySearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: SqliteQueryService, useValue: instance(MockedSqliteQueryService) },
    ]
  }));

  it('should be created', () => {
    const service: ItemLimitCategorySearchService = TestBed.inject(ItemLimitCategorySearchService);
    expect(service).toBeTruthy();
  });
});
