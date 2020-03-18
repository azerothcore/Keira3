import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { CONDITIONS_TABLE, CONDITIONS_ID_FIELDS } from '@keira-types/conditions.type';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SingleRowComplexKeyEditorService } from '@keira-abstract/service/editors/single-row-complex-key-editor.service';
import { Conditions } from '@keira-types/conditions.type';
import { ConditionsHandlerService } from '../conditions-handler.service';

@Injectable()
export class ConditionsService extends SingleRowComplexKeyEditorService<Conditions> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ConditionsHandlerService,
    protected queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      Conditions,
      CONDITIONS_TABLE,
      CONDITIONS_ID_FIELDS,
      null,
      true,
      handlerService,
      queryService,
      toastrService,
    );
  }
}
