import { Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { PAGE_TEXT_ID, PAGE_TEXT_NAME, PAGE_TEXT_SEARCH_FIELDS, PAGE_TEXT_TABLE, PageText } from '@keira/shared/acore-world-model';
import { PageTextHandlerService } from './page-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectPageTextService extends SelectService<PageText> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    override readonly queryService: MysqlQueryService,
    public override readonly handlerService: PageTextHandlerService,
  ) {
    super(queryService, handlerService, PAGE_TEXT_TABLE, PAGE_TEXT_ID, PAGE_TEXT_NAME, PAGE_TEXT_SEARCH_FIELDS);
  }
}
