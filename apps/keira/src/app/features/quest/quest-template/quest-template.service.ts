import { Injectable } from '@angular/core';
import { MysqlQueryService, SingleRowEditorService } from '@keira/shared/core';
import { QUEST_TEMPLATE_ID, QUEST_TEMPLATE_NAME, QUEST_TEMPLATE_TABLE, QuestTemplate } from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class QuestTemplateService extends SingleRowEditorService<QuestTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(QuestTemplate, QUEST_TEMPLATE_TABLE, QUEST_TEMPLATE_ID, QUEST_TEMPLATE_NAME, true, handlerService, queryService, toastrService);
  }
}
