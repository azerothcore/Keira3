import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { PAGE_TEXT_ID, PAGE_TEXT_NAME, PAGE_TEXT_SEARCH_FIELDS, PAGE_TEXT_TABLE, PageText } from '@keira/shared/acore-world-model';
import { PageTextHandlerService } from './page-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectPageTextService extends SelectService<PageText> {
  override readonly queryService: MysqlQueryService;
  override readonly handlerService: PageTextHandlerService;

  constructor() {
    const queryService = inject(MysqlQueryService);
    const handlerService = inject(PageTextHandlerService);

    super(queryService, handlerService, PAGE_TEXT_TABLE, PAGE_TEXT_ID, PAGE_TEXT_NAME, PAGE_TEXT_SEARCH_FIELDS);

    this.queryService = queryService;
    this.handlerService = handlerService;
  }
}
