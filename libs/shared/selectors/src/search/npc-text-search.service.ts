import { Injectable, inject } from '@angular/core';
import { NPC_TEXT_SEARCH_FIELDS, NPC_TEXT_TABLE, NpcText } from '@keira/shared/acore-world-model';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class NpcTextSearchService extends SearchService<NpcText> {
  override readonly queryService = inject(MysqlQueryService);
  protected override readonly entityTable = NPC_TEXT_TABLE;
  protected override readonly fieldList = NPC_TEXT_SEARCH_FIELDS;
  constructor() {
    super();
    this.init();
  }
}
