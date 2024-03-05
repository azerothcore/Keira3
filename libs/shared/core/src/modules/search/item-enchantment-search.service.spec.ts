import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';
import { MockedSqliteQueryService } from '@keira/shared/test-utils';
import { ItemEnchantmentSearchService } from './item-enchantment-search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';

describe('ItemEnchantmentSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(MockedSqliteQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: ItemEnchantmentSearchService = TestBed.inject(ItemEnchantmentSearchService);
    expect(service).toBeTruthy();
  });
});
