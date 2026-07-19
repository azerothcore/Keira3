import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { instance, mock } from 'ts-mockito';
import { SelectNpcTextService } from './select-npc-text.service';
import { NpcTextHandlerService } from './npc-text-handler.service';

describe(SelectNpcTextService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        SelectNpcTextService,
        NpcTextHandlerService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SelectNpcTextService)).toBeTruthy();
  });
});
