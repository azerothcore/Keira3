import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Conditions, CONDITIONS_ID_FIELDS } from '@keira-types/conditions.type';
import { ComplexKeyHandlerService } from '@keira-abstract/service/handlers/complex-key.handler.service';

@Injectable({
  providedIn: 'root'
})
export class ConditionsHandlerService extends ComplexKeyHandlerService<Conditions> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
  ) {
    super(
      'conditions/conditions',
      router,
      CONDITIONS_ID_FIELDS,
    );
  }
}
