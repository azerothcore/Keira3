import { Injectable } from '@angular/core';

import { QUEST_TEMPLATE_SEARCH_FIELDS, QUEST_TEMPLATE_TABLE, QuestTemplate } from '@keira/shared/acore-world-model';
import { SearchService } from './search.service';
import { MysqlQueryService } from '@keira/shared/core';

@Injectable({
  providedIn: 'root',
})
export class QuestSearchService extends SearchService<QuestTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: MysqlQueryService) {
    super(queryService, QUEST_TEMPLATE_TABLE, QUEST_TEMPLATE_SEARCH_FIELDS);
  }
}
