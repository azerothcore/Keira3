import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ComplexKeyHandlerService } from '@keira/shared/base-abstract-classes';
import { Conditions, CONDITIONS_ID_FIELDS, CONDITIONS_TABLE } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class ConditionsHandlerService extends ComplexKeyHandlerService<Conditions> {
  get isConditionsUnsaved(): boolean {
    return this.statusMap[CONDITIONS_TABLE];
  }

  protected _statusMap = {
    [CONDITIONS_TABLE]: false,
  };

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected router: Router) {
    super('conditions/conditions', router, CONDITIONS_ID_FIELDS);
  }
}
