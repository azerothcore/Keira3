import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { instance, mock } from 'ts-mockito';
import { GossipHandlerService } from '../gossip-handler.service';
import { SelectGossipService } from './select-gossip.service';

describe('SelectGossipService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) }, GossipHandlerService, SelectGossipService],
    }),
  );

  it('should be created', () => {
    const service: SelectGossipService = TestBed.inject(SelectGossipService);
    expect(service).toBeTruthy();
  });
});
