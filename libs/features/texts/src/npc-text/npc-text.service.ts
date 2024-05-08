import { Injectable } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { NPC_TEXT_ID, NPC_TEXT_TABLE, NpcText } from '@keira/shared/acore-world-model';
import { NpcTextHandlerService } from './npc-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class NpcTextService extends SingleRowEditorService<NpcText> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override handlerService: NpcTextHandlerService) {
    super(NpcText, NPC_TEXT_TABLE, NPC_TEXT_ID, null, true, handlerService);
  }
}
