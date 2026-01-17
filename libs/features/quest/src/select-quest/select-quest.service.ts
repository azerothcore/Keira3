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
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(QuestHandlerService);
  protected override readonly entityTable = QUEST_TEMPLATE_TABLE;
  protected override readonly entityIdField = QUEST_TEMPLATE_ID;
  protected override entityNameField = QUEST_TEMPLATE_NAME;
  protected override readonly fieldList = QUEST_TEMPLATE_SEARCH_FIELDS;
  constructor() {
    super();
    this.init();
  }
}
