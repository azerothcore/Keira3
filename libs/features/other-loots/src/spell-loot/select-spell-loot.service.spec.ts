import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { instance, mock } from 'ts-mockito';
import { SelectSpellLootService } from './select-spell-loot.service';
import { SpellLootHandlerService } from './spell-loot-handler.service';

describe('SelectSpellLootService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        SelectSpellLootService,
        SpellLootHandlerService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SelectSpellLootService)).toBeTruthy();
  });
});
