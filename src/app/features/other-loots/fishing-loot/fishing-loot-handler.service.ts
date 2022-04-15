import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HandlerService } from '@keira-abstract/service/handlers/handler.service';
import { FishingLootTemplate, FISHING_LOOT_TEMPLATE_TABLE } from '@keira-types/fishing-loot-template.type';

@Injectable()
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
