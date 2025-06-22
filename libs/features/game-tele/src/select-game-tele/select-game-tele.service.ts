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
  protected readonly entityTable = GAME_TELE_TABLE;
  protected readonly entityIdField = GAME_TELE_ID;
  protected entityNameField = GAME_TELE_NAME;
  protected readonly fieldList = GAME_TELE_SEARCH_FIELDS;
  private readonly init = this.init();
}
