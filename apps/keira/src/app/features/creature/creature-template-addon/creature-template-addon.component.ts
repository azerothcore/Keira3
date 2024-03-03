import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { CREATURE_ADDON_BYTES_1 } from '@keira/acore-world-model';
import { CREATURE_ADDON_BYTES_2 } from '@keira/acore-world-model';
import { EMOTE } from '@keira/acore-world-model';
import { CREATURE_SPAWN_ADDON_TABLE } from '@keira/acore-world-model';
import { CreatureTemplateAddon } from '@keira/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateAddonService } from './creature-template-addon.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-template-addon',
  templateUrl: './creature-template-addon.component.html',
  styleUrls: ['./creature-template-addon.component.scss'],
})
export class CreatureTemplateAddonComponent extends SingleRowEditorComponent<CreatureTemplateAddon> {
  public get docUrl(): string {
    return this.WIKI_BASE_URL + CREATURE_SPAWN_ADDON_TABLE; // they share the same doc page
  }

  readonly EMOTE = EMOTE;
  readonly CREATURE_ADDON_BYTES_1 = CREATURE_ADDON_BYTES_1;
  readonly CREATURE_ADDON_BYTES_2 = CREATURE_ADDON_BYTES_2;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureTemplateAddonService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
