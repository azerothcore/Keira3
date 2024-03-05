import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';

import { HolidaySearchService } from './holiday-search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';
import { MockedSqliteQueryService } from '../../services/services-mock.spec';

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
