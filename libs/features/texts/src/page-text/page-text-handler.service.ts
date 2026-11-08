import { Service, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { PageText, PAGE_TEXT_TABLE, PAGE_TEXT_LOCALE_TABLE } from '@keira/shared/acore-world-model';

@Service()
export class PageTextHandlerService extends HandlerService<PageText> {
  protected readonly mainEditorRoutePath = 'texts/page-text';
  protected override readonly copyRoutePath = 'texts/page-text-copy';

  get isUnsaved(): Signal<boolean> {
    return this.statusMap[PAGE_TEXT_TABLE].asReadonly();
  }

  get isPageTextLocaleUnsaved(): Signal<boolean> {
    return this.statusMap[PAGE_TEXT_LOCALE_TABLE].asReadonly();
  }

  protected _statusMap = {
    [PAGE_TEXT_TABLE]: signal(false),
    [PAGE_TEXT_LOCALE_TABLE]: signal(false),
  };
}
