import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LootTemplateIdComponent } from '@keira-abstract/components/editors/loot-template/loot-template-id.component';
import { SkinningLootTemplate } from '@keira-types/skinning-loot-template.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { SkinningLootTemplateService } from './skinning-loot-template.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-skinning-loot-template',
  templateUrl: '../../../shared/abstract/components/editors/loot-template/loot-template-id.component.html',
})
export class SkinningLootTemplateComponent extends LootTemplateIdComponent<SkinningLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: SkinningLootTemplateService, public handlerService: CreatureHandlerService) {
    super(editorService, handlerService);
  }
}
