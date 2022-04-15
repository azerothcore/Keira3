import { Injectable } from '@angular/core';
import { MysqlQueryService } from '../../services/mysql-query.service';
import { Conditions, CONDITIONS_SEARCH_FIELDS, CONDITIONS_TABLE } from '../../types/conditions.type';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class ConditionsSearchService extends SearchService<Conditions> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public readonly queryService: MysqlQueryService) {
    super(queryService, CONDITIONS_TABLE, CONDITIONS_SEARCH_FIELDS);
  }
}
