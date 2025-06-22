import { Injectable, inject } from '@angular/core';

import { Faction, FACTION_SEARCH_FIELDS, FACTION_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class FactionSearchService extends SearchService<Faction> {
  protected override queryService = inject(SqliteQueryService);
  protected override readonly entityTable = FACTION_TABLE;
  protected override readonly fieldList = FACTION_SEARCH_FIELDS;
  constructor() {
    super();
    this.init();
  }
}
