import { Injectable } from '@angular/core';

import { SearchService } from './search.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { HOLIDAY_SEARCH_FIELDS, HOLIDAY_TABLE, Holiday } from '../../types/holiday.type';

@Injectable({
  providedIn: 'root',
})
export class HolidaySearchService extends SearchService<Holiday> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, HOLIDAY_TABLE, HOLIDAY_SEARCH_FIELDS);
  }
}
