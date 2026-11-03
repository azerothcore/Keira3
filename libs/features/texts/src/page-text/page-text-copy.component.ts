import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { PageTextHandlerService } from './page-text-handler.service';
import { PAGE_TEXT_TABLE, PAGE_TEXT_ID, PAGE_TEXT_LOCALE_TABLE, PAGE_TEXT_LOCALE_ID } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-page-text-copy',
  template: `<keira-copy-output
    [handlerService]="handlerService"
    selectRoute="texts/select-page-text"
    [tableName]="tableName"
    [idField]="idField"
    [relatedTables]="relatedTables"
  />`,
  imports: [CopyOutputComponent],
})
export class PageTextCopyComponent {
  protected readonly handlerService = inject(PageTextHandlerService);

  protected readonly tableName = PAGE_TEXT_TABLE;
  protected readonly idField = PAGE_TEXT_ID;

  protected readonly relatedTables = [{ tableName: PAGE_TEXT_LOCALE_TABLE, idField: PAGE_TEXT_LOCALE_ID }];
}
