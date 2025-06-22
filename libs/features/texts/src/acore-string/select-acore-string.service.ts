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
  override readonly queryService: MysqlQueryService;
  override readonly handlerService: AcoreStringHandlerService;

  constructor() {
    const queryService = inject(MysqlQueryService);
    const handlerService = inject(AcoreStringHandlerService);

    super(queryService, handlerService, ACORE_STRING_TABLE, ACORE_STRING_ENTRY, ACORE_STRING_DEFAULT, ACORE_STRING_SEARCH_FIELDS);

    this.queryService = queryService;
    this.handlerService = handlerService;
  }
}
