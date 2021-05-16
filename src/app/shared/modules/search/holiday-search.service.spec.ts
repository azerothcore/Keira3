import { TestBed } from '@angular/core/testing';
import { instance } from 'ts-mockito';

import { HolidaySearchService } from './holiday-search.service';
import { MockedSqliteQueryService } from '../../testing/mocks';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';

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
