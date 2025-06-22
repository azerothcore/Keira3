import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { NPC_TEXT_ID, NPC_TEXT_SEARCH_FIELDS, NPC_TEXT_TABLE, NpcText } from '@keira/shared/acore-world-model';
import { NpcTextHandlerService } from './npc-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectNpcTextService extends SelectService<NpcText> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(NpcTextHandlerService);
  protected readonly entityTable = NPC_TEXT_TABLE;
  protected readonly entityIdField = NPC_TEXT_ID;
  protected entityNameField = null;
  protected readonly fieldList = NPC_TEXT_SEARCH_FIELDS;
  private readonly init = this.init();
}
