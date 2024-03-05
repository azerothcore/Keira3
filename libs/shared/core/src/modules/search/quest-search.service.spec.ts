import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';
import { MockedSqliteQueryService } from '@keira/shared/test-utils';
import { QuestSearchService } from './quest-search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';

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
