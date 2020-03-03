import { Injectable } from '@angular/core';

import { SelectService } from '@keira-abstract/service/select/select.service';
import {
  GOSSIP_MENU_ID,
  GOSSIP_MENU_SEARCH_FIELDS,
  GOSSIP_MENU_TABLE,
  GossipMenu
} from '@keira-types/gossip-menu.type';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { GossipHandlerService } from '../gossip-handler.service';

@Injectable()
export class SelectGossipService extends SelectService<GossipMenu> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected queryService: MysqlQueryService,
    public handlerService: GossipHandlerService,
  ) {
    super(
      queryService,
      handlerService,
      GOSSIP_MENU_TABLE,
      GOSSIP_MENU_ID,
      null,
      GOSSIP_MENU_SEARCH_FIELDS,
    );
  }
}
