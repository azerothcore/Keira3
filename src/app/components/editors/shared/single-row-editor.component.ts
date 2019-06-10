import { OnInit } from '@angular/core';

import { TableRow } from '../../../types';
import { SingleRowEditorService } from '../../../services/editors/single-row-editor.service';
import { HandlerService } from '../../../services/handlers/handler.service';
import { EditorComponent } from './editor.component';

export abstract class SingleRowEditorComponent<T extends TableRow> extends EditorComponent<T> implements OnInit {
  constructor(
    public editorService: SingleRowEditorService<T>,
    protected handlerService: HandlerService<T>,
  ) {
    super(editorService, handlerService);
  }

  ngOnInit() {
    if (this.editorService.loadedEntityId !== this.handlerService.selected) {
      this.editorService.reload(this.handlerService.selected);
    }
  }
}
