import { Injectable } from '@angular/core';

import { SelectService } from '@keira-shared/abstract/service/select/select.service';
import {
  GOSSIP_MENU_ID,
  GOSSIP_MENU_SEARCH_FIELDS,
  GOSSIP_MENU_TABLE,
  GossipMenu
} from '@keira-types/gossip-menu.type';
import { QueryService } from '@keira-shared/services/query.service';
import { GossipHandlerService } from '../gossip-handler.service';

@Injectable({
  providedIn: 'root'
})
export class SelectGossipService extends SelectService<GossipMenu> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected queryService: QueryService,
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
