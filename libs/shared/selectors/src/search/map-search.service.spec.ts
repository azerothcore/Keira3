import { TestBed } from '@angular/core/testing';

import { instance, mock } from 'ts-mockito';

import { MapSearchService } from './map-search.service';
import { SqliteQueryService } from '@keira/shared/db-layer';

describe('MapSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(mock(SqliteQueryService)) }],
    }),
  );

  it('should be created', () => {
    const service: MapSearchService = TestBed.inject(MapSearchService);
    expect(service).toBeTruthy();
  });
});
