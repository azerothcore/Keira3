import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { SingleRowEditorService } from '../../shared/abstract/service/editors/single-row-editor.service';
import {
  QUEST_TEMPLATE_ID,
  QUEST_TEMPLATE_NAME,
  QUEST_TEMPLATE_TABLE,
  QuestTemplate
} from '../../shared/types/quest-template.type';
import { QueryService } from '../../shared/services/query.service';
import { QuestHandlerService } from './quest-handler.service';

@Injectable({
  providedIn: 'root'
})
export class QuestTemplateService extends SingleRowEditorService<QuestTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    protected queryService: QueryService,
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
      toastrService,
    );
  }
}
