import { Injectable } from '@angular/core';
import { NPC_TEXT_SEARCH_FIELDS, NPC_TEXT_TABLE, NpcText } from '@keira-shared/types/npc-text.type';
import { MysqlQueryService } from '../../services/mysql-query.service';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class NpcTextSearchService extends SearchService<NpcText> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(readonly queryService: MysqlQueryService) {
    super(queryService, NPC_TEXT_TABLE, NPC_TEXT_SEARCH_FIELDS);
  }
}
