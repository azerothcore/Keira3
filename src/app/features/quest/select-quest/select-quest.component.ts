import { Component, } from '@angular/core';

import { SelectComponent } from '@keira-shared/abstract/components/editors/select.component';
import {
  QUEST_TEMPLATE_CUSTOM_STARTING_ID,
  QUEST_TEMPLATE_ID,
  QUEST_TEMPLATE_TABLE,
  QuestTemplate
} from '@keira-types/quest-template.type';
import { SelectQuestService } from './select-quest.service';
import { QuestHandlerService } from '../quest-handler.service';
import { QueryService } from '@keira-shared/services/query.service';

@Component({
  selector: 'app-select-quest',
  templateUrl: './select-quest.component.html',
  styleUrls: ['./select-quest.component.scss']
})
export class SelectQuestComponent extends SelectComponent<QuestTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectQuestService,
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
