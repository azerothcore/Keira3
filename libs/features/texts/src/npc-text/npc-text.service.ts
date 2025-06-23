import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { NPC_TEXT_ID, NPC_TEXT_TABLE, NpcText } from '@keira/shared/acore-world-model';
import { NpcTextHandlerService } from './npc-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class NpcTextService extends SingleRowEditorService<NpcText> {
  protected override readonly handlerService = inject(NpcTextHandlerService);
  protected override _entityClass = NpcText;
  protected override _entityTable = NPC_TEXT_TABLE;
  protected override _entityIdField = NPC_TEXT_ID;
  protected override _entityNameField = null;
  protected override isMainEntity = true;

  constructor() {
    super();
    this.init();
  }
}
