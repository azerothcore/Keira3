import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';

import { MapSearchService } from './map-search.service';
import { SqliteQueryService } from '@keira/shared/core';
import { MockedSqliteQueryService } from '../../services/services.mock';

describe('MapSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(MockedSqliteQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: MapSearchService = TestBed.inject(MapSearchService);
    expect(service).toBeTruthy();
  });
});
