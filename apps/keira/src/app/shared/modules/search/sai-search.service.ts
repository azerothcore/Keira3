import { Injectable } from '@angular/core';
import { MysqlQueryService } from '../../services/query/mysql-query.service';
import { SAI_ID_FIELDS, SAI_SEARCH_FIELDS, SAI_TABLE, SmartScripts } from '@keira/acore-world-model';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class SaiSearchService extends SearchService<SmartScripts> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(readonly queryService: MysqlQueryService) {
    super(queryService, SAI_TABLE, SAI_SEARCH_FIELDS, SAI_ID_FIELDS, SAI_ID_FIELDS);
  }
}
