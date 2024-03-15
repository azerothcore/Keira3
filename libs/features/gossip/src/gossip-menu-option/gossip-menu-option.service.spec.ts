import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { GossipHandlerService } from '../gossip-handler.service';
import { GossipMenuOptionService } from './gossip-menu-option.service';

describe('GossipMenuOptionService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
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
