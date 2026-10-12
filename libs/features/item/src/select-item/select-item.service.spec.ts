import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { instance, mock } from 'ts-mockito';
import { ItemHandlerService } from '../item-handler.service';
import { SelectItemService } from './select-item.service';

describe('SelectItemService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        ItemHandlerService,
        SelectItemService,
      ],
    }),
  );

  it('should be created', () => {
    const service: SelectItemService = TestBed.inject(SelectItemService);
    expect(service).toBeTruthy();
  });
});
