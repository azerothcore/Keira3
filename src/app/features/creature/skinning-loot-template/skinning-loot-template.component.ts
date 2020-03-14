import { Component } from '@angular/core';

import { CreatureHandlerService } from '../creature-handler.service';
import { SkinningLootTemplate } from '@keira-types/skinning-loot-template.type';
import { SkinningLootTemplateService } from './skinning-loot-template.service';
import { LootTemplateComponent } from '@keira-abstract/components/editors/loot-template/loot-template.component';

@Component({
  selector: 'keira-skinning-loot-template',
  templateUrl: '../../../shared/abstract/components/editors/loot-template/loot-template.component.html',
  styleUrls: ['../../../shared/abstract/components/editors/loot-template/loot-template.component.scss']
})
export class SkinningLootTemplateComponent extends LootTemplateComponent<SkinningLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: SkinningLootTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

