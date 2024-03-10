import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedMysqlQueryService, MockedToastrService, MysqlQueryService, SqliteService, MockedSqliteService } from '@keira/shared/core';

import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { NpcTrainerService } from './npc-trainer.service';

describe('NpcTrainerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        { provide: SqliteService, useValue: instance(MockedSqliteService) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        NpcTrainerService,
      ],
    }),
  );

  it('should be created', () => {
    const service: NpcTrainerService = TestBed.inject(NpcTrainerService);
    expect(service).toBeTruthy();
  });
});
