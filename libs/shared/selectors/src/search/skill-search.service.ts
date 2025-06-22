import { Injectable, inject } from '@angular/core';

import { Skill, SKILL_SEARCH_FIELDS, SKILL_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class SkillSearchService extends SearchService<Skill> {
  protected override queryService = inject(SqliteQueryService);
  protected readonly entityTable = SKILL_TABLE;
  protected readonly fieldList = SKILL_SEARCH_FIELDS;
  private readonly init = this.init();
}
