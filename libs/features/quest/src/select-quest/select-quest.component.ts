import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { QUEST_TEMPLATE_CUSTOM_STARTING_ID, QUEST_TEMPLATE_ID, QUEST_TEMPLATE_TABLE, QuestTemplate } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';
import { SelectQuestService } from './select-quest.service';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    NgxDatatableModule,
  ],
})
export class SelectQuestComponent extends SelectComponent<QuestTemplate> {
  readonly entityTable = QUEST_TEMPLATE_TABLE;
  readonly entityIdField = QUEST_TEMPLATE_ID;
  readonly customStartingId = QUEST_TEMPLATE_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectQuestService);
  readonly handlerService = inject(QuestHandlerService);
}
