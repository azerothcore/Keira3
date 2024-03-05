import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedMysqlQueryService, MockedToastrService, MysqlQueryService } from '@keira/shared/core';

import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { GossipHandlerService } from '../gossip-handler.service';
import { GossipMenuService } from './gossip-menu.service';

describe('GossipMenuService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        GossipHandlerService,
        GossipMenuService,
      ],
    }),
  );

  it('should be created', () => {
    const service: GossipMenuService = TestBed.inject(GossipMenuService);
    expect(service).toBeTruthy();
  });
});
