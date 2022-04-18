import { Injectable } from '@angular/core';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { Map, MAP_SEARCH_FIELDS, MAP_TABLE } from '../../types/map.type';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class MapSearchService extends SearchService<Map> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, MAP_TABLE, MAP_SEARCH_FIELDS);
  }
}
