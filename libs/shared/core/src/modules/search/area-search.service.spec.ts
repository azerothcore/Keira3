import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';

import { AreaSearchService } from './area-search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';
import { MockedSqliteQueryService } from '../../services/services-mock.spec';

describe('AreaSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(MockedSqliteQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: AreaSearchService = TestBed.inject(AreaSearchService);
    expect(service).toBeTruthy();
  });
});
