import { Injectable } from '@angular/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { Conditions, CONDITIONS_SEARCH_FIELDS, CONDITIONS_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/core';

@Injectable({
  providedIn: 'root',
})
export class ConditionsSearchService extends SearchService<Conditions> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(readonly queryService: MysqlQueryService) {
    super(queryService, CONDITIONS_TABLE, CONDITIONS_SEARCH_FIELDS);
  }
}
