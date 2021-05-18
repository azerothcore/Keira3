import { TestBed } from '@angular/core/testing';
import { instance } from 'ts-mockito';

import { AreaSearchService } from './area-search.service';
import { MockedSqliteQueryService } from '../../testing/mocks';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';

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
