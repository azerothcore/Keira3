import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { TableRow } from '@keira-types/general';
import { WIKI_BASE_URL } from '@keira-constants/general';
import { HandlerService } from '../../service/handlers/handler.service';
import { EditorService } from '../../service/editors/editor.service';
import { SubscriptionHandler } from '../../../utils/subscription-handler/subscription-handler';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export abstract class EditorComponent<T extends TableRow> extends SubscriptionHandler implements OnInit {
  readonly WIKI_BASE_URL = WIKI_BASE_URL;

  protected readonly changeDetectorRef = inject(ChangeDetectorRef);

  public get docUrl(): string {
    return this.WIKI_BASE_URL + this.editorService.entityTable;
  }

  constructor(public editorService: EditorService<T>, protected handlerService: HandlerService<T>) {
    super();
  }

  ngOnInit() {
    this.editorService.clearCache();

    if (this.editorService.loadedEntityId !== this.handlerService.selected) {
      this.editorService.reload(this.changeDetectorRef, this.handlerService.selected);
    }
  }

  save(query: string): void {
    this.editorService.save(this.changeDetectorRef, query);
  }
}
