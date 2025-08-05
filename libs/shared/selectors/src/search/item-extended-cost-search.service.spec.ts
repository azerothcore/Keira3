import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { instance, mock } from 'ts-mockito';

import { ItemExtendedCostSearchService } from './item-extended-cost-search.service';
import { SqliteQueryService } from '@keira/shared/db-layer';

describe('ItemExtendedCostSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SqliteQueryService, useValue: instance(mock(SqliteQueryService)) },
      ],
    }),
  );

  it('should be created', () => {
    const service: ItemExtendedCostSearchService = TestBed.inject(ItemExtendedCostSearchService);
    expect(service).toBeTruthy();
  });
});
