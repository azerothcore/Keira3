import { Injectable } from '@angular/core';
import { SqliteQueryService } from '@keira-shared/services/query/sqlite-query.service';
import { Area, AREA_SEARCH_FIELDS, AREA_TABLE } from '../../types/area.type';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class AreaSearchService extends SearchService<Area> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, AREA_TABLE, AREA_SEARCH_FIELDS);
  }
}
