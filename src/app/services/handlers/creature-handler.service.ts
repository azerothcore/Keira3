import { Injectable } from '@angular/core';
import { HandlerService } from './handler.service';
import { CreatureTemplate } from '../../types/creature-template.type';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CreatureHandlerService extends HandlerService<CreatureTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
  ) {
    super(
      'creature/creature-template',
      router,
    );
  }
}
