import { Injectable } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { REFERENCE_LOOT_TEMPLATE_TABLE, ReferenceLootTemplate } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class ReferenceLootHandlerService extends HandlerService<ReferenceLootTemplate> {
  protected readonly mainEditorRoutePath = 'other-loots/reference';

  get isUnsaved(): boolean {
    return this.statusMap[REFERENCE_LOOT_TEMPLATE_TABLE];
  }

  protected _statusMap = {
    [REFERENCE_LOOT_TEMPLATE_TABLE]: false,
  };
}
