import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { GameTeleHandlerService } from '../game-tele-handler.service';
import { GAME_TELE_ID, GAME_TELE_NAME, GAME_TELE_SEARCH_FIELDS, GAME_TELE_TABLE, GameTele } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class SelectGameTeleService extends SelectService<GameTele> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(GameTeleHandlerService);
  protected override readonly entityTable = GAME_TELE_TABLE;
  protected override readonly entityIdField = GAME_TELE_ID;
  protected override entityNameField = GAME_TELE_NAME;
  protected override readonly fieldList = GAME_TELE_SEARCH_FIELDS;
  constructor() {
    super();
    this.init();
  }
}
