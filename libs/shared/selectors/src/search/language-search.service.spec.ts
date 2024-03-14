import { TestBed } from '@angular/core/testing';

import { instance, mock } from 'ts-mockito';

import { LanguageSearchService } from './language-search.service';
import { SqliteQueryService } from '@keira/shared/db-layer';

describe('LanguageSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(mock(SqliteQueryService)) }],
    }),
  );

  it('should be created', () => {
    const service: LanguageSearchService = TestBed.inject(LanguageSearchService);
    expect(service).toBeTruthy();
  });
});
