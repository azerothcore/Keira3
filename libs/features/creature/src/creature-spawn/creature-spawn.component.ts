import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/core';
import {
  CreatureSpawn,
  DYNAMIC_FLAGS,
  MOVEMENT_TYPE,
  NPC_FLAGS,
  PHASE_MASK,
  SPAWN_MASK,
  UNIT_FLAGS,
} from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureSpawnService } from './creature-spawn.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EditorButtonsComponent } from '@keira/shared/core';
import { SingleValueSelectorBtnComponent } from '@keira/shared/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FlagsSelectorBtnComponent } from '@keira/shared/core';
import { AreaSelectorBtnComponent } from '@keira/shared/core';
import { MapSelectorBtnComponent } from '@keira/shared/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { TopBarComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-spawn',
  templateUrl: './creature-spawn.component.html',
  styleUrls: ['./creature-spawn.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    NgIf,
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
  ],
})
export class CreatureSpawnComponent extends MultiRowEditorComponent<CreatureSpawn> {
  readonly UNIT_FLAGS = UNIT_FLAGS;
  readonly MOVEMENT_TYPE = MOVEMENT_TYPE;
  readonly NPC_FLAGS = NPC_FLAGS;
  readonly DYNAMIC_FLAGS = DYNAMIC_FLAGS;
  readonly SPAWN_MASK = SPAWN_MASK;
  readonly PHASE_MASK = PHASE_MASK;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureSpawnService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
