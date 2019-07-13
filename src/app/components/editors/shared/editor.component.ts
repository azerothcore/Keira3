import { OnInit } from '@angular/core';

import { TableRow } from '../../../types/general';
import { WIKI_BASE_URL } from '../../../constants/general';
import { HandlerService } from '../../../services/handlers/handler.service';
import { EditorService } from '../../../services/editors/editor.service';

export abstract class EditorComponent<T extends TableRow> implements OnInit {
  public readonly WIKI_BASE_URL = WIKI_BASE_URL;
  public get docUrl() {
    return this.WIKI_BASE_URL + this.editorService.entityTable;
  }

  constructor(
    public editorService: EditorService<T>,
    protected handlerService: HandlerService<T>,
  ) { }

  ngOnInit() {
    if (this.editorService.loadedEntityId !== this.handlerService.selected) {
      this.editorService.reload(this.handlerService.selected);
    }
  }
}
