import { TestBed } from '@angular/core/testing';

import { instance, mock } from 'ts-mockito';

import { FactionSearchService } from './faction-search.service';
import { SqliteQueryService } from '@keira/shared/db-layer';

describe('FactionSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(mock(SqliteQueryService)) }],
    }),
  );

  it('should be created', () => {
    const service: FactionSearchService = TestBed.inject(FactionSearchService);
    expect(service).toBeTruthy();
  });
});
