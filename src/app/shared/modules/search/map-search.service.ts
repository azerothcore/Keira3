import { Injectable } from '@angular/core';

import { SearchService } from './search.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import {
  MAP_SEARCH_FIELDS,
  MAP_TABLE,
  Map,
} from '../../types/map.type';

@Injectable({
  providedIn: 'root'
})
export class MapSearchService extends SearchService<Map> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected queryService: SqliteQueryService,
  ) {
    super(queryService, MAP_TABLE, MAP_SEARCH_FIELDS);
  }
}
