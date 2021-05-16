import { Injectable } from '@angular/core';

import { SearchService } from './search.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { QUEST_TEMPLATE_SEARCH_FIELDS, QUEST_TEMPLATE_TABLE, QuestTemplate } from '../../types/quest-template.type';

@Injectable({
  providedIn: 'root',
})
export class QuestSearchService extends SearchService<QuestTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: MysqlQueryService) {
    super(queryService, QUEST_TEMPLATE_TABLE, QUEST_TEMPLATE_SEARCH_FIELDS);
  }
}
