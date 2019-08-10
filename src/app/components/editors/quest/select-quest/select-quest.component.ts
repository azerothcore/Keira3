import { Component, } from '@angular/core';

import { SelectComponent } from '../../shared/select.component';
import {
  QUEST_TEMPLATE_CUSTOM_STARTING_ID,
  QUEST_TEMPLATE_ID,
  QUEST_TEMPLATE_TABLE,
  QuestTemplate
} from '../../../../types/quest-template.type';
import { QuestSelectService } from '../../../../services/select/quest-select.service';
import { QuestHandlerService } from '../../../../services/handlers/quest-handler.service';
import { QueryService } from '../../../../services/query.service';

@Component({
  selector: 'app-select-quest',
  templateUrl: './select-quest.component.html',
  styleUrls: ['./select-quest.component.scss']
})
export class SelectQuestComponent extends SelectComponent<QuestTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: QuestSelectService,
    public handlerService: QuestHandlerService,
    public queryService: QueryService,
  ) {
    super(
      QUEST_TEMPLATE_TABLE,
      QUEST_TEMPLATE_ID,
      QUEST_TEMPLATE_CUSTOM_STARTING_ID,
      selectService,
      handlerService,
      queryService,
    );
  }
}
