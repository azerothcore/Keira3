import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import {
  QUEST_TEMPLATE_ID,
  QUEST_TEMPLATE_NAME,
  QUEST_TEMPLATE_SEARCH_FIELDS,
  QUEST_TEMPLATE_TABLE,
  QuestTemplate,
} from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';
import { MysqlQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class SelectQuestService extends SelectService<QuestTemplate> {
  override readonly queryService: MysqlQueryService;
  override readonly handlerService: QuestHandlerService;

  constructor() {
    const queryService = inject(MysqlQueryService);
    const handlerService = inject(QuestHandlerService);

    super(queryService, handlerService, QUEST_TEMPLATE_TABLE, QUEST_TEMPLATE_ID, QUEST_TEMPLATE_NAME, QUEST_TEMPLATE_SEARCH_FIELDS);

    this.queryService = queryService;
    this.handlerService = handlerService;
  }
}
