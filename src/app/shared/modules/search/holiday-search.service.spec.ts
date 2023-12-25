import { TestBed } from '@angular/core/testing';
import { SqliteQueryService } from '@keira-shared/services/query/sqlite-query.service';
import { instance } from 'ts-mockito';
import { MockedSqliteQueryService } from '../../testing/mocks';
import { HolidaySearchService } from './holiday-search.service';

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
