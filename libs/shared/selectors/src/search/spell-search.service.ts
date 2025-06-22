import { Injectable, inject } from '@angular/core';

import { Spell, SPELL_SEARCH_FIELDS, SPELL_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class SpellSearchService extends SearchService<Spell> {
  protected override queryService = inject(SqliteQueryService);
  protected readonly entityTable = SPELL_TABLE;
  protected readonly fieldList = SPELL_SEARCH_FIELDS;
  private readonly init = this.init();
}
