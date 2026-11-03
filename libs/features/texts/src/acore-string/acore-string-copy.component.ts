import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { AcoreStringHandlerService } from './acore-string-handler.service';
import { ACORE_STRING_TABLE, ACORE_STRING_ENTRY } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-acore-string-copy',
  template: `<keira-copy-output
    [handlerService]="handlerService"
    selectRoute="texts/select-acore-string"
    [tableName]="tableName"
    [idField]="idField"
    [relatedTables]="relatedTables"
  />`,
  imports: [CopyOutputComponent],
})
export class AcoreStringCopyComponent {
  protected readonly handlerService = inject(AcoreStringHandlerService);

  protected readonly tableName = ACORE_STRING_TABLE;
  protected readonly idField = ACORE_STRING_ENTRY;

  protected readonly relatedTables: Array<{ tableName: string; idField: string }> = [];
}
