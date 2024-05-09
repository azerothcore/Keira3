import { inject, Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { PAGE_TEXT_ID, PAGE_TEXT_NAME, PAGE_TEXT_SEARCH_FIELDS, PAGE_TEXT_TABLE, PageText } from '@keira/shared/acore-world-model';
import { PageTextHandlerService } from './page-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectPageTextService extends SelectService<PageText> {
  public readonly handlerService = inject(PageTextHandlerService);
  protected readonly entityTable = PAGE_TEXT_TABLE;
  protected readonly entityIdField = PAGE_TEXT_ID;
  protected readonly entityNameField = PAGE_TEXT_NAME;
  protected readonly fieldList = PAGE_TEXT_SEARCH_FIELDS;
}
