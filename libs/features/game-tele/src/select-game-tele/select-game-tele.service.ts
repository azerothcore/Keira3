import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { GameTeleHandlerService } from '../game-tele-handler.service';
import { GAME_TELE_ID, GAME_TELE_NAME, GAME_TELE_SEARCH_FIELDS, GAME_TELE_TABLE, GameTele } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class SelectGameTeleService extends SelectService<GameTele> {
  override readonly queryService: MysqlQueryService;
  override readonly handlerService: GameTeleHandlerService;

  constructor() {
    const queryService = inject(MysqlQueryService);
    const handlerService = inject(GameTeleHandlerService);

    super(queryService, handlerService, GAME_TELE_TABLE, GAME_TELE_ID, GAME_TELE_NAME, GAME_TELE_SEARCH_FIELDS);

    this.queryService = queryService;
    this.handlerService = handlerService;
  }
}
