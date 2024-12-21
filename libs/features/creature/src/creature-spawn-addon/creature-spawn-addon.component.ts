import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CREATURE_ADDON_BYTES_1, CREATURE_ADDON_BYTES_2, CreatureSpawnAddon, EMOTE } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { GenericOptionSelectorComponent, SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureSpawnAddonService } from './creature-spawn-addon.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-spawn-addon',
  templateUrl: './creature-spawn-addon.component.html',
  styleUrls: ['./creature-spawn-addon.component.scss'],
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
    GenericOptionSelectorComponent,
  ],
})
export class CreatureSpawnAddonComponent extends MultiRowEditorComponent<CreatureSpawnAddon> {
  readonly EMOTE = EMOTE;
  readonly CREATURE_ADDON_BYTES_1 = CREATURE_ADDON_BYTES_1;
  readonly CREATURE_ADDON_BYTES_2 = CREATURE_ADDON_BYTES_2;

  protected override readonly editorService = inject(CreatureSpawnAddonService);
  readonly handlerService = inject(CreatureHandlerService);
}
