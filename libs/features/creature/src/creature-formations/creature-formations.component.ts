import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CreatureFormations,
  DYNAMIC_FLAGS,
  MOVEMENT_TYPE,
  NPC_FLAGS,
  PHASE_MASK,
  SPAWN_MASK,
  UNIT_FLAGS,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import {
  AreaSelectorBtnComponent,
  FlagsSelectorBtnComponent,
  GenericOptionSelectorComponent,
  MapSelectorBtnComponent,
  SingleValueSelectorBtnComponent,
} from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureFormationsService } from './creature-formations.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-formations',
  templateUrl: './creature-formations.component.html',
  styleUrls: ['./creature-formations.component.scss'],
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
export class CreatureFormationsComponent extends MultiRowEditorComponent<CreatureFormations> {
  override readonly editorService = inject(CreatureFormationsService);
  readonly handlerService = inject(CreatureHandlerService);
}
