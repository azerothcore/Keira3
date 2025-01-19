import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QUEST_LOCALE, QuestTemplateLocale } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { GenericOptionSelectorComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewComponent } from '../quest-preview/quest-preview.component';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestTemplateLocaleService } from './quest-template-locale.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-template-locale',
  templateUrl: './quest-template-locale.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    QuestPreviewComponent,
    EditorButtonsComponent,
    NgxDatatableModule,
    GenericOptionSelectorComponent,
  ],
})
export class QuestTemplateLocaleComponent extends MultiRowEditorComponent<QuestTemplateLocale> {
  protected override readonly editorService = inject(QuestTemplateLocaleService);
  readonly handlerService = inject(QuestHandlerService);
  readonly questPreviewService = inject(QuestPreviewService);
  protected readonly QUEST_LOCALE = QUEST_LOCALE;
}
