import { Injectable } from '@angular/core';

import { SearchService } from './search.service';
import { MysqlQueryService } from '../../services/mysql-query.service';
import { SAI_ID_FIELDS, SAI_SEARCH_FIELDS, SAI_TABLE, SmartScripts } from '../../types/smart-scripts.type';

@Injectable({
  providedIn: 'root'
})
export class SaiSearchService extends SearchService<SmartScripts> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public readonly queryService: MysqlQueryService,
  ) {
    super(queryService, SAI_TABLE, SAI_SEARCH_FIELDS, SAI_ID_FIELDS, SAI_ID_FIELDS);
  }
}
