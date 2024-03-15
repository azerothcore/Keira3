import { Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { GOSSIP_MENU_ID, GOSSIP_MENU_SEARCH_FIELDS, GOSSIP_MENU_TABLE, GossipMenu } from '@keira/shared/acore-world-model';
import { GossipHandlerService } from '../gossip-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectGossipService extends SelectService<GossipMenu> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    readonly queryService: MysqlQueryService,
    public handlerService: GossipHandlerService,
  ) {
    super(queryService, handlerService, GOSSIP_MENU_TABLE, GOSSIP_MENU_ID, null, GOSSIP_MENU_SEARCH_FIELDS);
  }
}
