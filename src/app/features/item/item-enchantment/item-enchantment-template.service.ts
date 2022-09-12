import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import {
  ItemEnchantmentTemplate,
  ITEM_ENCHANTMENT_TEMPLATE_ID,
  ITEM_ENCHANTMENT_TEMPLATE_ID_2,
  ITEM_ENCHANTMENT_TEMPLATE_TABLE,
} from '@keira-types/item-enchantment-template.type';
import { ToastrService } from 'ngx-toastr';
import { ItemHandlerService } from '../item-handler.service';

@Injectable()
export class ItemEnchantmentTemplateService extends MultiRowEditorService<ItemEnchantmentTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      ItemEnchantmentTemplate,
      ITEM_ENCHANTMENT_TEMPLATE_TABLE,
      ITEM_ENCHANTMENT_TEMPLATE_ID,
      ITEM_ENCHANTMENT_TEMPLATE_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}
