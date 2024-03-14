import { TestBed } from '@angular/core/testing';

import { instance, mock } from 'ts-mockito';

import { HolidaySearchService } from './holiday-search.service';
import { SqliteQueryService } from '@keira/shared/db-layer';

describe('HolidaySearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(mock(SqliteQueryService)) }],
    }),
  );

  it('should be created', () => {
    const service: HolidaySearchService = TestBed.inject(HolidaySearchService);
    expect(service).toBeTruthy();
  });
});
