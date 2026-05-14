import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import {
  AreaSelectorBtnComponent,
  FlagsSelectorBtnComponent,
  GenericOptionSelectorComponent,
  MapSelectorBtnComponent,
} from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureSpawnService } from './creature-spawn.service';
import { MapViewerComponent, MapPoint } from '@keira/shared/map-viewer';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-spawn',
  templateUrl: './creature-spawn.component.html',
  styleUrls: ['./creature-spawn.component.scss'],
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
    EditorButtonsComponent,
    NgxDatatableModule,
    GenericOptionSelectorComponent,
    MapViewerComponent,
  ],
})
export class CreatureSpawnComponent extends MultiRowEditorComponent<CreatureSpawn> {
  readonly UNIT_FLAGS = UNIT_FLAGS;
  readonly MOVEMENT_TYPE = MOVEMENT_TYPE;
  readonly NPC_FLAGS = NPC_FLAGS;
  readonly DYNAMIC_FLAGS = DYNAMIC_FLAGS;
  readonly SPAWN_MASK = SPAWN_MASK;
  readonly PHASE_MASK = PHASE_MASK;

  protected override readonly editorService = inject(CreatureSpawnService);
  readonly handlerService = inject(CreatureHandlerService);

  private readonly _formChange = toSignal(this.editorService.form.valueChanges, {
    initialValue: null,
  });

  readonly mapPoints = computed<MapPoint[]>(() => {
    this._formChange();
    return this.editorService.newRows.map((row) => ({
      mapId: row.map,
      x: row.position_x,
      y: row.position_y,
      orientation: row.orientation,
      name: `GUID ${row.guid}`,
      icon: 'map/pin-yellow.png',
    }));
  });
}
