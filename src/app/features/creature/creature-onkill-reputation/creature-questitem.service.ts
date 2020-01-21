import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { CreatureHandlerService } from '../creature-handler.service';
import { QueryService } from '@keira-shared/services/query.service';
import {
  CREATURE_QUESTITEM_ID,
  CREATURE_QUESTITEM_ID_2,
  CREATURE_QUESTITEM_TABLE,
  CreatureQuestitem,
} from '@keira-types/creature-questitem.type';

@Injectable({
  providedIn: 'root'
})
export class CreatureQuestitemService extends MultiRowEditorService<CreatureQuestitem> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureQuestitem,
      CREATURE_QUESTITEM_TABLE,
      CREATURE_QUESTITEM_ID,
      CREATURE_QUESTITEM_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}
