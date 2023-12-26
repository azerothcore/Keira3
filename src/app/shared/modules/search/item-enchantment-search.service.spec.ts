import { TestBed } from '@angular/core/testing';
import { SqliteQueryService } from '@keira-shared/services/query/sqlite-query.service';
import { instance } from 'ts-mockito';
import { MockedSqliteQueryService } from '../../testing/mocks';
import { ItemEnchantmentSearchService } from './item-enchantment-search.service';

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
