import { Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { CREATURE_ADDON_BYTES_1 } from '@keira-constants/options/creature-addon-bytes1';
import { CREATURE_ADDON_BYTES_2 } from '@keira-constants/options/creature-addon-bytes2';
import { EMOTE } from '@keira-constants/options/emote';
import { CREATURE_SPAWN_ADDON_TABLE } from '@keira-types/creature-spawn-addon.type';
import { CreatureTemplateAddon } from '@keira-types/creature-template-addon.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateAddonService } from './creature-template-addon.service';

@Component({
  selector: 'keira-creature-template-addon',
  templateUrl: './creature-template-addon.component.html',
  styleUrls: ['./creature-template-addon.component.scss'],
})
export class CreatureTemplateAddonComponent extends SingleRowEditorComponent<CreatureTemplateAddon> {
  public get docUrl(): string {
    return this.WIKI_BASE_URL + CREATURE_SPAWN_ADDON_TABLE; // they share the same doc page
  }

  public readonly EMOTE = EMOTE;
  public readonly CREATURE_ADDON_BYTES_1 = CREATURE_ADDON_BYTES_1;
  public readonly CREATURE_ADDON_BYTES_2 = CREATURE_ADDON_BYTES_2;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: CreatureTemplateAddonService, public handlerService: CreatureHandlerService) {
    super(editorService, handlerService);
  }
}
