import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { ITEM_TEMPLATE_ID, ITEM_TEMPLATE_NAME, ITEM_TEMPLATE_TABLE, ItemTemplate } from '@keira/shared/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';

@Injectable({
  providedIn: 'root',
})
export class ItemTemplateService extends SingleRowEditorService<ItemTemplate> {
  protected override readonly handlerService = inject(ItemHandlerService);
  protected override _entityClass = ItemTemplate;
  protected override _entityTable = ITEM_TEMPLATE_TABLE;
  protected override _entityIdField = ITEM_TEMPLATE_ID;
  protected override _entityNameField = ITEM_TEMPLATE_NAME;
  protected override isMainEntity = true;

  constructor() {
    super();
    this.init();
  }
}
