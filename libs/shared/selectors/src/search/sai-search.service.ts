import { Injectable } from '@angular/core';
import { SAI_ID_FIELDS, SAI_SEARCH_FIELDS, SAI_TABLE, SmartScripts } from '@keira/shared/acore-world-model';
import { MysqlSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class SaiSearchService extends MysqlSearchService<SmartScripts> {
  protected readonly entityTable = SAI_TABLE;
  protected readonly fieldList = SAI_SEARCH_FIELDS;
  protected readonly selectFields: string[] = SAI_ID_FIELDS;
  protected readonly groupFields: string[] = SAI_ID_FIELDS;
}
