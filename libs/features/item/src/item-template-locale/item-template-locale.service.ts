import { inject, Service } from '@angular/core';
import {
  ITEM_TEMPLATE_LOCALE_ID,
  ITEM_TEMPLATE_LOCALE_ID_2,
  ITEM_TEMPLATE_LOCALE_TABLE,
  ItemTemplateLocale,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { ItemHandlerService } from '../item-handler.service';

/** The translations of the selected entry, one row per locale (#144). */
@Service()
export class ItemTemplateLocaleService extends MultiRowEditorService<ItemTemplateLocale> {
  protected override readonly handlerService = inject(ItemHandlerService);
  protected override readonly _entityClass = ItemTemplateLocale;
  protected override readonly _entityTable = ITEM_TEMPLATE_LOCALE_TABLE;
  protected override readonly _entityIdField = ITEM_TEMPLATE_LOCALE_ID;
  protected override readonly _entitySecondIdField = ITEM_TEMPLATE_LOCALE_ID_2;

  constructor() {
    super();
    this.init();
  }
}
