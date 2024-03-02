import { Injectable } from '@angular/core';
import { SqliteQueryService } from '@keira-shared/services/query/sqlite-query.service';
import { Spell, SPELL_SEARCH_FIELDS, SPELL_TABLE } from '@keira/acore-world-model';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class SpellSearchService extends SearchService<Spell> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, SPELL_TABLE, SPELL_SEARCH_FIELDS);
  }
}
