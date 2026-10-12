import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { instance, mock } from 'ts-mockito';
import { GossipHandlerService } from '../gossip-handler.service';
import { SelectGossipService } from './select-gossip.service';

describe('SelectGossipService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        GossipHandlerService,
        SelectGossipService,
      ],
    }),
  );

  it('should be created', () => {
    const service: SelectGossipService = TestBed.inject(SelectGossipService);
    expect(service).toBeTruthy();
  });
});
