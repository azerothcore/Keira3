import { Injectable } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { PageText, PAGE_TEXT_TABLE } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class PageTextHandlerService extends HandlerService<PageText> {
  protected readonly mainEditorRoutePath = 'texts/page-text';

  get isUnsaved(): boolean {
    return this.statusMap[PAGE_TEXT_TABLE];
  }

  protected _statusMap = {
    [PAGE_TEXT_TABLE]: false,
  };
}
