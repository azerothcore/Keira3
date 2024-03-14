import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';

import { QuestSearchService } from './quest-search.service';
import { SqliteQueryService } from '@keira/shared/core';
import { MockedSqliteQueryService } from '../../services/services.mock';

describe('QuestSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(MockedSqliteQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: QuestSearchService = TestBed.inject(QuestSearchService);
    expect(service).toBeTruthy();
  });
});
