import { Injectable } from '@angular/core';
import { SqliteQueryService } from '@keira-shared/services/query/sqlite-query.service';
import { Holiday, HOLIDAY_SEARCH_FIELDS, HOLIDAY_TABLE } from '@keira/acore-world-model';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class HolidaySearchService extends SearchService<Holiday> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, HOLIDAY_TABLE, HOLIDAY_SEARCH_FIELDS);
  }
}
