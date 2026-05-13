import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { GameobjectSpawn, PHASE_MASK, SPAWN_MASK } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { AreaSelectorBtnComponent, FlagsSelectorBtnComponent, MapSelectorBtnComponent } from '@keira/shared/selectors';
import { MapViewerComponent, MapPoint } from '@keira/shared/map-viewer';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectSpawnService } from './gameobject-spawn.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-spawn',
  templateUrl: './gameobject-spawn.component.html',
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
    MapViewerComponent,
  ],
})
export class GameobjectSpawnComponent extends MultiRowEditorComponent<GameobjectSpawn> {
  protected readonly SPAWN_MASK = SPAWN_MASK;
  protected readonly PHASE_MASK = PHASE_MASK;

  protected override readonly editorService = inject(GameobjectSpawnService);
  protected readonly handlerService = inject(GameobjectHandlerService);

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
      icon: 'pin-yellow.png',
    }));
  });
}
