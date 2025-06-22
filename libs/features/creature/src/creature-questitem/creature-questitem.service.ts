import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  CREATURE_QUESTITEM_ID,
  CREATURE_QUESTITEM_ID_2,
  CREATURE_QUESTITEM_TABLE,
  CreatureQuestitem,
} from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureQuestitemService extends MultiRowEditorService<CreatureQuestitem> {
  protected override readonly handlerService: CreatureHandlerService;

  constructor() {
    const handlerService = inject(CreatureHandlerService);

    super(CreatureQuestitem, CREATURE_QUESTITEM_TABLE, CREATURE_QUESTITEM_ID, CREATURE_QUESTITEM_ID_2, handlerService);

    this.handlerService = handlerService;
  }
}
