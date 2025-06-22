import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { BROADCAST_TEXT_ID, BROADCAST_TEXT_NAME, BROADCAST_TEXT_TABLE, BroadcastText } from '@keira/shared/acore-world-model';
import { BroadcastTextHandlerService } from './broadcast-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class BroadcastTextService extends SingleRowEditorService<BroadcastText> {
  protected override handlerService: BroadcastTextHandlerService;

  constructor() {
    const handlerService = inject(BroadcastTextHandlerService);

    super(BroadcastText, BROADCAST_TEXT_TABLE, BROADCAST_TEXT_ID, BROADCAST_TEXT_NAME, true, handlerService);

    this.handlerService = handlerService;
  }
}
