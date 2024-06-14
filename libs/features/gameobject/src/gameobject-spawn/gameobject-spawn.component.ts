import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameobjectSpawn, PHASE_MASK, SPAWN_MASK } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { AreaSelectorBtnComponent, FlagsSelectorBtnComponent, MapSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectSpawnService } from './gameobject-spawn.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-spawn',
  templateUrl: './gameobject-spawn.component.html',
  styleUrls: ['./gameobject-spawn.component.scss'],
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
    EditorButtonsComponent,
    NgxDatatableModule,
  ],
})
export class GameobjectSpawnComponent extends MultiRowEditorComponent<GameobjectSpawn> {
  readonly SPAWN_MASK = SPAWN_MASK;
  readonly PHASE_MASK = PHASE_MASK;

  override readonly editorService = inject(GameobjectSpawnService);
  readonly handlerService = inject(GameobjectHandlerService);
}
