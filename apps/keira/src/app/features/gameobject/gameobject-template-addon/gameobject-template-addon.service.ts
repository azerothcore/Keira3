import { Injectable } from '@angular/core';
import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { GameobjectTemplateAddon, GAMEOBJECT_TEMPLATE_ADDON_ID, GAMEOBJECT_TEMPLATE_ADDON_TABLE } from '@keira/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable()
export class GameobjectTemplateAddonService extends SingleRowEditorService<GameobjectTemplateAddon> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GameobjectHandlerService,
    readonly queryService: MysqlQueryService,
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
