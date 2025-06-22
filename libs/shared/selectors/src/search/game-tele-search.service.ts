import { Injectable, inject } from '@angular/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { GAME_TELE_SEARCH_FIELDS, GAME_TELE_TABLE, GameTele } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class GameTeleSearchService extends SearchService<GameTele> {
  override readonly queryService = inject(MysqlQueryService);
  protected readonly entityTable = GAME_TELE_TABLE;
  protected readonly fieldList = GAME_TELE_SEARCH_FIELDS;
  private readonly init = this.init();
}
