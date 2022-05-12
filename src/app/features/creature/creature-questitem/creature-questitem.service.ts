import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import {
  CreatureQuestitem,
  CREATURE_QUESTITEM_ID,
  CREATURE_QUESTITEM_ID_2,
  CREATURE_QUESTITEM_TABLE,
} from '@keira-types/creature-questitem.type';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaveQueryService } from '@keira-shared/services/save-query.service';

@Injectable()
export class CreatureQuestitemService extends MultiRowEditorService<CreatureQuestitem> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    public readonly queryService: MysqlQueryService,
    public readonly saveQueryService: SaveQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureQuestitem,
      CREATURE_QUESTITEM_TABLE,
      CREATURE_QUESTITEM_ID,
      CREATURE_QUESTITEM_ID_2,
      handlerService,
      queryService,
      saveQueryService,
      toastrService,
    );
  }
}
