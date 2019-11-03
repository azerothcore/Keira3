import { Injectable } from '@angular/core';

import { SearchService } from './search.service';
import { QueryService } from '../query.service';
import { SAI_SEARCH_FIELDS, SAI_TABLE, SmartScripts } from '../../types/smart-scripts.type';

@Injectable({
  providedIn: 'root'
})
export class SaiSearchService extends SearchService<SmartScripts> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected queryService: QueryService,
  ) {
    super(queryService, SAI_TABLE, SAI_SEARCH_FIELDS);
  }
}
