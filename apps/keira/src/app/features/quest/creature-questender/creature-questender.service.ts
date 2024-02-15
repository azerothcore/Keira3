import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import {
  CreatureQuestender,
  CREATURE_QUESTENDER_ID,
  CREATURE_QUESTENDER_ID_2,
  CREATURE_QUESTENDER_TABLE,
} from '@keira-types/creature-questender.type';
import { ToastrService } from 'ngx-toastr';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable()
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
