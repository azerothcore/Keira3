import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { CreatureQueststarter } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { CreatureQueststarterService } from './creature-queststarter.service';
import { QuestPreviewComponent } from '../quest-preview/quest-preview.component';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CreatureSelectorBtnComponent } from '@keira/shared/selectors';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe, NgClass } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-queststarter',
  templateUrl: './creature-queststarter.component.html',
  styleUrls: ['./creature-queststarter.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    NgClass,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    CreatureSelectorBtnComponent,
    TooltipModule,
    EditorButtonsComponent,
    NgxDatatableModule,
    QuestPreviewComponent,
    AsyncPipe,
  ],
})
export class CreatureQueststarterComponent extends MultiRowEditorComponent<CreatureQueststarter> {
  readonly editorService = inject(CreatureQueststarterService);
  readonly handlerService = inject(QuestHandlerService);
  readonly questPreviewService = inject(QuestPreviewService);
}
