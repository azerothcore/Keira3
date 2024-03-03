import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MysqlQueryService, SelectComponent } from '@keira/core';
import { QUEST_TEMPLATE_CUSTOM_STARTING_ID, QUEST_TEMPLATE_ID, QUEST_TEMPLATE_TABLE, QuestTemplate } from '@keira/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';
import { SelectQuestService } from './select-quest.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
