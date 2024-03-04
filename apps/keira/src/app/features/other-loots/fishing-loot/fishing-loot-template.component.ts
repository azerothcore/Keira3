import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LootTemplateComponent } from '@keira/core';
import { FishingLootTemplate } from '@keira/acore-world-model';
import { FishingLootHandlerService } from './fishing-loot-handler.service';
import { FishingLootTemplateService } from './fishing-loot-template.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-fishing-loot-template',
  templateUrl: '../../../../../../../libs/keira-core/src/abstract/components/editors/loot-template/loot-template.component.html',
})
export class FishingLootTemplateComponent extends LootTemplateComponent<FishingLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: FishingLootTemplateService,
    public handlerService: FishingLootHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
