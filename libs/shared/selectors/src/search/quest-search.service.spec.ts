import { TestBed } from '@angular/core/testing';

import { instance, mock } from 'ts-mockito';

import { QuestSearchService } from './quest-search.service';
import { SqliteQueryService } from '@keira/shared/db-layer';

describe('QuestSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(mock(SqliteQueryService)) }],
    }),
  );

  it('should be created', () => {
    const service: QuestSearchService = TestBed.inject(QuestSearchService);
    expect(service).toBeTruthy();
  });
});
