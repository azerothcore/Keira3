import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { SelectGossipService } from './select-gossip.service';
import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService } from '@keira-testing/mocks';
import { GossipHandlerService } from '../gossip-handler.service';

describe('SelectGossipService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      GossipHandlerService,
      SelectGossipService,
    ]
  }));

  it('should be created', () => {
    const service: SelectGossipService = TestBed.get(SelectGossipService);
    expect(service).toBeTruthy();
  });
});
