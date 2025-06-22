import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import {
  ACORE_STRING_DEFAULT,
  ACORE_STRING_ENTRY,
  ACORE_STRING_SEARCH_FIELDS,
  ACORE_STRING_TABLE,
  AcoreString,
} from '@keira/shared/acore-world-model';
import { AcoreStringHandlerService } from './acore-string-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectAcoreStringService extends SelectService<AcoreString> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(AcoreStringHandlerService);
  protected override readonly entityTable = ACORE_STRING_TABLE;
  protected override readonly entityIdField = ACORE_STRING_ENTRY;
  protected override entityNameField = ACORE_STRING_DEFAULT;
  protected override readonly fieldList = ACORE_STRING_SEARCH_FIELDS;
  constructor() {
    super();
    this.init();
  }
}
