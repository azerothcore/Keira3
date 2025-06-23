import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  LOOT_TEMPLATE_ID,
  LOOT_TEMPLATE_ID_2,
  PROSPECTING_LOOT_TEMPLATE_TABLE,
  ProspectingLootTemplate,
} from '@keira/shared/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';

@Injectable({
  providedIn: 'root',
})
export class ProspectingLootTemplateService extends MultiRowEditorService<ProspectingLootTemplate> {
  protected override readonly handlerService = inject(ItemHandlerService);
  protected override readonly _entityClass = ProspectingLootTemplate;
  protected override readonly _entityTable = PROSPECTING_LOOT_TEMPLATE_TABLE;
  protected override readonly _entityIdField = LOOT_TEMPLATE_ID;
  protected override readonly _entitySecondIdField = LOOT_TEMPLATE_ID_2;

  constructor() {
    super();
    this.init();
  }
}
