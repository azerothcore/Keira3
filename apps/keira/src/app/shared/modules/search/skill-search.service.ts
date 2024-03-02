import { Injectable } from '@angular/core';
import { SqliteQueryService } from '@keira-shared/services/query/sqlite-query.service';
import { Skill, SKILL_SEARCH_FIELDS, SKILL_TABLE } from '@keira/acore-world-model';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class SkillSearchService extends SearchService<Skill> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, SKILL_TABLE, SKILL_SEARCH_FIELDS);
  }
}
