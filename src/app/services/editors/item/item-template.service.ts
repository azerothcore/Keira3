import { Injectable } from '@angular/core';

import { SingleRowEditorService } from '../single-row-editor.service';
import {
  ITEM_TEMPLATE_ID,
  ITEM_TEMPLATE_NAME,
  ITEM_TEMPLATE_TABLE,
  ItemTemplate
} from '../../../types/item-template.type';
import { QueryService } from '../../query.service';
import { ItemHandlerService } from '../../handlers/item-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ItemTemplateService extends SingleRowEditorService<ItemTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      ItemTemplate,
      ITEM_TEMPLATE_TABLE,
      ITEM_TEMPLATE_ID,
      ITEM_TEMPLATE_NAME,
      true,
      handlerService,
      queryService,
    );
  }
}
