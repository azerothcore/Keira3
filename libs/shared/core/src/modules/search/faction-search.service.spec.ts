import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';
import { MockedSqliteQueryService } from '@keira/test-utils';
import { FactionSearchService } from './faction-search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';

describe('FactionSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(MockedSqliteQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: FactionSearchService = TestBed.inject(FactionSearchService);
    expect(service).toBeTruthy();
  });
});
