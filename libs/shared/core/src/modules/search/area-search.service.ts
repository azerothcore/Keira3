import { Injectable } from '@angular/core';

import { Area, AREA_SEARCH_FIELDS, AREA_TABLE } from '@keira/acore-world-model';
import { SearchService } from './search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';

@Injectable({
  providedIn: 'root',
})
export class AreaSearchService extends SearchService<Area> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, AREA_TABLE, AREA_SEARCH_FIELDS);
  }
}
