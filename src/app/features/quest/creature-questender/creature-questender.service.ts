import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { QuestHandlerService } from '../quest-handler.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import {
  CREATURE_QUESTENDER_ID,
  CREATURE_QUESTENDER_ID_2,
  CREATURE_QUESTENDER_TABLE,
  CreatureQuestender,
} from '@keira-types/creature-questender.type';

@Injectable()
export class CreatureQuestenderService extends MultiRowEditorService<CreatureQuestender> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    public readonly queryService: MysqlQueryService,
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
