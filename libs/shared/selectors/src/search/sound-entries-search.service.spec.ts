import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { instance, mock } from 'ts-mockito';

import { SqliteQueryService } from '@keira/shared/db-layer';
import { SoundEntriesSearchService } from './sound-entries-search.service';

describe('SoundEntriesSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SqliteQueryService, useValue: instance(mock(SqliteQueryService)) },
      ],
    }),
  );

  it('should be created', () => {
    const service: SoundEntriesSearchService = TestBed.inject(SoundEntriesSearchService);
    expect(service).toBeTruthy();
  });
});
