import { Injectable } from '@angular/core';

import { SearchService } from './search.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { SKILL_SEARCH_FIELDS, SKILL_TABLE, Skill } from '../../types/skill.type';

@Injectable({
  providedIn: 'root',
})
export class SkillSearchService extends SearchService<Skill> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, SKILL_TABLE, SKILL_SEARCH_FIELDS);
  }
}
