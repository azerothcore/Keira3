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
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override readonly _entityClass = CreatureQuestitem;
  protected override readonly _entityTable = CREATURE_QUESTITEM_TABLE;
  protected override readonly _entityIdField = CREATURE_QUESTITEM_ID;
  protected override readonly _entitySecondIdField = CREATURE_QUESTITEM_ID_2;

  constructor() {
    super();
  }
}
