import { Injectable } from '@angular/core';

import { SearchService } from './search.service';
import { MysqlQueryService } from '../../services/mysql-query.service';
import {
  ITEM_TEMPLATE_SEARCH_FIELDS,
  ITEM_TEMPLATE_TABLE,
  ItemTemplate,
} from '../../types/item-template.type';

@Injectable({
  providedIn: 'root'
})
export class ItemSearchService extends SearchService<ItemTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public readonly queryService: MysqlQueryService,
  ) {
    super(queryService, ITEM_TEMPLATE_TABLE, ITEM_TEMPLATE_SEARCH_FIELDS);
  }
}
