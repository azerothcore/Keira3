import { Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import {
  ACORE_STRING_DEFAULT,
  ACORE_STRING_ENTRY,
  ACORE_STRING_SEARCH_FIELDS,
  ACORE_STRING_TABLE,
  AcoreString,
} from '@keira/shared/acore-world-model';
import { AcoreTextHandlerService } from './acore-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectAcoreTextService extends SelectService<AcoreString> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    override readonly queryService: MysqlQueryService,
    public override readonly handlerService: AcoreTextHandlerService,
  ) {
    super(queryService, handlerService, ACORE_STRING_TABLE, ACORE_STRING_ENTRY, ACORE_STRING_DEFAULT, ACORE_STRING_SEARCH_FIELDS);
  }
}
