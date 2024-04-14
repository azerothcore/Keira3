import { Injectable } from '@angular/core';
import { SingleRowComplexKeyEditorService } from '@keira/shared/base-abstract-classes';
import { Conditions, CONDITIONS_ID_FIELDS, CONDITIONS_TABLE } from '@keira/shared/acore-world-model';
import { ConditionsHandlerService } from '../conditions-handler.service';

@Injectable({
  providedIn: 'root',
})
export class ConditionsService extends SingleRowComplexKeyEditorService<Conditions> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected handlerService: ConditionsHandlerService) {
    super(Conditions, CONDITIONS_TABLE, CONDITIONS_ID_FIELDS, null, true, handlerService);
  }
}
