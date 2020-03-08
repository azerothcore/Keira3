import { Injectable } from '@angular/core';

import { SearchService } from './search.service';
import { MysqlQueryService } from '../../services/mysql-query.service';
import {
  ITEM_TEMPLATE_SEARCH_FIELDS,
  ITEM_TEMPLATE_TABLE,
  ItemTemplate,
} from '../../types/item-template.type';
import { ItemIconService } from '@keira-shared/services/item-icon.service';

@Injectable({
  providedIn: 'root'
})
export class ItemSearchService extends SearchService<ItemTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected queryService: MysqlQueryService,
    private itemIconService: ItemIconService,
  ) {
    super(queryService, ITEM_TEMPLATE_TABLE, ITEM_TEMPLATE_SEARCH_FIELDS);
  }

  protected async processRows() {
    await this.itemIconService.addIconLinkToRows(this.rows);
  }
}
