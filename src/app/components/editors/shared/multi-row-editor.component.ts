import { OnInit } from '@angular/core';

import { TableRow } from '../../../types/general';
import { HandlerService } from '../../../services/handlers/handler.service';
import { EditorComponent } from './editor.component';
import { MultiRowEditorService } from '../../../services/editors/multi-row-editor.service';
import { DTCFG } from '../../../config/datatable.config';

export abstract class MultiRowEditorComponent<T extends TableRow> extends EditorComponent<T> implements OnInit {

  public readonly DTCFG = DTCFG;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: MultiRowEditorService<T>,
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
