import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';
import { MockedSqliteQueryService } from '@keira/shared/test-utils';
import { SpellSearchService } from './spell-search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';

describe('SpellSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(MockedSqliteQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: SpellSearchService = TestBed.inject(SpellSearchService);
    expect(service).toBeTruthy();
  });
});
