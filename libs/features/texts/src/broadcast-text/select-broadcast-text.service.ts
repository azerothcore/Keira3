import { Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import {
  BROADCAST_TEXT_ID,
  BROADCAST_TEXT_NAME,
  BROADCAST_TEXT_SEARCH_FIELDS,
  BROADCAST_TEXT_TABLE,
  BroadcastText,
} from '@keira/shared/acore-world-model';
import { BroadcastTextHandlerService } from './broadcast-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectBroadcastTextService extends SelectService<BroadcastText> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    readonly queryService: MysqlQueryService,
    public handlerService: BroadcastTextHandlerService,
  ) {
    super(queryService, handlerService, BROADCAST_TEXT_TABLE, BROADCAST_TEXT_ID, BROADCAST_TEXT_NAME, BROADCAST_TEXT_SEARCH_FIELDS);
  }
}
