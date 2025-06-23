import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { FISHING_LOOT_TEMPLATE_TABLE, FishingLootTemplate, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2 } from '@keira/shared/acore-world-model';
import { FishingLootHandlerService } from './fishing-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class FishingLootTemplateService extends MultiRowEditorService<FishingLootTemplate> {
  protected override readonly handlerService = inject(FishingLootHandlerService);
  protected override readonly _entityClass = FishingLootTemplate;
  protected override readonly _entityTable = FISHING_LOOT_TEMPLATE_TABLE;
  protected override readonly _entityIdField = LOOT_TEMPLATE_ID;
  protected override readonly _entitySecondIdField = LOOT_TEMPLATE_ID_2;

  constructor() {
    super();
  }
}
