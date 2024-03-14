import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { QuestHandlerService } from '../quest-handler.service';
import { GameobjectQueststarterService } from './gameobject-queststarter.service';

describe('GameobjectQueststarterService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        QuestHandlerService,
        GameobjectQueststarterService,
      ],
    }),
  );

  it('should be created', () => {
    const service: GameobjectQueststarterService = TestBed.inject(GameobjectQueststarterService);
    expect(service).toBeTruthy();
  });
});
