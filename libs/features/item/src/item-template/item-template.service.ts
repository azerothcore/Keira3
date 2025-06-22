import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { ITEM_TEMPLATE_ID, ITEM_TEMPLATE_NAME, ITEM_TEMPLATE_TABLE, ItemTemplate } from '@keira/shared/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';

@Injectable({
  providedIn: 'root',
})
export class ItemTemplateService extends SingleRowEditorService<ItemTemplate> {
  protected override readonly handlerService: ItemHandlerService;

  constructor() {
    const handlerService = inject(ItemHandlerService);

    super(ItemTemplate, ITEM_TEMPLATE_TABLE, ITEM_TEMPLATE_ID, ITEM_TEMPLATE_NAME, true, handlerService);

    this.handlerService = handlerService;
  }
}
