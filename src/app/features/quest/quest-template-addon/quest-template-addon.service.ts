import { Injectable } from '@angular/core';
import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { QuestTemplateAddon, QUEST_TEMPLATE_ADDON_ID, QUEST_TEMPLATE_ADDON_TABLE } from '@keira-types/quest-template-addon.type';
import { ToastrService } from 'ngx-toastr';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable()
export class QuestTemplateAddonService extends SingleRowEditorService<QuestTemplateAddon> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      QuestTemplateAddon,
      QUEST_TEMPLATE_ADDON_TABLE,
      QUEST_TEMPLATE_ADDON_ID,
      null,
      false,
      handlerService,
      queryService,
      toastrService,
    );
  }
}
