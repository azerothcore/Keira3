import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { PAGE_TEXT_ID, PAGE_TEXT_NAME, PAGE_TEXT_TABLE, PageText } from '@keira/shared/acore-world-model';
import { PageTextHandlerService } from './page-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class PageTextService extends SingleRowEditorService<PageText> {
  protected override handlerService: PageTextHandlerService;

  constructor() {
    const handlerService = inject(PageTextHandlerService);

    super(PageText, PAGE_TEXT_TABLE, PAGE_TEXT_ID, PAGE_TEXT_NAME, true, handlerService);

    this.handlerService = handlerService;
  }
}
