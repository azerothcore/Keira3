import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HandlerService } from '@keira-abstract/service/handlers/handler.service';
import { GameobjectTemplate } from '@keira-types/gameobject-template.type';
import { SaiGameobjectHandlerService } from './sai-gameobject-handler.service';

@Injectable({
  providedIn: 'root'
})
export class GameobjectHandlerService extends HandlerService<GameobjectTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
    protected saiGameobjectHandler: SaiGameobjectHandlerService,
  ) {
    super(
      'gameobject/gameobject-template',
      router,
    );
  }

  select(isNew: boolean, id: string|number|Partial<GameobjectTemplate>, name?: string) {
    this.saiGameobjectHandler.select(isNew, { entryorguid: +id, source_type: 1 }, null, false);
    super.select(isNew, id, name);
  }
}
