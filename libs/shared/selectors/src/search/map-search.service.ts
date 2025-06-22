import { Injectable, inject } from '@angular/core';

import { Map, MAP_SEARCH_FIELDS, MAP_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class MapSearchService extends SearchService<Map> {
  protected override queryService = inject(SqliteQueryService);
  protected override readonly entityTable = MAP_TABLE;
  protected override readonly fieldList = MAP_SEARCH_FIELDS;
  constructor() {
    super();
    this.init();
  }
}
