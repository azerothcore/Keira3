import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, MILLING_LOOT_TEMPLATE_TABLE, MillingLootTemplate } from '@keira/shared/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';

@Injectable({
  providedIn: 'root',
})
export class MillingLootTemplateService extends MultiRowEditorService<MillingLootTemplate> {
  protected override readonly handlerService = inject(ItemHandlerService);
  protected override readonly _entityClass = MillingLootTemplate;
  protected override readonly _entityTable = MILLING_LOOT_TEMPLATE_TABLE;
  protected override readonly _entityIdField = LOOT_TEMPLATE_ID;
  protected override readonly _entitySecondIdField = LOOT_TEMPLATE_ID_2;

  constructor() {
    super();
  }
}
