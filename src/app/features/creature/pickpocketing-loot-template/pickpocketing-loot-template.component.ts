import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LootTemplateIdComponent } from '@keira-abstract/components/editors/loot-template/loot-template-id.component';
import { PickpocketingLootTemplate } from '@keira-types/pickpocketing-loot-template.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { PickpocketingLootTemplateService } from './pickpocketing-loot-template.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-pickpocketing-loot-template',
  templateUrl: '../../../shared/abstract/components/editors/loot-template/loot-template-id.component.html',
})
export class PickpocketingLootTemplateComponent extends LootTemplateIdComponent<PickpocketingLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: PickpocketingLootTemplateService, public handlerService: CreatureHandlerService) {
    super(editorService, handlerService);
  }
}
