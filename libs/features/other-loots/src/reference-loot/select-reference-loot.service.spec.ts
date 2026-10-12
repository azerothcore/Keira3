import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { instance, mock } from 'ts-mockito';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { SelectReferenceLootService } from './select-reference-loot.service';

describe('SelectReferenceLootService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        SelectReferenceLootService,
        ReferenceLootHandlerService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SelectReferenceLootService)).toBeTruthy();
  });
});
