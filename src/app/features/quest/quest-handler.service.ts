import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HandlerService } from '@keira-abstract/service/handlers/handler.service';
import { QuestTemplate } from '@keira-types/quest-template.type';

@Injectable()
export class QuestHandlerService extends HandlerService<QuestTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
  ) {
    super(
      'quest/quest-template',
      router,
    );
  }
}
