import { TestBed } from '@angular/core/testing';

import { SqliteQueryService } from './sqlite-query.service';

describe('SqliteQueryService', () => {
  let service: SqliteQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqliteQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
