import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';

import { ItemEnchantmentSearchService } from './item-enchantment-search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';
import { MockedSqliteQueryService } from '../../services/services.mock';

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
