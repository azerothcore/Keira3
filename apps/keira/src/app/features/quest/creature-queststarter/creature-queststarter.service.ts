import { Injectable } from '@angular/core';
import { MultiRowEditorService, MysqlQueryService } from '@keira/shared/core';
import {
  CREATURE_QUESTSTARTER_ID,
  CREATURE_QUESTSTARTER_ID_2,
  CREATURE_QUESTSTARTER_TABLE,
  CreatureQueststarter,
} from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureQueststarterService extends MultiRowEditorService<CreatureQueststarter> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    readonly queryService: MysqlQueryService,
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
