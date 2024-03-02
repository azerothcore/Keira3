import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2 } from '@keira/acore-world-model';
import { ReferenceLootTemplate, REFERENCE_LOOT_TEMPLATE_TABLE } from '@keira/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';

@Injectable()
export class ReferenceLootTemplateService extends MultiRowEditorService<ReferenceLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ReferenceLootHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      ReferenceLootTemplate,
      REFERENCE_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      LOOT_TEMPLATE_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}
