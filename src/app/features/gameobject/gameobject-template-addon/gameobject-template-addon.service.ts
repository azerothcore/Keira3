import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import {
  GAMEOBJECT_TEMPLATE_ADDON_ID,
  GAMEOBJECT_TEMPLATE_ADDON_TABLE,
  GameobjectTemplateAddon,
} from '@keira-types/gameobject-template-addon.type';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable()
export class GameobjectTemplateAddonService extends SingleRowEditorService<GameobjectTemplateAddon> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GameobjectHandlerService,
    protected queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      GameobjectTemplateAddon,
      GAMEOBJECT_TEMPLATE_ADDON_TABLE,
      GAMEOBJECT_TEMPLATE_ADDON_ID,
      null,
      true,
      handlerService,
      queryService,
      toastrService,
    );
  }

}

