import { Injectable, inject } from '@angular/core';
import { SAI_ID_FIELDS, SAI_SEARCH_FIELDS, SAI_TABLE, SmartScripts } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class SaiSearchService extends SearchService<SmartScripts> {
  override readonly queryService = inject(MysqlQueryService);
  protected override readonly entityTable = SAI_TABLE;
  protected override readonly fieldList = SAI_SEARCH_FIELDS;
  protected override readonly selectFields = SAI_ID_FIELDS;
  protected override readonly groupFields = SAI_ID_FIELDS;
  constructor() {
    super();
    this.init();
  }
}
