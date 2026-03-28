import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { PageText, PAGE_TEXT_TABLE } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class PageTextHandlerService extends HandlerService<PageText> {
  protected readonly mainEditorRoutePath = 'texts/page-text';
  protected override readonly copyRoutePath = 'texts/page-text-copy';

  get isUnsaved(): Signal<boolean> {
    return this.statusMap[PAGE_TEXT_TABLE].asReadonly();
  }

  protected _statusMap = {
    [PAGE_TEXT_TABLE]: signal(false),
  };
}
