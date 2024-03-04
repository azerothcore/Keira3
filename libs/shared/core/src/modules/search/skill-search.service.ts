import { Injectable } from '@angular/core';

import { Skill, SKILL_SEARCH_FIELDS, SKILL_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from './search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';

@Injectable({
  providedIn: 'root',
})
export class SkillSearchService extends SearchService<Skill> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, SKILL_TABLE, SKILL_SEARCH_FIELDS);
  }
}
