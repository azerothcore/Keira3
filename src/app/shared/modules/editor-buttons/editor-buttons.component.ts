import { Component, Input } from '@angular/core';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { TableRow } from '@keira-types/general';

@Component({
  selector: 'keira-editor-buttons',
  templateUrl: './editor-buttons.component.html',
})
export class EditorButtonsComponent<T extends TableRow> {
  @Input() editorService: MultiRowEditorService<T>;
}
