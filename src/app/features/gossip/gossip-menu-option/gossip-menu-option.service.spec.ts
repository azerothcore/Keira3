import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { GossipMenuOptionService } from './gossip-menu-option.service';
import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '@keira-testing/mocks';
import { GossipHandlerService } from '../gossip-handler.service';

describe('GossipMenuOptionService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      GossipHandlerService,
      GossipMenuOptionService,
    ]
  }));

  it('should be created', () => {
    const service: GossipMenuOptionService = TestBed.inject(GossipMenuOptionService);
    expect(service).toBeTruthy();
  });
});
