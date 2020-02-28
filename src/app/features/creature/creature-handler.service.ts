import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HandlerService } from '@keira-abstract/service/handlers/handler.service';
import { CreatureTemplate } from '@keira-types/creature-template.type';
import { SaiCreatureHandlerService } from './sai-creature-handler.service';

@Injectable()
export class CreatureHandlerService extends HandlerService<CreatureTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
    protected saiCreatureHandler: SaiCreatureHandlerService
  ) {
    super(
      'creature/creature-template',
      router,
    );
  }

  select(isNew: boolean, id: string|number|Partial<CreatureTemplate>, name?: string) {
    this.saiCreatureHandler.select(isNew, { entryorguid: +id, source_type: 0 }, null, false);
    super.select(isNew, id, name);
  }
}
