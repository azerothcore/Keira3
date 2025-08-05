import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { instance, mock } from 'ts-mockito';

import { ItemEnchantmentSearchService } from './item-enchantment-search.service';
import { SqliteQueryService } from '@keira/shared/db-layer';

describe('ItemEnchantmentSearchService', () => {
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
    const service: ItemEnchantmentSearchService = TestBed.inject(ItemEnchantmentSearchService);
    expect(service).toBeTruthy();
  });
});
