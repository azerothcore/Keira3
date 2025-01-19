import { Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { GameTeleHandlerService } from '../game-tele-handler.service';
import { GAME_TELE_ID, GAME_TELE_NAME, GAME_TELE_SEARCH_FIELDS, GAME_TELE_TABLE, GameTele } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class SelectGameTeleService extends SelectService<GameTele> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    override readonly queryService: MysqlQueryService,
    public override readonly handlerService: GameTeleHandlerService,
  ) {
    super(queryService, handlerService, GAME_TELE_TABLE, GAME_TELE_ID, GAME_TELE_NAME, GAME_TELE_SEARCH_FIELDS);
  }
}
