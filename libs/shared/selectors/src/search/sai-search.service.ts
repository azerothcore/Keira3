import { Injectable } from '@angular/core';
import { SAI_ID_FIELDS, SAI_SEARCH_FIELDS, SAI_TABLE, SmartScripts } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class SaiSearchService extends SearchService<SmartScripts> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(override readonly queryService: MysqlQueryService) {
    super(queryService, SAI_TABLE, SAI_SEARCH_FIELDS, SAI_ID_FIELDS, SAI_ID_FIELDS);
  }
}
