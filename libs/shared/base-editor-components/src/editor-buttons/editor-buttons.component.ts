import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-editor-buttons',
  templateUrl: './editor-buttons.component.html',
  imports: [TranslateModule],
})
export class EditorButtonsComponent {
  readonly selectedRowId = input.required<string | number | undefined>();

  readonly deleteSelectedRow = output<void>();
  readonly addNewRow = output<void>();
  readonly duplicateRow = output<void>();
}
