import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { GOSSIP_MENU_ID, GOSSIP_MENU_SEARCH_FIELDS, GOSSIP_MENU_TABLE, GossipMenu } from '@keira/shared/acore-world-model';
import { GossipHandlerService } from '../gossip-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectGossipService extends SelectService<GossipMenu> {
  override readonly queryService: MysqlQueryService;
  override readonly handlerService: GossipHandlerService;

  constructor() {
    const queryService = inject(MysqlQueryService);
    const handlerService = inject(GossipHandlerService);

    super(queryService, handlerService, GOSSIP_MENU_TABLE, GOSSIP_MENU_ID, null, GOSSIP_MENU_SEARCH_FIELDS);

    this.queryService = queryService;
    this.handlerService = handlerService;
  }
}
