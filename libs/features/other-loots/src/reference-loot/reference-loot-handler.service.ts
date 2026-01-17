import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { REFERENCE_LOOT_TEMPLATE_TABLE, ReferenceLootTemplate } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class ReferenceLootHandlerService extends HandlerService<ReferenceLootTemplate> {
  protected readonly mainEditorRoutePath = 'other-loots/reference';

  get isUnsaved(): Signal<boolean> {
    return this.statusMap[REFERENCE_LOOT_TEMPLATE_TABLE].asReadonly();
  }

  protected _statusMap = {
    [REFERENCE_LOOT_TEMPLATE_TABLE]: signal(false),
  };
}
