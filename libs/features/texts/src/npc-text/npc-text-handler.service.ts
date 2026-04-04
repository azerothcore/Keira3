import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { NpcText, NPC_TEXT_TABLE } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class NpcTextHandlerService extends HandlerService<NpcText> {
  protected readonly mainEditorRoutePath = 'texts/npc-text';
  protected override readonly copyRoutePath = 'texts/npc-text-copy';

  get isUnsaved(): Signal<boolean> {
    return this.statusMap[NPC_TEXT_TABLE].asReadonly();
  }

  protected _statusMap = {
    [NPC_TEXT_TABLE]: signal(false),
  };
}
