import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';

import { LanguageSearchService } from './language-search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';
import { MockedSqliteQueryService } from '../../services/services.mock';

describe('LanguageSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(MockedSqliteQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: LanguageSearchService = TestBed.inject(LanguageSearchService);
    expect(service).toBeTruthy();
  });
});
