import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { SelectGossipService } from './select-gossip.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { GossipHandlerService } from '../gossip-handler.service';

describe('SelectGossipService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
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
