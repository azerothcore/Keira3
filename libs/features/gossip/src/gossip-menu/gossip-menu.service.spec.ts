import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { GossipHandlerService } from '../gossip-handler.service';
import { GossipMenuService } from './gossip-menu.service';

describe('GossipMenuService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
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
