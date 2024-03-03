import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LootTemplateComponent } from '@keira/core';
import { ItemLootTemplate } from '@keira/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';
import { ItemLootTemplateService } from './item-loot-template.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-loot-template',
  templateUrl: '../../../../../../../libs/keira-core/src/abstract/components/editors/loot-template/loot-template.component.html',
})
export class ItemLootTemplateComponent extends LootTemplateComponent<ItemLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ItemLootTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
