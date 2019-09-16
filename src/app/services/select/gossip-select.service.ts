import { Injectable } from '@angular/core';

import { SelectService } from './select.service';
import {
  GOSSIP_MENU_ID,
  GOSSIP_MENU_SEARCH_FIELDS,
  GOSSIP_MENU_TABLE,
  GossipMenu
} from '../../types/gossip-menu.type';
import { QueryService } from '../query.service';
import { GossipHandlerService } from '../handlers/gossip-handler.service';

@Injectable({
  providedIn: 'root'
})
export class GossipSelectService extends SelectService<GossipMenu> {
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
