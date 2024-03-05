import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';

import { SpellSearchService } from './spell-search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';
import { MockedSqliteQueryService } from '../../services/services-mock.spec';

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
