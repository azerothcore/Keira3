import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { instance, mock } from 'ts-mockito';
import { ItemHandlerService } from '../item-handler.service';
import { SelectItemService } from './select-item.service';

describe('SelectItemService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
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
