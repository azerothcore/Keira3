import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { instance, mock } from 'ts-mockito';

import { LanguageSearchService } from './language-search.service';
import { SqliteQueryService } from '@keira/shared/db-layer';

describe('LanguageSearchService', () => {
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
    const service: LanguageSearchService = TestBed.inject(LanguageSearchService);
    expect(service).toBeTruthy();
  });
});
