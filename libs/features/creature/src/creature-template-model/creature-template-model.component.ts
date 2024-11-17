import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreatureTemplateModel } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { Model3DViewerComponent, VIEWER_TYPE } from '@keira/shared/model-3d-viewer';
import { GenericOptionSelectorComponent, SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateModelService } from './creature-template-model.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-template-model',
  templateUrl: './creature-template-model.component.html',
  styleUrls: ['./creature-template-model.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    SingleValueSelectorBtnComponent,
    NgxDatatableModule,
    GenericOptionSelectorComponent,
    EditorButtonsComponent,
    Model3DViewerComponent,
  ],
})
export class CreatureTemplateModelComponent extends MultiRowEditorComponent<CreatureTemplateModel> {
  override readonly editorService = inject(CreatureTemplateModelService);
  readonly handlerService = inject(CreatureHandlerService);

  protected readonly NPC_VIEWER_TYPE = VIEWER_TYPE.NPC;
}
