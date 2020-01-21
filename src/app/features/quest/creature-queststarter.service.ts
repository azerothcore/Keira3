import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { QuestHandlerService } from './quest-handler.service';
import { QueryService } from '../../shared/services/query.service';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import {
  CREATURE_QUESTSTARTER_ID, CREATURE_QUESTSTARTER_ID_2,
  CREATURE_QUESTSTARTER_TABLE,
  CreatureQueststarter
} from '@keira-types/creature-queststarter.type';

@Injectable({
  providedIn: 'root'
})
export class CreatureQueststarterService extends MultiRowEditorService<CreatureQueststarter> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureQueststarter,
      CREATURE_QUESTSTARTER_TABLE,
      CREATURE_QUESTSTARTER_ID,
      CREATURE_QUESTSTARTER_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}
