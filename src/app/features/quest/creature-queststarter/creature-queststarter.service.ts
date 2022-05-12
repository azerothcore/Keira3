import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import {
  CreatureQueststarter,
  CREATURE_QUESTSTARTER_ID,
  CREATURE_QUESTSTARTER_ID_2,
  CREATURE_QUESTSTARTER_TABLE,
} from '@keira-types/creature-queststarter.type';
import { ToastrService } from 'ngx-toastr';
import { QuestHandlerService } from '../quest-handler.service';
import { SaveQueryService } from '@keira-shared/services/save-query.service';

@Injectable()
export class CreatureQueststarterService extends MultiRowEditorService<CreatureQueststarter> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    public readonly queryService: MysqlQueryService,
    public readonly saveQueryService: SaveQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureQueststarter,
      CREATURE_QUESTSTARTER_TABLE,
      CREATURE_QUESTSTARTER_ID,
      CREATURE_QUESTSTARTER_ID_2,
      handlerService,
      queryService,
      saveQueryService,
      toastrService,
    );
  }
}
