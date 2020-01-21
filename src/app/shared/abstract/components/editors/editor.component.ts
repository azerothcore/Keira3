import { OnInit } from '@angular/core';

import { TableRow } from '@keira-types/general';
import { WIKI_BASE_URL } from '@keira-constants/general';
import { HandlerService } from '../../service/handlers/handler.service';
import { EditorService } from '../../service/editors/editor.service';
import { SubscriptionHandler } from '../../../utils/subscription-handler/subscription-handler';

export abstract class EditorComponent<T extends TableRow> extends SubscriptionHandler implements OnInit {
  public readonly WIKI_BASE_URL = WIKI_BASE_URL;
  public get docUrl() {
    return this.WIKI_BASE_URL + this.editorService.entityTable;
  }

  constructor(
    public editorService: EditorService<T>,
    protected handlerService: HandlerService<T>,
  ) {
    super();
  }

  ngOnInit() {
    if (this.editorService.loadedEntityId !== this.handlerService.selected) {
      this.editorService.reload(this.handlerService.selected);
    }
  }
}
