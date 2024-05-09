import { Injectable } from '@angular/core';

import { Map, MAP_SEARCH_FIELDS, MAP_TABLE } from '@keira/shared/acore-world-model';
import { SqliteSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class MapSearchService extends SqliteSearchService<Map> {
  protected readonly entityTable = MAP_TABLE;
  protected readonly fieldList = MAP_SEARCH_FIELDS;
}
