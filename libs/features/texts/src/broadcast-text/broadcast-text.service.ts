import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { BROADCAST_TEXT_ID, BROADCAST_TEXT_NAME, BROADCAST_TEXT_TABLE, BroadcastText } from '@keira/shared/acore-world-model';
import { BroadcastTextHandlerService } from './broadcast-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class BroadcastTextService extends SingleRowEditorService<BroadcastText> {
  protected override readonly handlerService = inject(BroadcastTextHandlerService);
  protected override _entityClass = BroadcastText;
  protected override _entityTable = BROADCAST_TEXT_TABLE;
  protected override _entityIdField = BROADCAST_TEXT_ID;
  protected override _entityNameField = BROADCAST_TEXT_NAME;
  protected override isMainEntity = true;

  constructor() {
    super();
    this.init();
  }
}
