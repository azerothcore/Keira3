import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2 } from '@keira-types/loot-template.type';
import { MillingLootTemplate, MILLING_LOOT_TEMPLATE_TABLE } from '@keira-types/milling-loot-template.type';
import { ToastrService } from 'ngx-toastr';
import { ItemHandlerService } from '../item-handler.service';
import { SaveQueryService } from '@keira-shared/services/save-query.service';

@Injectable()
export class MillingLootTemplateService extends MultiRowEditorService<MillingLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    public readonly queryService: MysqlQueryService,
    public readonly saveQueryService: SaveQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      MillingLootTemplate,
      MILLING_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      LOOT_TEMPLATE_ID_2,
      handlerService,
      queryService,
      saveQueryService,
      toastrService,
    );
  }
}
