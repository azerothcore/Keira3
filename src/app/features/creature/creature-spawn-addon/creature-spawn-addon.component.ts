import { Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { CREATURE_ADDON_BYTES_1 } from '@keira-constants/options/creature-addon-bytes1';
import { CREATURE_ADDON_BYTES_2 } from '@keira-constants/options/creature-addon-bytes2';
import { EMOTE } from '@keira-constants/options/emote';
import { CreatureSpawnAddon } from '@keira-types/creature-spawn-addon.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureSpawnAddonService } from './creature-spawn-addon.service';

@Component({
  selector: 'keira-creature-spawn-addon',
  templateUrl: './creature-spawn-addon.component.html',
  styleUrls: ['./creature-spawn-addon.component.scss'],
})
export class CreatureSpawnAddonComponent extends MultiRowEditorComponent<CreatureSpawnAddon> {
  readonly EMOTE = EMOTE;
  readonly CREATURE_ADDON_BYTES_1 = CREATURE_ADDON_BYTES_1;
  readonly CREATURE_ADDON_BYTES_2 = CREATURE_ADDON_BYTES_2;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: CreatureSpawnAddonService, public handlerService: CreatureHandlerService) {
    super(editorService, handlerService);
  }
}
