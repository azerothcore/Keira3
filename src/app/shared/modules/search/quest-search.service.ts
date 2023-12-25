import { Injectable } from '@angular/core';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { QuestTemplate, QUEST_TEMPLATE_SEARCH_FIELDS, QUEST_TEMPLATE_TABLE } from '../../types/quest-template.type';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class QuestSearchService extends SearchService<QuestTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: MysqlQueryService) {
    super(queryService, QUEST_TEMPLATE_TABLE, QUEST_TEMPLATE_SEARCH_FIELDS);
  }
}
