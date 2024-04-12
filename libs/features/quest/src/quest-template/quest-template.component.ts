import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { ALLOWABLE_RACES, QUEST_FLAGS, QUEST_INFO, QUEST_TYPE, QuestTemplate } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestTemplateService } from './quest-template.service';
import { QuestPreviewComponent } from '../quest-preview/quest-preview.component';
import {
  FactionSelectorBtnComponent,
  FlagsSelectorBtnComponent,
  ItemSelectorBtnComponent,
  QuestFactionSelectorBtnComponent,
  SingleValueSelectorBtnComponent,
  SpellSelectorBtnComponent,
} from '@keira/shared/selectors';
import { IconComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-template',
  templateUrl: './quest-template.component.html',
  styleUrls: ['./quest-template.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    NgClass,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    SingleValueSelectorBtnComponent,
    IconComponent,
    ItemSelectorBtnComponent,
    FlagsSelectorBtnComponent,
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
