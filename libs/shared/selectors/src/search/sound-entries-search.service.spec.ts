import { TestBed } from '@angular/core/testing';

import { instance, mock } from 'ts-mockito';

import { SqliteQueryService } from '@keira/shared/db-layer';
import { SoundEntriesSearchService } from './sound-entries-search.service';

describe('SoundEntriesSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteQueryService, useValue: instance(mock(SqliteQueryService)) }],
    }),
  );

  it('should be created', () => {
    const service: SoundEntriesSearchService = TestBed.inject(SoundEntriesSearchService);
    expect(service).toBeTruthy();
  });
});
