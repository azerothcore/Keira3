import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { instance, mock } from 'ts-mockito';
import { SelectBroadcastTextService } from './select-broadcast-text.service';
import { BroadcastTextHandlerService } from './broadcast-text-handler.service';

describe(SelectBroadcastTextService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        SelectBroadcastTextService,
        BroadcastTextHandlerService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SelectBroadcastTextService)).toBeTruthy();
  });
});
