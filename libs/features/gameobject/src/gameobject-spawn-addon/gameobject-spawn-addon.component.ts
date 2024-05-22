import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { GameobjectSpawnAddon, INVISIBILITY_TYPE } from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectSpawnAddonService } from './gameobject-spawn-addon.service';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';

import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-spawn-addon',
  templateUrl: './gameobject-spawn-addon.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
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

  override readonly editorService = inject(GameobjectSpawnAddonService);
  readonly handlerService = inject(GameobjectHandlerService);
}
