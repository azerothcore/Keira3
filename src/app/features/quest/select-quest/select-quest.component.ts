import { Component } from '@angular/core';
import { SelectComponent } from '@keira-abstract/components/editors/select.component';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import {
  QuestTemplate,
  QUEST_TEMPLATE_CUSTOM_STARTING_ID,
  QUEST_TEMPLATE_ID,
  QUEST_TEMPLATE_TABLE,
} from '@keira-types/quest-template.type';
import { QuestHandlerService } from '../quest-handler.service';
import { SelectQuestService } from './select-quest.service';

@Component({
  selector: 'keira-select-quest',
  templateUrl: './select-quest.component.html',
  styleUrls: ['./select-quest.component.scss'],
})
export class SelectQuestComponent extends SelectComponent<QuestTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectQuestService,
    public handlerService: QuestHandlerService,
    public queryService: MysqlQueryService,
  ) {
    super(QUEST_TEMPLATE_TABLE, QUEST_TEMPLATE_ID, QUEST_TEMPLATE_CUSTOM_STARTING_ID, selectService, handlerService, queryService);
  }
}
