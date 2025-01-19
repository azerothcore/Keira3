import { Injectable } from '@angular/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { GAME_TELE_SEARCH_FIELDS, GAME_TELE_TABLE, GameTele } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class GameTeleSearchService extends SearchService<GameTele> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(override readonly queryService: MysqlQueryService) {
    super(queryService, GAME_TELE_TABLE, GAME_TELE_SEARCH_FIELDS);
  }
}
