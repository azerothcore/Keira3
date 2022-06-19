import { Injectable } from '@angular/core';
import { SelectService } from '@keira-abstract/service/select/select.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { GossipMenu, GOSSIP_MENU_ID, GOSSIP_MENU_SEARCH_FIELDS, GOSSIP_MENU_TABLE } from '@keira-types/gossip-menu.type';
import { GossipHandlerService } from '../gossip-handler.service';

@Injectable()
export class SelectGossipService extends SelectService<GossipMenu> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(readonly queryService: MysqlQueryService, public handlerService: GossipHandlerService) {
    super(queryService, handlerService, GOSSIP_MENU_TABLE, GOSSIP_MENU_ID, null, GOSSIP_MENU_SEARCH_FIELDS);
  }
}
