import { Injectable } from '@angular/core';
import { MultiRowEditorService, MysqlQueryService } from '@keira/shared/core';
import {
  CREATURE_QUESTITEM_ID,
  CREATURE_QUESTITEM_ID_2,
  CREATURE_QUESTITEM_TABLE,
  CreatureQuestitem,
} from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable()
export class CreatureQuestitemService extends MultiRowEditorService<CreatureQuestitem> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    readonly queryService: MysqlQueryService,
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
