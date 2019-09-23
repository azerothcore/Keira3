import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Conditions } from '../../types/conditions.type';
import { HandlerService } from './handler.service';

@Injectable({
  providedIn: 'root'
})
export class ConditionsHandlerService extends HandlerService<Conditions> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
  ) {
    super(
      'conditions/conditions',
      router,
    );
  }
}
