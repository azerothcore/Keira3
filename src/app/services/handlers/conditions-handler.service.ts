import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Conditions, CONDITIONS_ID_FIELDS } from '../../types/conditions.type';
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

  select(isNew: boolean, id: Partial<Conditions>) {
    super.select(isNew, this.getIdObject(id));
  }

  private getIdObject(input: Partial<Conditions> | Conditions): Partial<Conditions> {
    const output: Partial<Conditions> = {};

    for (const key of CONDITIONS_ID_FIELDS) {
      output[key] = input[key];
    }

    return output;
  }
}
