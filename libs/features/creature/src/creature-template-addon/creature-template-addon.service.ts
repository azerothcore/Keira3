import { Injectable } from '@angular/core';
import { MysqlQueryService, SingleRowEditorService } from '@keira/shared/core';
import { CREATURE_TEMPLATE_ADDON_ID, CREATURE_TEMPLATE_ADDON_TABLE, CreatureTemplateAddon } from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureTemplateAddonService extends SingleRowEditorService<CreatureTemplateAddon> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureTemplateAddon,
      CREATURE_TEMPLATE_ADDON_TABLE,
      CREATURE_TEMPLATE_ADDON_ID,
      null,
      false,
      handlerService,
      queryService,
      toastrService,
    );
  }
}
