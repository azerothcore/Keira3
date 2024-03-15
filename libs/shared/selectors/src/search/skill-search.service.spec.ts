import { TestBed } from '@angular/core/testing';

import { instance, mock } from 'ts-mockito';

import { SkillSearchService } from './skill-search.service';
import { SqliteQueryService, SqliteService } from '@keira/shared/db-layer';

describe('SkillSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        { provide: SqliteQueryService, useValue: instance(mock(SqliteQueryService)) },
      ],
    }),
  );

  it('should be created', () => {
    const service: SkillSearchService = TestBed.inject(SkillSearchService);
    expect(service).toBeTruthy();
  });
});
