import { Injectable, inject } from '@angular/core';
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
  override readonly queryService: MysqlQueryService;
  override readonly handlerService: BroadcastTextHandlerService;

  constructor() {
    const queryService = inject(MysqlQueryService);
    const handlerService = inject(BroadcastTextHandlerService);

    super(queryService, handlerService, BROADCAST_TEXT_TABLE, BROADCAST_TEXT_ID, BROADCAST_TEXT_NAME, BROADCAST_TEXT_SEARCH_FIELDS);

    this.queryService = queryService;
    this.handlerService = handlerService;
  }
}
