import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreatureFormation } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureFormationsService } from './creature-formations.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-formations',
  templateUrl: './creature-formations.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    EditorButtonsComponent,
    NgxDatatableModule,
  ],
})
export class CreatureFormationsComponent extends MultiRowEditorComponent<CreatureFormation> {
  override readonly editorService = inject(CreatureFormationsService);
  readonly handlerService = inject(CreatureHandlerService);
}
