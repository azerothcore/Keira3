import { Injectable } from '@angular/core';
import { MysqlQueryService } from '../../services/mysql-query.service';
import { ItemTemplate, ITEM_TEMPLATE_SEARCH_FIELDS, ITEM_TEMPLATE_TABLE } from '../../types/item-template.type';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class ItemSearchService extends SearchService<ItemTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(readonly queryService: MysqlQueryService) {
    super(queryService, ITEM_TEMPLATE_TABLE, ITEM_TEMPLATE_SEARCH_FIELDS);
  }
}
