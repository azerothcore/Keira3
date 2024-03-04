import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LootTemplateIdComponent } from '@keira/core';
import { DisenchantLootTemplate } from '@keira/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';
import { DisenchantLootTemplateService } from './disenchant-loot-template.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-disenchant-loot-template',
  templateUrl: '../../../../../../../libs/keira-core/src/abstract/components/editors/loot-template/loot-template-id.component.html',
})
export class DisenchantLootTemplateComponent extends LootTemplateIdComponent<DisenchantLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: DisenchantLootTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
