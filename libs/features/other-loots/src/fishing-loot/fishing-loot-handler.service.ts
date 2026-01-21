import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { FISHING_LOOT_TEMPLATE_TABLE, FishingLootTemplate } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class FishingLootHandlerService extends HandlerService<FishingLootTemplate> {
  protected readonly mainEditorRoutePath = 'other-loots/fishing';
  protected override readonly copyRoutePath = 'other-loots/fishing-copy';

  get isUnsaved(): Signal<boolean> {
    return this.statusMap[FISHING_LOOT_TEMPLATE_TABLE].asReadonly();
  }

  protected _statusMap = {
    [FISHING_LOOT_TEMPLATE_TABLE]: signal(false),
  };
}
