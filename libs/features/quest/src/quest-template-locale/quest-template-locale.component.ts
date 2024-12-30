import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EMOTE, QuestTemplateLocale } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { GameobjectSelectorBtnComponent, SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewComponent } from '../quest-preview/quest-preview.component';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestTemplateLocaleService } from './quest-template-locale.service';
import { Model3DViewerComponent } from '@keira/shared/model-3d-viewer';
import { AsyncPipe } from '@angular/common';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-template-locale',
  templateUrl: './quest-template-locale.component.html',
  styleUrls: ['./quest-template-locale.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    SingleValueSelectorBtnComponent,
    QuestPreviewComponent,
    Model3DViewerComponent,
    GameobjectSelectorBtnComponent,
    AsyncPipe,
    EditorButtonsComponent,
    NgxDatatableModule,
  ],
})
export class QuestTemplateLocaleComponent extends MultiRowEditorComponent<QuestTemplateLocale> {
  readonly EMOTE = EMOTE;

  protected override readonly editorService = inject(QuestTemplateLocaleService);
  readonly handlerService = inject(QuestHandlerService);
  readonly questPreviewService = inject(QuestPreviewService);
}
