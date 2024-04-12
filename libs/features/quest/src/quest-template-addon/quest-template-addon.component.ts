import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { ALLOWABLE_CLASSES, QuestTemplateAddon, SPECIAL_FLAGS } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestTemplateAddonService } from './quest-template-addon.service';
import { QuestPreviewComponent } from '../quest-preview/quest-preview.component';
import {
  FactionSelectorBtnComponent,
  FlagsSelectorBtnComponent,
  QuestSelectorBtnComponent,
  SkillSelectorBtnComponent,
  SpellSelectorBtnComponent,
} from '@keira/shared/selectors';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-template-addon',
  templateUrl: './quest-template-addon.component.html',
  styleUrls: ['./quest-template-addon.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    NgClass,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    QuestSelectorBtnComponent,
    FlagsSelectorBtnComponent,
    SpellSelectorBtnComponent,
    SkillSelectorBtnComponent,
    FactionSelectorBtnComponent,
    QuestPreviewComponent,
  ],
})
export class QuestTemplateAddonComponent extends SingleRowEditorComponent<QuestTemplateAddon> {
  readonly ALLOWABLE_CLASSES = ALLOWABLE_CLASSES;
  readonly SPECIAL_FLAGS = SPECIAL_FLAGS;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: QuestTemplateAddonService,
    public handlerService: QuestHandlerService,
    readonly questPreviewService: QuestPreviewService,
  ) {
    super(editorService, handlerService);
  }
}
