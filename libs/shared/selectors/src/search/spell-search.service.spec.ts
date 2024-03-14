import { TestBed } from '@angular/core/testing';

import { instance, mock } from 'ts-mockito';

import { SpellSearchService } from './spell-search.service';
import { SqliteQueryService } from '@keira/shared/db-layer';

describe('SpellSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(mock(SqliteQueryService)) }],
    }),
  );

  it('should be created', () => {
    const service: SpellSearchService = TestBed.inject(SpellSearchService);
    expect(service).toBeTruthy();
  });
});
