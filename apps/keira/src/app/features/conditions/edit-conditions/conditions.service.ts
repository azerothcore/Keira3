import { Injectable } from '@angular/core';
import { SingleRowComplexKeyEditorService } from '@keira-abstract/service/editors/single-row-complex-key-editor.service';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { Conditions, CONDITIONS_ID_FIELDS, CONDITIONS_TABLE } from '@keira/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { ConditionsHandlerService } from '../conditions-handler.service';

@Injectable()
export class ConditionsService extends SingleRowComplexKeyEditorService<Conditions> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ConditionsHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(Conditions, CONDITIONS_TABLE, CONDITIONS_ID_FIELDS, null, true, handlerService, queryService, toastrService);
  }
}
