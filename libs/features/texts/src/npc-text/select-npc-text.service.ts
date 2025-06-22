import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { NPC_TEXT_ID, NPC_TEXT_SEARCH_FIELDS, NPC_TEXT_TABLE, NpcText } from '@keira/shared/acore-world-model';
import { NpcTextHandlerService } from './npc-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectNpcTextService extends SelectService<NpcText> {
  override readonly queryService: MysqlQueryService;
  override readonly handlerService: NpcTextHandlerService;

  constructor() {
    const queryService = inject(MysqlQueryService);
    const handlerService = inject(NpcTextHandlerService);

    super(queryService, handlerService, NPC_TEXT_TABLE, NPC_TEXT_ID, null, NPC_TEXT_SEARCH_FIELDS);

    this.queryService = queryService;
    this.handlerService = handlerService;
  }
}
