import { Injectable } from '@angular/core';

import { Map, MAP_SEARCH_FIELDS, MAP_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class MapSearchService extends SearchService<Map> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override queryService: SqliteQueryService) {
    super(queryService, MAP_TABLE, MAP_SEARCH_FIELDS);
  }
}
