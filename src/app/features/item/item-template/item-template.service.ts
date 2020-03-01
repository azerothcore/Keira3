import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import {
  ITEM_TEMPLATE_ID,
  ITEM_TEMPLATE_NAME,
  ITEM_TEMPLATE_TABLE,
  ItemTemplate
} from '@keira-types/item-template.type';
import { MysqlQueryService } from '../../../shared/services/mysql-query.service';
import { ItemHandlerService } from '../item-handler.service';

@Injectable()
export class ItemTemplateService extends SingleRowEditorService<ItemTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    protected queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      ItemTemplate,
      ITEM_TEMPLATE_TABLE,
      ITEM_TEMPLATE_ID,
      ITEM_TEMPLATE_NAME,
      true,
      handlerService,
      queryService,
      toastrService,
    );
  }
}
