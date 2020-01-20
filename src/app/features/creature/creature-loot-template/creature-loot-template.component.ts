import { Component } from '@angular/core';

import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureLootTemplate } from '../../../shared/types/creature-loot-template.type';
import { CreatureLootTemplateService } from './creature-loot-template.service';
import { LootTemplateComponent } from '../../../shared/abstract/components/editors/loot-template/loot-template.component';

@Component({
  selector: 'app-creature-loot-template',
  templateUrl: '../../../shared/abstract/components/editors/loot-template/loot-template.component.html',
  styleUrls: ['../../../shared/abstract/components/editors/loot-template/loot-template.component.scss']
})
export class CreatureLootTemplateComponent extends LootTemplateComponent<CreatureLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureLootTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
