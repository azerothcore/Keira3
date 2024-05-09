import { Injectable } from '@angular/core';

import { Holiday, HOLIDAY_SEARCH_FIELDS, HOLIDAY_TABLE } from '@keira/shared/acore-world-model';
import { SqliteSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class HolidaySearchService extends SqliteSearchService<Holiday> {
  protected readonly entityTable = HOLIDAY_TABLE;
  protected readonly fieldList = HOLIDAY_SEARCH_FIELDS;
}
