import { Injectable } from '@angular/core';
import { NPC_TEXT_SEARCH_FIELDS, NPC_TEXT_TABLE, NpcText } from '@keira/shared/acore-world-model';
import { MysqlSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class NpcTextSearchService extends MysqlSearchService<NpcText> {
  protected readonly entityTable = NPC_TEXT_TABLE;
  protected readonly fieldList = NPC_TEXT_SEARCH_FIELDS;
}
