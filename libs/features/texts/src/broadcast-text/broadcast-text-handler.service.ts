import { Service, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { BroadcastText, BROADCAST_TEXT_TABLE } from '@keira/shared/acore-world-model';

@Service()
export class BroadcastTextHandlerService extends HandlerService<BroadcastText> {
  protected readonly mainEditorRoutePath = 'texts/broadcast-text';

  get isUnsaved(): Signal<boolean> {
    return this.statusMap[BROADCAST_TEXT_TABLE].asReadonly();
  }

  protected _statusMap = {
    [BROADCAST_TEXT_TABLE]: signal(false),
  };
}
