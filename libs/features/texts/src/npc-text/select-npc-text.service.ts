import { inject, Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { NPC_TEXT_ID, NPC_TEXT_SEARCH_FIELDS, NPC_TEXT_TABLE, NpcText } from '@keira/shared/acore-world-model';
import { NpcTextHandlerService } from './npc-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectNpcTextService extends SelectService<NpcText> {
  public readonly handlerService = inject(NpcTextHandlerService);
  protected readonly entityTable = NPC_TEXT_TABLE;
  protected readonly entityIdField = NPC_TEXT_ID;
  protected readonly entityNameField = null;
  protected readonly fieldList = NPC_TEXT_SEARCH_FIELDS;
}
