import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedMysqlQueryService, MockedToastrService, MysqlQueryService, SqliteService, MockedSqliteService } from '@keira/shared/core';

import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { QuestHandlerService } from '../quest-handler.service';
import { GameobjectQueststarterService } from './gameobject-queststarter.service';

describe('GameobjectQueststarterService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        { provide: SqliteService, useValue: instance(MockedSqliteService) },
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
