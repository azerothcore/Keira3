import { Injectable } from '@angular/core';
import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { QuestTemplate, QUEST_TEMPLATE_ID, QUEST_TEMPLATE_NAME, QUEST_TEMPLATE_TABLE } from '@keira-types/quest-template.type';
import { ToastrService } from 'ngx-toastr';
import { QuestHandlerService } from '../quest-handler.service';
import { SaveQueryService } from '@keira-shared/services/save-query.service';

@Injectable()
export class QuestTemplateService extends SingleRowEditorService<QuestTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    public readonly queryService: MysqlQueryService,
    public readonly saveQueryService: SaveQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      QuestTemplate,
      QUEST_TEMPLATE_TABLE,
      QUEST_TEMPLATE_ID,
      QUEST_TEMPLATE_NAME,
      true,
      handlerService,
      queryService,
      saveQueryService,
      toastrService,
    );
  }
}
