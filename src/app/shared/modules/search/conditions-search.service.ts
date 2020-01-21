import { SearchService } from './search.service';
import { Conditions, CONDITIONS_SEARCH_FIELDS, CONDITIONS_TABLE } from '../../types/conditions.type';
import { QueryService } from '../../services/query.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConditionsSearchService extends SearchService<Conditions> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected queryService: QueryService,
  ) {
    super(queryService, CONDITIONS_TABLE, CONDITIONS_SEARCH_FIELDS);
  }
}
