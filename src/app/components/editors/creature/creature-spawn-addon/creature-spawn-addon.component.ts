import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { CreatureSpawnAddon } from '../../../../types/creature-spawn-addon.type';
import { CreatureSpawnAddonService } from '../../../../services/editors/creature/creature-spawn-addon.service';
import { EMOTE } from '../../../../constants/options/emote';
import { CREATURE_ADDON_BYTES_1 } from '../../../../constants/options/creature-addon-bytes1';
import { CREATURE_ADDON_BYTES_2 } from '../../../../constants/options/creature-addon-bytes2';

@Component({
  selector: 'app-creature-spawn-addon',
  templateUrl: './creature-spawn-addon.component.html',
  styleUrls: ['./creature-spawn-addon.component.scss']
})
export class CreatureSpawnAddonComponent extends MultiRowEditorComponent<CreatureSpawnAddon> {

  public readonly EMOTE = EMOTE;
  public readonly CREATURE_ADDON_BYTES_1 = CREATURE_ADDON_BYTES_1;
  public readonly CREATURE_ADDON_BYTES_2 = CREATURE_ADDON_BYTES_2;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureSpawnAddonService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }

}
