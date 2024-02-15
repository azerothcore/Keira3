import { TestBed } from '@angular/core/testing';
import { SqliteQueryService } from '@keira-shared/services/query/sqlite-query.service';
import { instance } from 'ts-mockito';
import { MockedSqliteQueryService } from '../../testing/mocks';
import { LanguageSearchService } from './language-search.service';

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
