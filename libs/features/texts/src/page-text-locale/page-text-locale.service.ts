import { inject, Service } from '@angular/core';
import { PAGE_TEXT_LOCALE_ID, PAGE_TEXT_LOCALE_ID_2, PAGE_TEXT_LOCALE_TABLE, PageTextLocale } from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { PageTextHandlerService } from '../page-text/page-text-handler.service';

/** The translations of the selected entry, one row per locale (#144). */
@Service()
export class PageTextLocaleService extends MultiRowEditorService<PageTextLocale> {
  protected override readonly handlerService = inject(PageTextHandlerService);
  protected override readonly _entityClass = PageTextLocale;
  protected override readonly _entityTable = PAGE_TEXT_LOCALE_TABLE;
  protected override readonly _entityIdField = PAGE_TEXT_LOCALE_ID;
  protected override readonly _entitySecondIdField = PAGE_TEXT_LOCALE_ID_2;

  constructor() {
    super();
    this.init();
  }
}
