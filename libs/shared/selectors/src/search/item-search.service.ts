import { Injectable } from '@angular/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { ITEM_TEMPLATE_SEARCH_FIELDS, ITEM_TEMPLATE_TABLE, ItemTemplate } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/core';

@Injectable({
  providedIn: 'root',
})
export class ItemSearchService extends SearchService<ItemTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(readonly queryService: MysqlQueryService) {
    super(queryService, ITEM_TEMPLATE_TABLE, ITEM_TEMPLATE_SEARCH_FIELDS);
  }
}
