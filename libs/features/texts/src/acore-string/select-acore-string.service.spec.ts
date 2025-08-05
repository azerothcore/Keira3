import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { instance, mock } from 'ts-mockito';
import { SelectAcoreStringService } from './select-acore-string.service';
import { AcoreStringHandlerService } from './acore-string-handler.service';

describe(SelectAcoreStringService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        SelectAcoreStringService,
        AcoreStringHandlerService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SelectAcoreStringService)).toBeTruthy();
  });
});
