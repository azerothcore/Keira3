import { Injectable } from '@angular/core';

import { QUEST_TEMPLATE_SEARCH_FIELDS, QUEST_TEMPLATE_TABLE, QuestTemplate } from '@keira/shared/acore-world-model';
import { MysqlSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class QuestSearchService extends MysqlSearchService<QuestTemplate> {
  protected readonly entityTable = QUEST_TEMPLATE_TABLE;
  protected readonly fieldList = QUEST_TEMPLATE_SEARCH_FIELDS;
}
