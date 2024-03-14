import { TestBed } from '@angular/core/testing';

import { instance, mock } from 'ts-mockito';

import { AreaSearchService } from './area-search.service';
import { SqliteQueryService } from '@keira/shared/db-layer';

describe('AreaSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(mock(SqliteQueryService)) }],
    }),
  );

  it('should be created', () => {
    const service: AreaSearchService = TestBed.inject(AreaSearchService);
    expect(service).toBeTruthy();
  });
});
