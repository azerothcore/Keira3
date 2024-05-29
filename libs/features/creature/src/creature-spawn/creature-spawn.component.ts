import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CreatureSpawn,
  DYNAMIC_FLAGS,
  MOVEMENT_TYPE,
  NPC_FLAGS,
  PHASE_MASK,
  SPAWN_MASK,
  UNIT_FLAGS,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent } from '@keira/shared/base-editor-components';
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
import { CreatureSpawnService } from './creature-spawn.service';

import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-spawn',
  templateUrl: './creature-spawn.component.html',
  styleUrls: ['./creature-spawn.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    MapSelectorBtnComponent,
    AreaSelectorBtnComponent,
    FlagsSelectorBtnComponent,
    TooltipModule,
    SingleValueSelectorBtnComponent,
    EditorButtonsComponent,
    NgxDatatableModule,
    GenericOptionSelectorComponent,
  ],
})
export class CreatureSpawnComponent extends MultiRowEditorComponent<CreatureSpawn> {
  readonly UNIT_FLAGS = UNIT_FLAGS;
  readonly MOVEMENT_TYPE = MOVEMENT_TYPE;
  readonly NPC_FLAGS = NPC_FLAGS;
  readonly DYNAMIC_FLAGS = DYNAMIC_FLAGS;
  readonly SPAWN_MASK = SPAWN_MASK;
  readonly PHASE_MASK = PHASE_MASK;

  override readonly editorService = inject(CreatureSpawnService);
  readonly handlerService = inject(CreatureHandlerService);
}
