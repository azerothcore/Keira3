import { Injectable } from '@angular/core';
import { MysqlQueryService, SelectService } from '@keira/core';
import {
  QUEST_TEMPLATE_ID,
  QUEST_TEMPLATE_NAME,
  QUEST_TEMPLATE_SEARCH_FIELDS,
  QUEST_TEMPLATE_TABLE,
  QuestTemplate,
} from '@keira/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable()
export class SelectQuestService extends SelectService<QuestTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    readonly queryService: MysqlQueryService,
    public handlerService: QuestHandlerService,
  ) {
    super(queryService, handlerService, QUEST_TEMPLATE_TABLE, QUEST_TEMPLATE_ID, QUEST_TEMPLATE_NAME, QUEST_TEMPLATE_SEARCH_FIELDS);
  }
}
