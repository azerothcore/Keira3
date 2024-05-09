import { Injectable } from '@angular/core';

import { Spell, SPELL_SEARCH_FIELDS, SPELL_TABLE } from '@keira/shared/acore-world-model';
import { SqliteSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class SpellSearchService extends SqliteSearchService<Spell> {
  protected readonly entityTable = SPELL_TABLE;
  protected readonly fieldList = SPELL_SEARCH_FIELDS;
}
