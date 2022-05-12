import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { FishingLootTemplate, FISHING_LOOT_TEMPLATE_TABLE } from '@keira-types/fishing-loot-template.type';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2 } from '@keira-types/loot-template.type';
import { ToastrService } from 'ngx-toastr';
import { FishingLootHandlerService } from './fishing-loot-handler.service';
import { SaveQueryService } from '@keira-shared/services/save-query.service';

@Injectable()
export class FishingLootTemplateService extends MultiRowEditorService<FishingLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: FishingLootHandlerService,
    public readonly queryService: MysqlQueryService,
    public readonly saveQueryService: SaveQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      FishingLootTemplate,
      FISHING_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      LOOT_TEMPLATE_ID_2,
      handlerService,
      queryService,
      saveQueryService,
      toastrService,
    );
  }
}
