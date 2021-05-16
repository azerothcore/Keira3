import { Component } from '@angular/core';

import { SpellLootTemplate } from '@keira-types/spell-loot-template.type';
import { SpellLootTemplateService } from './spell-loot-template.service';
import { LootTemplateComponent } from '@keira-abstract/components/editors/loot-template/loot-template.component';
import { SpellLootHandlerService } from './spell-loot-handler.service';

@Component({
  selector: 'keira-spell-loot-template',
  templateUrl: '../../../shared/abstract/components/editors/loot-template/loot-template.component.html',
})
export class SpellLootTemplateComponent extends LootTemplateComponent<SpellLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: SpellLootTemplateService, public handlerService: SpellLootHandlerService) {
    super(editorService, handlerService);
  }
}
