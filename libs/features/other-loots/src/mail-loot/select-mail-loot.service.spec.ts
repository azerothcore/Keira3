import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { instance, mock } from 'ts-mockito';
import { MailLootHandlerService } from './mail-loot-handler.service';
import { SelectMailLootService } from './select-mail-loot.service';

describe('SelectMailLootService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        SelectMailLootService,
        MailLootHandlerService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SelectMailLootService)).toBeTruthy();
  });
});
