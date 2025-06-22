import { Injectable, inject } from '@angular/core';
import { NPC_TEXT_SEARCH_FIELDS, NPC_TEXT_TABLE, NpcText } from '@keira/shared/acore-world-model';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class NpcTextSearchService extends SearchService<NpcText> {
  override readonly queryService: MysqlQueryService;

  constructor() {
    const queryService = inject(MysqlQueryService);

    super(queryService, NPC_TEXT_TABLE, NPC_TEXT_SEARCH_FIELDS);

    this.queryService = queryService;
  }
}
