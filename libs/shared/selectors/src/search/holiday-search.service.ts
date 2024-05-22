import { Injectable } from '@angular/core';

import { Holiday, HOLIDAY_SEARCH_FIELDS, HOLIDAY_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class HolidaySearchService extends SearchService<Holiday> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override queryService: SqliteQueryService) {
    super(queryService, HOLIDAY_TABLE, HOLIDAY_SEARCH_FIELDS);
  }
}
