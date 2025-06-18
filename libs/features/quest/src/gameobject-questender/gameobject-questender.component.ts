import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameobjectQuestender } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { GameobjectSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewComponent } from '../quest-preview/quest-preview.component';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { GameobjectQuestenderService } from './gameobject-questender.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-questender',
  templateUrl: './gameobject-questender.component.html',
  styleUrls: ['./gameobject-questender.component.scss'],
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    GameobjectSelectorBtnComponent,
    TooltipModule,
    EditorButtonsComponent,
    NgxDatatableModule,
    QuestPreviewComponent,
    AsyncPipe,
  ],
})
export class GameobjectQuestenderComponent extends MultiRowEditorComponent<GameobjectQuestender> {
  protected override readonly editorService = inject(GameobjectQuestenderService);
  readonly handlerService = inject(QuestHandlerService);
  readonly questPreviewService = inject(QuestPreviewService);
}
