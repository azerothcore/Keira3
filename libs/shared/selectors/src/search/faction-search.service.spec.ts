import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';

import { FactionSearchService } from './faction-search.service';
import { SqliteQueryService } from '@keira/shared/core';
import { MockedSqliteQueryService } from '../../services/services.mock';

describe('FactionSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(MockedSqliteQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: FactionSearchService = TestBed.inject(FactionSearchService);
    expect(service).toBeTruthy();
  });
});
