import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TableRow } from '@keira/shared/constants';
import { TranslateModule } from '@ngx-translate/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-editor-buttons',
  templateUrl: './editor-buttons.component.html',
  imports: [TranslateModule],
})
export class EditorButtonsComponent<T extends TableRow> {
  readonly editorService = input.required<MultiRowEditorService<T>>();
}
