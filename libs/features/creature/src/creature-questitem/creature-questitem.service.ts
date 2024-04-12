import { Injectable } from '@angular/core';
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
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected handlerService: CreatureHandlerService) {
    super(CreatureQuestitem, CREATURE_QUESTITEM_TABLE, CREATURE_QUESTITEM_ID, CREATURE_QUESTITEM_ID_2, handlerService);
  }
}
