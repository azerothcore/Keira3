import { OnInit } from '@angular/core';

import { LootTemplate } from '@keira-types/loot-template.type';
import { MultiRowEditorComponent } from '../multi-row-editor.component';
import { LOOT_MODE } from '@keira-constants/flags/loot-mode';

/* istanbul ignore next */ // TODO: for some reason the next line gives coverage issues...
export abstract class LootTemplateComponent<T extends LootTemplate> extends MultiRowEditorComponent<T> implements OnInit {

  public readonly LOOT_MODE = LOOT_MODE;

  public get docUrl() {
    // all loot tables have the same documentation page
    return this.WIKI_BASE_URL + 'loot_template';
  }

}
