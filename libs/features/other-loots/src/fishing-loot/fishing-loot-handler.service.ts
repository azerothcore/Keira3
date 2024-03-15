import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { FISHING_LOOT_TEMPLATE_TABLE, FishingLootTemplate } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class FishingLootHandlerService extends HandlerService<FishingLootTemplate> {
  get isUnsaved(): boolean {
    return this.statusMap[FISHING_LOOT_TEMPLATE_TABLE];
  }

  protected _statusMap = {
    [FISHING_LOOT_TEMPLATE_TABLE]: false,
  };

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected router: Router) {
    super('other-loots/fishing', router);
  }
}
