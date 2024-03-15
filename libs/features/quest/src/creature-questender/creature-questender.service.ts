import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import {
  CREATURE_QUESTENDER_ID,
  CREATURE_QUESTENDER_ID_2,
  CREATURE_QUESTENDER_TABLE,
  CreatureQuestender,
} from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureQuestenderService extends MultiRowEditorService<CreatureQuestender> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureQuestender,
      CREATURE_QUESTENDER_TABLE,
      CREATURE_QUESTENDER_ID,
      CREATURE_QUESTENDER_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}
