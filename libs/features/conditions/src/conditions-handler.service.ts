import { Injectable } from '@angular/core';
import { ComplexKeyHandlerService } from '@keira/shared/base-abstract-classes';
import { Conditions, CONDITIONS_ID_FIELDS, CONDITIONS_TABLE } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class ConditionsHandlerService extends ComplexKeyHandlerService<Conditions> {
  protected readonly mainEditorRoutePath = 'conditions/conditions';
  protected readonly idFields = CONDITIONS_ID_FIELDS;

  get isConditionsUnsaved(): boolean {
    return this.statusMap[CONDITIONS_TABLE];
  }

  protected _statusMap = {
    [CONDITIONS_TABLE]: false,
  };
}
