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
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(BroadcastTextHandlerService);
  protected readonly entityTable = BROADCAST_TEXT_TABLE;
  protected readonly entityIdField = BROADCAST_TEXT_ID;
  protected entityNameField = BROADCAST_TEXT_NAME;
  protected readonly fieldList = BROADCAST_TEXT_SEARCH_FIELDS;
  private readonly init = this.init();
}
