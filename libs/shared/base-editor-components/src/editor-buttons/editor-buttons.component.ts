import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { TableRow } from '@keira/shared/constants';
import { MultiRowEditorService } from '../../abstract/service/editors/multi-row-editor.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-editor-buttons',
  templateUrl: './editor-buttons.component.html',
  standalone: true,
  imports: [TranslateModule],
})
export class EditorButtonsComponent<T extends TableRow> {
  @Input() editorService: MultiRowEditorService<T>;
}
