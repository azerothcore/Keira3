import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { PageText, PAGE_TEXT_TABLE } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class PageTextHandlerService extends HandlerService<PageText> {
  get isUnsaved(): boolean {
    return this.statusMap[PAGE_TEXT_TABLE];
  }

  protected _statusMap = {
    [PAGE_TEXT_TABLE]: false,
  };

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override readonly router: Router) {
    super('texts/page-text', router);
  }
}
