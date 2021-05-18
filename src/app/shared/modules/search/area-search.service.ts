import { Injectable } from '@angular/core';

import { SearchService } from './search.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { AREA_SEARCH_FIELDS, AREA_TABLE, Area } from '../../types/area.type';

@Injectable({
  providedIn: 'root',
})
export class AreaSearchService extends SearchService<Area> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, AREA_TABLE, AREA_SEARCH_FIELDS);
  }
}
