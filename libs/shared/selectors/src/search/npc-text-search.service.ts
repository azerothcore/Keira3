import { Injectable } from '@angular/core';
import { NPC_TEXT_SEARCH_FIELDS, NPC_TEXT_TABLE, NpcText } from '@keira/shared/acore-world-model';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class NpcTextSearchService extends SearchService<NpcText> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(override readonly queryService: MysqlQueryService) {
    super(queryService, NPC_TEXT_TABLE, NPC_TEXT_SEARCH_FIELDS);
  }
}
