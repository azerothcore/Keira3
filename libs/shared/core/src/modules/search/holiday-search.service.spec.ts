import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';
import { MockedSqliteQueryService } from '@keira/shared/test-utils';
import { HolidaySearchService } from './holiday-search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';

describe('HolidaySearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(MockedSqliteQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: HolidaySearchService = TestBed.inject(HolidaySearchService);
    expect(service).toBeTruthy();
  });
});
