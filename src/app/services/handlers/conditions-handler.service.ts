import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Conditions, CONDITIONS_ID_FIELDS } from '../../types/conditions.type';
import { HandlerService } from './handler.service';
import { getPartial } from '../../utils/helpers';

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
    return getPartial<Conditions>(input, CONDITIONS_ID_FIELDS);
  }
}
