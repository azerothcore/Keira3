import { TestBed } from '@angular/core/testing';
import { instance } from 'ts-mockito';

import { MapSearchService } from './map-search.service';
import { MockedSqliteQueryService } from '../../testing/mocks';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';

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
