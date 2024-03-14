import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';

import { ItemExtendedCostSearchService } from './item-extended-cost-search.service';
import { SqliteQueryService } from '@keira/shared/core';
import { MockedSqliteQueryService } from '../../services/services.mock';

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
