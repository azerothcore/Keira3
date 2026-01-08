import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { FISHING_LOOT_TEMPLATE_TABLE, FishingLootTemplate } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class FishingLootHandlerService extends HandlerService<FishingLootTemplate> {
  protected readonly mainEditorRoutePath = 'other-loots/fishing';
  protected readonly copyRoutePath = 'other-loots/fishing-copy';

  get isUnsaved(): Signal<boolean> {
    return this.statusMap[FISHING_LOOT_TEMPLATE_TABLE].asReadonly();
  }

  protected _statusMap = {
    [FISHING_LOOT_TEMPLATE_TABLE]: signal(false),
  };

  override select(isNew: boolean, id: string | number | Partial<FishingLootTemplate>, name?: string, navigate = true, sourceId?: string) {
    if (isNew && sourceId) {
      super.select(isNew, id, name, false, sourceId);
      this.router.navigate([this.copyRoutePath]);
    } else {
      super.select(isNew, id, name, navigate);
    }
  }
}
