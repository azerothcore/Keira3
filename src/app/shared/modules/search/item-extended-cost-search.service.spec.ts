import { TestBed } from '@angular/core/testing';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { instance } from 'ts-mockito';
import { MockedSqliteQueryService } from '../../testing/mocks';
import { ItemExtendedCostSearchService } from './item-extended-cost-search.service';

describe('ItemExtendedCostSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(MockedSqliteQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: ItemExtendedCostSearchService = TestBed.inject(ItemExtendedCostSearchService);
    expect(service).toBeTruthy();
  });
});
