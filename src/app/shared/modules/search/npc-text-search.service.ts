import { Injectable } from '@angular/core';
import { NPC_TEXT_SEARCH_FIELDS, NPC_TEXT_TABLE } from '@keira-shared/types/npc-text.type';
import { MysqlQueryService } from '../../services/query/mysql-query.service';
import { ItemTemplate } from '../../types/item-template.type';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class NpcTextSearchService extends SearchService<ItemTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(readonly queryService: MysqlQueryService) {
    super(queryService, NPC_TEXT_TABLE, NPC_TEXT_SEARCH_FIELDS);
  }
}
