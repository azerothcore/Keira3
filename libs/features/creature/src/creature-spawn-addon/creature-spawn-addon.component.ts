import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/core';
import { CREATURE_ADDON_BYTES_1, CREATURE_ADDON_BYTES_2, CreatureSpawnAddon, EMOTE } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureSpawnAddonService } from './creature-spawn-addon.service';
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
  selector: 'keira-creature-spawn-addon',
  templateUrl: './creature-spawn-addon.component.html',
  styleUrls: ['./creature-spawn-addon.component.scss'],
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
export class CreatureSpawnAddonComponent extends MultiRowEditorComponent<CreatureSpawnAddon> {
  readonly EMOTE = EMOTE;
  readonly CREATURE_ADDON_BYTES_1 = CREATURE_ADDON_BYTES_1;
  readonly CREATURE_ADDON_BYTES_2 = CREATURE_ADDON_BYTES_2;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureSpawnAddonService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
