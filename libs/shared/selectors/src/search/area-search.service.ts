import { Injectable, inject } from '@angular/core';

import { Area, AREA_SEARCH_FIELDS, AREA_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class AreaSearchService extends SearchService<Area> {
  protected override queryService = inject(SqliteQueryService);
  protected readonly entityTable = AREA_TABLE;
  protected readonly fieldList = AREA_SEARCH_FIELDS;
  private readonly init = this.init();
}
