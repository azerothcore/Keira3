import { Injectable } from '@angular/core';

import { Area, AREA_SEARCH_FIELDS, AREA_TABLE } from '@keira/shared/acore-world-model';
import { SqliteSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class AreaSearchService extends SqliteSearchService<Area> {
  protected readonly entityTable = AREA_TABLE;
  protected readonly fieldList = AREA_SEARCH_FIELDS;
}
