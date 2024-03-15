import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/core';
import { GameobjectSpawnAddon, INVISIBILITY_TYPE } from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectSpawnAddonService } from './gameobject-spawn-addon.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-spawn-addon',
  templateUrl: './gameobject-spawn-addon.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
    NgIf,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    SingleValueSelectorBtnComponent,
    NgxDatatableModule,
  ],
})
export class GameobjectSpawnAddonComponent extends MultiRowEditorComponent<GameobjectSpawnAddon> {
  readonly INVISIBILITY_TYPE = INVISIBILITY_TYPE;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectSpawnAddonService,
    public handlerService: GameobjectHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
