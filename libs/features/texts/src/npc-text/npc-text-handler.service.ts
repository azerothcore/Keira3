import { Injectable } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { NpcText, NPC_TEXT_TABLE } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class NpcTextHandlerService extends HandlerService<NpcText> {
  protected readonly mainEditorRoutePath = 'texts/npc-text';

  get isUnsaved(): boolean {
    return this.statusMap[NPC_TEXT_TABLE];
  }

  protected _statusMap = {
    [NPC_TEXT_TABLE]: false,
  };
}
