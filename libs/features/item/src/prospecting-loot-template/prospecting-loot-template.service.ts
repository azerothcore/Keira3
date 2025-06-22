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
  protected override readonly handlerService: ItemHandlerService;

  constructor() {
    const handlerService = inject(ItemHandlerService);

    super(ProspectingLootTemplate, PROSPECTING_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, handlerService);

    this.handlerService = handlerService;
  }
}
