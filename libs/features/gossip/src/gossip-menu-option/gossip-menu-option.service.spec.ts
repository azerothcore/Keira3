import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedMysqlQueryService, MockedToastrService, MysqlQueryService, SqliteService, MockedSqliteService } from '@keira/shared/core';

import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { GossipHandlerService } from '../gossip-handler.service';
import { GossipMenuOptionService } from './gossip-menu-option.service';

describe('GossipMenuOptionService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        { provide: SqliteService, useValue: instance(MockedSqliteService) },
        GossipHandlerService,
        GossipMenuOptionService,
      ],
    }),
  );

  it('should be created', () => {
    const service: GossipMenuOptionService = TestBed.inject(GossipMenuOptionService);
    expect(service).toBeTruthy();
  });
});
