import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { PAGE_TEXT_ID, PAGE_TEXT_NAME, PAGE_TEXT_TABLE, PageText } from '@keira/shared/acore-world-model';
import { PageTextHandlerService } from './page-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class PageTextService extends SingleRowEditorService<PageText> {
  protected override readonly handlerService = inject(PageTextHandlerService);
  protected override _entityClass = PageText;
  protected override _entityTable = PAGE_TEXT_TABLE;
  protected override _entityIdField = PAGE_TEXT_ID;
  protected override _entityNameField = PAGE_TEXT_NAME;
  protected override isMainEntity = true;

  constructor() {
    super();
    this.init();
  }
}
