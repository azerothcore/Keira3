import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';
import { MockedSqliteQueryService } from '@keira/shared/test-utils';
import { LanguageSearchService } from './language-search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';

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
