import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LootTemplateComponent } from '@keira/core';
import { ProspectingLootTemplate } from '@keira/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';
import { ProspectingLootTemplateService } from './prospecting-loot-template.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-prospecting-loot-template',
  templateUrl: '../../../../../../../libs/keira-core/src/abstract/components/editors/loot-template/loot-template.component.html',
})
export class ProspectingLootTemplateComponent extends LootTemplateComponent<ProspectingLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ProspectingLootTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
