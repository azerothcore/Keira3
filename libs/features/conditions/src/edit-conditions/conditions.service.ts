import { Injectable, inject } from '@angular/core';
import { SingleRowComplexKeyEditorService } from '@keira/shared/base-abstract-classes';
import { Conditions, CONDITIONS_ID_FIELDS, CONDITIONS_TABLE } from '@keira/shared/acore-world-model';
import { ConditionsHandlerService } from '../conditions-handler.service';

@Injectable({
  providedIn: 'root',
})
export class ConditionsService extends SingleRowComplexKeyEditorService<Conditions> {
  protected override readonly handlerService = inject(ConditionsHandlerService);
  protected override _entityClass = Conditions;
  protected override _entityTable = CONDITIONS_TABLE;
  protected override _entityIdField = JSON.stringify(CONDITIONS_ID_FIELDS);
  protected override _entityNameField = null;
  protected override isMainEntity = true;

  constructor() {
    super();
    this.init();
  }
}
