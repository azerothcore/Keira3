import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { GOSSIP_MENU_ID, GOSSIP_MENU_SEARCH_FIELDS, GOSSIP_MENU_TABLE, GossipMenu } from '@keira/shared/acore-world-model';
import { GossipHandlerService } from '../gossip-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectGossipService extends SelectService<GossipMenu> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(GossipHandlerService);
  protected override readonly entityTable = GOSSIP_MENU_TABLE;
  protected override readonly entityIdField = GOSSIP_MENU_ID;
  protected override entityNameField = null;
  protected override readonly fieldList = GOSSIP_MENU_SEARCH_FIELDS;
  constructor() {
    super();
    this.init();
  }
}
