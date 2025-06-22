import { Injectable, inject } from '@angular/core';

import { QUEST_TEMPLATE_SEARCH_FIELDS, QUEST_TEMPLATE_TABLE, QuestTemplate } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class QuestSearchService extends SearchService<QuestTemplate> {
  protected override queryService = inject(MysqlQueryService);
  protected readonly entityTable = QUEST_TEMPLATE_TABLE;
  protected readonly fieldList = QUEST_TEMPLATE_SEARCH_FIELDS;
  private readonly init = this.init();
}
