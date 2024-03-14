import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/shared/core';
import { ALLOWABLE_RACES, QUEST_FLAGS, QUEST_INFO, QUEST_TYPE, QuestTemplate } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestTemplateService } from './quest-template.service';
import { QuestPreviewComponent } from '../quest-preview/quest-preview.component';
import { QuestFactionSelectorBtnComponent } from '@keira/shared/selectors';
import { SpellSelectorBtnComponent } from '@keira/shared/selectors';
import { FactionSelectorBtnComponent } from '@keira/shared/selectors';
import { FlagsSelectorBtnComponent } from '@keira/shared/selectors';
import { ItemSelectorBtnComponent } from '@keira/shared/selectors';
import { IconComponent } from '@keira/shared/core';
import { SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { TopBarComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-template',
  templateUrl: './quest-template.component.html',
  styleUrls: ['./quest-template.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    NgClass,
    NgIf,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    SingleValueSelectorBtnComponent,
    IconComponent,
    ItemSelectorBtnComponent,
    FlagsSelectorBtnComponent,
    NgFor,
    FactionSelectorBtnComponent,
    SpellSelectorBtnComponent,
    QuestFactionSelectorBtnComponent,
    QuestPreviewComponent,
  ],
})
export class QuestTemplateComponent extends SingleRowEditorComponent<QuestTemplate> {
  readonly QUEST_FLAGS = QUEST_FLAGS;
  readonly QUEST_TYPE = QUEST_TYPE;
  readonly ALLOWABLE_RACES = ALLOWABLE_RACES;
  readonly QUEST_INFO = QUEST_INFO;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: QuestTemplateService,
    public handlerService: QuestHandlerService,
    readonly questPreviewService: QuestPreviewService,
  ) {
    super(editorService, handlerService);
  }
}
