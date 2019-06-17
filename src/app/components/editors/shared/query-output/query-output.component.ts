import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';

import { EditorService } from '../../../../services/editors/editor.service';
import { TableRow } from '../../../../types/general';

@Component({
  selector: 'app-query-output',
  templateUrl: './query-output.component.html',
  styleUrls: ['./query-output.component.scss']
})
export class QueryOutputComponent<T extends TableRow> {
  @Input() editorService: EditorService<T>;
  @Output() executeQuery = new EventEmitter<string>();
  selectedQuery: 'diff'|'full' = 'diff';

  constructor(
    private clipboardService: ClipboardService,
  ) {}

  showFullQuery(): boolean {
    if (this.editorService.isNew) {
      return true;
    }
    return this.selectedQuery === 'full';
  }

  copy() {
    if (this.showFullQuery()) {
      this.clipboardService.copyFromContent(this.editorService.fullQuery);
    } else {
      this.clipboardService.copyFromContent(this.editorService.diffQuery);
    }
  }

  execute() {
    if (this.showFullQuery()) {
      this.executeQuery.emit(this.editorService.fullQuery);
    } else {
      this.executeQuery.emit(this.editorService.diffQuery);
    }
  }
}
