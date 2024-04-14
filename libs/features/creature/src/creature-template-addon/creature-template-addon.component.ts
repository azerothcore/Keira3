import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import {
  CREATURE_ADDON_BYTES_1,
  CREATURE_ADDON_BYTES_2,
  CREATURE_SPAWN_ADDON_TABLE,
  CreatureTemplateAddon,
  EMOTE,
} from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateAddonService } from './creature-template-addon.service';
import { SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';

import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-template-addon',
  templateUrl: './creature-template-addon.component.html',
  styleUrls: ['./creature-template-addon.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    SingleValueSelectorBtnComponent,
  ],
})
export class CreatureTemplateAddonComponent extends SingleRowEditorComponent<CreatureTemplateAddon> {
  public get docUrl(): string {
    return this.WIKI_BASE_URL + CREATURE_SPAWN_ADDON_TABLE; // they share the same doc page
  }

  readonly EMOTE = EMOTE;
  readonly CREATURE_ADDON_BYTES_1 = CREATURE_ADDON_BYTES_1;
  readonly CREATURE_ADDON_BYTES_2 = CREATURE_ADDON_BYTES_2;

  readonly editorService = inject(CreatureTemplateAddonService);
  readonly handlerService = inject(CreatureHandlerService);
}
