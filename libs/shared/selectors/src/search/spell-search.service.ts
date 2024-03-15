import { Injectable } from '@angular/core';

import { Spell, SPELL_SEARCH_FIELDS, SPELL_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class SpellSearchService extends SearchService<Spell> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, SPELL_TABLE, SPELL_SEARCH_FIELDS);
  }
}
