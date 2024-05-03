import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ALLOWABLE_CLASSES, QuestTemplateAddon, SPECIAL_FLAGS } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import {
  FactionSelectorBtnComponent,
  FlagsSelectorBtnComponent,
  QuestSelectorBtnComponent,
  SkillSelectorBtnComponent,
  SpellSelectorBtnComponent,
} from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewComponent } from '../quest-preview/quest-preview.component';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestTemplateAddonService } from './quest-template-addon.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-template-addon',
  templateUrl: './quest-template-addon.component.html',
  styleUrls: ['./quest-template-addon.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
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
  readonly editorService = inject(QuestTemplateAddonService);
  readonly handlerService = inject(QuestHandlerService);
  readonly questPreviewService = inject(QuestPreviewService);

  readonly ALLOWABLE_CLASSES = ALLOWABLE_CLASSES;
  readonly SPECIAL_FLAGS = SPECIAL_FLAGS;
}
