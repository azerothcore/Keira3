import { Component, } from '@angular/core';

import { SelectComponent } from '../../shared/select.component';
import {
  GOSSIP_MENU_CUSTOM_STARTING_ID,
  GOSSIP_MENU_ID,
  GOSSIP_MENU_TABLE,
  GossipMenu
} from '../../../../types/gossip-menu.type';
import { GossipSelectService } from '../../../../services/select/gossip-select.service';
import { GossipHandlerService } from '../../../../services/handlers/gossip-handler.service';
import { QueryService } from '../../../../services/query.service';

@Component({
  selector: 'app-select-gossip',
  templateUrl: './select-gossip.component.html',
  styleUrls: ['./select-gossip.component.scss']
})
export class SelectGossipComponent extends SelectComponent<GossipMenu> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: GossipSelectService,
    public handlerService: GossipHandlerService,
    public queryService: QueryService,
  ) {
    super(
      GOSSIP_MENU_TABLE,
      GOSSIP_MENU_ID,
      GOSSIP_MENU_CUSTOM_STARTING_ID,
      selectService,
      handlerService,
      queryService,
    );
  }
}
