import { Injectable, inject } from '@angular/core';

import { Holiday, HOLIDAY_SEARCH_FIELDS, HOLIDAY_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class HolidaySearchService extends SearchService<Holiday> {
  protected override queryService = inject(SqliteQueryService);
  protected override readonly entityTable = HOLIDAY_TABLE;
  protected override readonly fieldList = HOLIDAY_SEARCH_FIELDS;
  constructor() {
    super();
    this.init();
  }
}
