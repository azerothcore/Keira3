import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { instance, mock } from 'ts-mockito';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { CreatureSearchService } from './creature-search.service';

describe('CreatureSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
      ],
    }),
  );

  it('should be created', () => {
    const service: CreatureSearchService = TestBed.inject(CreatureSearchService);
    expect(service).toBeTruthy();
  });
});
