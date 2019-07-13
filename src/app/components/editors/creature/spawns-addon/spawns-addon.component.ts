import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { SpawnsAddon } from '../../../../types/spawns-addon.type';
import { SpawnsAddonService } from '../../../../services/editors/creature/spawns-addon.service';
import { EMOTE } from '../../../../constants/options/emote';
import { CREATURE_ADDON_BYTES_1 } from '../../../../constants/options/creature-addon-bytes1';
import { CREATURE_ADDON_BYTES_2 } from '../../../../constants/options/creature-addon-bytes2';

@Component({
  selector: 'app-spawns-addon',
  templateUrl: './spawns-addon.component.html',
  styleUrls: ['./spawns-addon.component.scss']
})
export class SpawnsAddonComponent extends MultiRowEditorComponent<SpawnsAddon> {

  public readonly EMOTE = EMOTE;
  public readonly CREATURE_ADDON_BYTES_1 = CREATURE_ADDON_BYTES_1;
  public readonly CREATURE_ADDON_BYTES_2 = CREATURE_ADDON_BYTES_2;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: SpawnsAddonService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }

}
