import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { TableRow } from '@keira/shared-constants';
import { MultiRowEditorService } from '../../abstract/service/editors/multi-row-editor.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-editor-buttons',
  templateUrl: './editor-buttons.component.html',
})
export class EditorButtonsComponent<T extends TableRow> {
  @Input() editorService: MultiRowEditorService<T>;
}
