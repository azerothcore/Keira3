import { Injectable } from '@angular/core';

import { Faction, FACTION_SEARCH_FIELDS, FACTION_TABLE } from '@keira/shared/acore-world-model';
import { SqliteSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class FactionSearchService extends SqliteSearchService<Faction> {
  protected readonly entityTable = FACTION_TABLE;
  protected readonly fieldList = FACTION_SEARCH_FIELDS;
}
