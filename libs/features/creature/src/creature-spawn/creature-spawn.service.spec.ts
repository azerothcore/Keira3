import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureSpawnService } from './creature-spawn.service';

describe('CreatureSpawnService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        CreatureSpawnService,
      ],
    }),
  );

  it('should be created', () => {
    const service: CreatureSpawnService = TestBed.inject(CreatureSpawnService);
    expect(service).toBeTruthy();
  });
});
