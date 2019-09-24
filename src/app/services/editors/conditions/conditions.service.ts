import { Injectable } from '@angular/core';

import { CONDITIONS_TABLE, CONDITIONS_ID_FIELDS } from './../../../types/conditions.type';
import { QueryService } from '../../query.service';
import { SingleRowComplexKeyEditorService } from '../single-row-complex-key-editor.service';
import { Conditions } from '../../../types/conditions.type';
import { ConditionsHandlerService } from '../../handlers/conditions-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ConditionsService extends SingleRowComplexKeyEditorService<Conditions> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ConditionsHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      Conditions,
      CONDITIONS_TABLE,
      CONDITIONS_ID_FIELDS,
      null,
      true,
      handlerService,
      queryService,
    );
  }
}
