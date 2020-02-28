import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { GossipMenuService } from './gossip-menu.service';
import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '@keira-testing/mocks';
import { GossipHandlerService } from '../gossip-handler.service';

describe('GossipMenuService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      GossipHandlerService,
      GossipMenuService,
    ]
  }));

  it('should be created', () => {
    const service: GossipMenuService = TestBed.inject(GossipMenuService);
    expect(service).toBeTruthy();
  });
});
