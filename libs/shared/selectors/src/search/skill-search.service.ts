import { Injectable } from '@angular/core';

import { Skill, SKILL_SEARCH_FIELDS, SKILL_TABLE } from '@keira/shared/acore-world-model';
import { SqliteSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class SkillSearchService extends SqliteSearchService<Skill> {
  protected readonly entityTable = SKILL_TABLE;
  protected readonly fieldList = SKILL_SEARCH_FIELDS;
}
