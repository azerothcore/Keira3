import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/core';
import { CreatureQuestender } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { CreatureQuestenderService } from './creature-questender.service';
import { QuestPreviewComponent } from '../quest-preview/quest-preview.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EditorButtonsComponent } from '@keira/shared/base-editor-components';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CreatureSelectorBtnComponent } from '@keira/shared/selectors';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass, NgIf, AsyncPipe } from '@angular/common';
import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-questender',
  templateUrl: './creature-questender.component.html',
  styleUrls: ['./creature-questender.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    NgClass,
    NgIf,
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
export class CreatureQuestenderComponent extends MultiRowEditorComponent<CreatureQuestender> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureQuestenderService,
    public handlerService: QuestHandlerService,
    readonly questPreviewService: QuestPreviewService,
  ) {
    super(editorService, handlerService);
  }
}
