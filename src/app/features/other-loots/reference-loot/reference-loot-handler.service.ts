import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HandlerService } from '@keira-abstract/service/handlers/handler.service';
import { REFERENCE_LOOT_TEMPLATE_TABLE, ReferenceLootTemplate } from '@keira-types/reference-loot-template.type';

@Injectable()
export class ReferenceLootHandlerService extends HandlerService<ReferenceLootTemplate> {

  get isUnsaved(): boolean { return this.statusMap[REFERENCE_LOOT_TEMPLATE_TABLE]; }

  protected _statusMap = {
    [REFERENCE_LOOT_TEMPLATE_TABLE]: false,
  };

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
  ) {
    super(
      'other-loots/reference',
      router,
    );
  }
}
