import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LootTemplateComponent } from '@keira-abstract/components/editors/loot-template/loot-template.component';
import { MillingLootTemplate } from '@keira-types/milling-loot-template.type';
import { ItemHandlerService } from '../item-handler.service';
import { MillingLootTemplateService } from './milling-loot-template.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-milling-loot-template',
  templateUrl: '../../../shared/abstract/components/editors/loot-template/loot-template.component.html',
})
export class MillingLootTemplateComponent extends LootTemplateComponent<MillingLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: MillingLootTemplateService, public handlerService: ItemHandlerService) {
    super(editorService, handlerService);
  }
}
