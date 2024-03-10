import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MysqlQueryService, SelectComponent } from '@keira/shared/core';
import { QUEST_TEMPLATE_CUSTOM_STARTING_ID, QUEST_TEMPLATE_ID, QUEST_TEMPLATE_TABLE, QuestTemplate } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';
import { SelectQuestService } from './select-quest.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgIf } from '@angular/common';
import { HighlightjsWrapperComponent } from '@keira/shared/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent } from '@keira/shared/core';
import { TopBarComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-quest',
  templateUrl: './select-quest.component.html',
  styleUrls: ['./select-quest.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    CreateComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    HighlightjsWrapperComponent,
    NgIf,
    NgxDatatableModule,
  ],
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
