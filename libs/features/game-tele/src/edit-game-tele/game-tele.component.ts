import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameTele } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { MapPoint, MapViewerComponent } from '@keira/shared/map-viewer';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { GameTeleService } from './game-tele.service';
import { GameTeleHandlerService } from '../game-tele-handler.service';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';
import { MapSelectorBtnComponent } from '@keira/shared/selectors';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-conditions',
  templateUrl: './game-tele.component.html',
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    QueryOutputComponent,
    MapSelectorBtnComponent,
    MapViewerComponent,
  ],
})
export class GameTeleComponent extends SingleRowEditorComponent<GameTele> {
  protected override readonly editorService = inject(GameTeleService);
  protected readonly handlerService = inject(GameTeleHandlerService);

  private readonly _formChange = toSignal(this.editorService.form.valueChanges, { initialValue: null });

  readonly mapPoints = computed<MapPoint[]>(() => {
    this._formChange();
    const val = this.editorService.form.getRawValue();
    if (!val.map) return [];
    return [
      {
        mapId: val.map,
        x: val.position_x,
        y: val.position_y,
        orientation: val.orientation,
        name: val.name,
        icon: 'map/pin-yellow.png',
      },
    ];
  });
}
