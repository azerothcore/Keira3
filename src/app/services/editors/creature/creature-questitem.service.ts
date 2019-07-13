import { Injectable } from '@angular/core';

import { MultiRowEditorService } from '../multi-row-editor.service';
import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';
import {
  CREATURE_QUESTITEM_ID,
  CREATURE_QUESTITEM_ID_2,
  CREATURE_QUESTITEM_TABLE,
  CreatureQuestitem,
} from '../../../types/creature-questitem.type';

@Injectable({
  providedIn: 'root'
})
export class CreatureQuestitemService extends MultiRowEditorService<CreatureQuestitem> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      CreatureQuestitem,
      CREATURE_QUESTITEM_TABLE,
      CREATURE_QUESTITEM_ID,
      CREATURE_QUESTITEM_ID_2,
      handlerService,
      queryService,
    );
  }
}
