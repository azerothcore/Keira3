import { Injectable } from '@angular/core';
import { SelectService } from '@keira-abstract/service/select/select.service';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import {
  QuestTemplate,
  QUEST_TEMPLATE_ID,
  QUEST_TEMPLATE_NAME,
  QUEST_TEMPLATE_SEARCH_FIELDS,
  QUEST_TEMPLATE_TABLE,
} from '@keira-types/quest-template.type';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable()
export class SelectQuestService extends SelectService<QuestTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(readonly queryService: MysqlQueryService, public handlerService: QuestHandlerService) {
    super(queryService, handlerService, QUEST_TEMPLATE_TABLE, QUEST_TEMPLATE_ID, QUEST_TEMPLATE_NAME, QUEST_TEMPLATE_SEARCH_FIELDS);
  }
}
