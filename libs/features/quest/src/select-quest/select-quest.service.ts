import { inject, Injectable } from '@angular/core';
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
  public readonly handlerService = inject(QuestHandlerService);
  protected readonly entityTable = QUEST_TEMPLATE_TABLE;
  protected readonly entityIdField = QUEST_TEMPLATE_ID;
  protected readonly entityNameField = QUEST_TEMPLATE_NAME;
  protected readonly fieldList = QUEST_TEMPLATE_SEARCH_FIELDS;
}
