import { Injectable, inject } from '@angular/core';

import { Skill, SKILL_SEARCH_FIELDS, SKILL_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class SkillSearchService extends SearchService<Skill> {
  protected override queryService: SqliteQueryService;

  constructor() {
    const queryService = inject(SqliteQueryService);

    super(queryService, SKILL_TABLE, SKILL_SEARCH_FIELDS);

    this.queryService = queryService;
  }
}
