import { Injectable } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { BroadcastText, BROADCAST_TEXT_TABLE } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class BroadcastTextHandlerService extends HandlerService<BroadcastText> {
  protected readonly mainEditorRoutePath = 'texts/broadcast-text';

  get isUnsaved(): boolean {
    return this.statusMap[BROADCAST_TEXT_TABLE];
  }

  protected _statusMap = {
    [BROADCAST_TEXT_TABLE]: false,
  };
}
