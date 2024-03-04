import { Injectable } from '@angular/core';

import { Map, MAP_SEARCH_FIELDS, MAP_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from './search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';

@Injectable({
  providedIn: 'root',
})
export class MapSearchService extends SearchService<Map> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, MAP_TABLE, MAP_SEARCH_FIELDS);
  }
}
