import { TestBed } from '@angular/core/testing';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { instance } from 'ts-mockito';
import { MockedSqliteQueryService } from '../../testing/mocks';
import { SkillSearchService } from './skill-search.service';

describe('SkillSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(MockedSqliteQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: SkillSearchService = TestBed.inject(SkillSearchService);
    expect(service).toBeTruthy();
  });
});
