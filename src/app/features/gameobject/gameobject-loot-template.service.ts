import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { GameobjectHandlerService } from './gameobject-handler.service';
import { QueryService } from '@keira-shared/services/query.service';
import {
  GAMEOBJECT_LOOT_TEMPLATE_TABLE,
  GameobjectLootTemplate
} from '@keira-types/gameobject-loot-template.type';
import { LootEditorService } from '@keira-abstract/service/editors/loot-editor.service';
import {
  GAMEOBJECT_TEMPLATE_ID, GAMEOBJECT_TEMPLATE_LOOT_ID, GAMEOBJECT_TEMPLATE_TYPE,
  GAMEOBJECT_TEMPLATE_TABLE
} from '@keira-types/gameobject-template.type';
import { Observable } from 'rxjs';
import { MysqlResult } from '@keira-types/general';

@Injectable({
  providedIn: 'root'
})
export class GameobjectLootTemplateService extends LootEditorService<GameobjectLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GameobjectHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      GameobjectLootTemplate,
      GAMEOBJECT_LOOT_TEMPLATE_TABLE,
      GAMEOBJECT_TEMPLATE_TABLE,
      GAMEOBJECT_TEMPLATE_ID,
      GAMEOBJECT_TEMPLATE_LOOT_ID,
      handlerService,
      queryService,
      toastrService,
    );
  }

  getType(): Observable<MysqlResult<{ type: number }>> {
    return this.queryService.query(
      `SELECT ${GAMEOBJECT_TEMPLATE_TYPE} `
      + `FROM ${GAMEOBJECT_TEMPLATE_TABLE} `
      + `WHERE ${GAMEOBJECT_TEMPLATE_ID} = ${this.handlerService.selected}`
    );
  }
}
