import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { FISHING_LOOT_TEMPLATE_TABLE, FishingLootTemplate, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2 } from '@keira/shared/acore-world-model';
import { FishingLootHandlerService } from './fishing-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class FishingLootTemplateService extends MultiRowEditorService<FishingLootTemplate> {
  protected override readonly handlerService: FishingLootHandlerService;

  constructor() {
    const handlerService = inject(FishingLootHandlerService);

    super(FishingLootTemplate, FISHING_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, handlerService);

    this.handlerService = handlerService;
  }
}
