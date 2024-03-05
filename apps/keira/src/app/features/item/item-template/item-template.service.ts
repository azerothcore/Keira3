import { Injectable } from '@angular/core';
import { MysqlQueryService, SingleRowEditorService } from '@keira/shared/core';
import { ITEM_TEMPLATE_ID, ITEM_TEMPLATE_NAME, ITEM_TEMPLATE_TABLE, ItemTemplate } from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { ItemHandlerService } from '../item-handler.service';

@Injectable()
export class ItemTemplateService extends SingleRowEditorService<ItemTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(ItemTemplate, ITEM_TEMPLATE_TABLE, ITEM_TEMPLATE_ID, ITEM_TEMPLATE_NAME, true, handlerService, queryService, toastrService);
  }
}
