import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HandlerService } from './handler.service';
import { GameobjectTemplate } from '../../types/gameobject-template.type';

@Injectable({
  providedIn: 'root'
})
export class GameobjectHandlerService extends HandlerService<GameobjectTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
  ) {
    super(
      'gameobject/gameobject-template',
      router,
    );
  }
}
