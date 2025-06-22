import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { NPC_TEXT_ID, NPC_TEXT_TABLE, NpcText } from '@keira/shared/acore-world-model';
import { NpcTextHandlerService } from './npc-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class NpcTextService extends SingleRowEditorService<NpcText> {
  protected override readonly handlerService = inject(NpcTextHandlerService);

  constructor() {
    super(NpcText, NPC_TEXT_TABLE, NPC_TEXT_ID, null, true);
  }
}
