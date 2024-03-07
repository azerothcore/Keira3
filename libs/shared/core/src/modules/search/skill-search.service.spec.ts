import { TestBed } from '@angular/core/testing';

import { instance } from 'ts-mockito';

import { SkillSearchService } from './skill-search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';
import { MockedSqliteQueryService, MockedSqliteService } from '../../services/services.mock';
import { SqliteService } from '../../services/sqlite.service';

describe('SkillSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        { provide: SqliteService, useValue: instance(MockedSqliteService) },
        { provide: SqliteQueryService, useValue: instance(MockedSqliteQueryService) },
      ],
    }),
  );

  it('should be created', () => {
    const service: SkillSearchService = TestBed.inject(SkillSearchService);
    expect(service).toBeTruthy();
  });
});
