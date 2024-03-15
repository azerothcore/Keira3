import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { GameobjectSpawn, PHASE_MASK, SPAWN_MASK } from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectSpawnService } from './gameobject-spawn.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EditorButtonsComponent } from '@keira/shared/base-editor-components';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AreaSelectorBtnComponent, FlagsSelectorBtnComponent, MapSelectorBtnComponent } from '@keira/shared/selectors';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-spawn',
  templateUrl: './gameobject-spawn.component.html',
  styleUrls: ['./gameobject-spawn.component.scss'],
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
    EditorButtonsComponent,
    NgxDatatableModule,
  ],
})
export class GameobjectSpawnComponent extends MultiRowEditorComponent<GameobjectSpawn> {
  readonly SPAWN_MASK = SPAWN_MASK;
  readonly PHASE_MASK = PHASE_MASK;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectSpawnService,
    public handlerService: GameobjectHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
