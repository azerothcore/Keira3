import { Injectable } from '@angular/core';

import { Area, AREA_SEARCH_FIELDS, AREA_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class AreaSearchService extends SearchService<Area> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override queryService: SqliteQueryService) {
    super(queryService, AREA_TABLE, AREA_SEARCH_FIELDS);
  }
}
