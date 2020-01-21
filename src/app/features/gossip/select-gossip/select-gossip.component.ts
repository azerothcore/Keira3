import { Component, } from '@angular/core';

import { SelectComponent } from '@keira-shared/abstract/components/editors/select.component';
import {
  GOSSIP_MENU_CUSTOM_STARTING_ID,
  GOSSIP_MENU_ID,
  GOSSIP_MENU_TABLE,
  GossipMenu
} from '@keira-types/gossip-menu.type';
import { SelectGossipService } from './select-gossip.service';
import { GossipHandlerService } from '../gossip-handler.service';
import { QueryService } from '@keira-shared/services/query.service';

@Component({
  selector: 'app-select-gossip',
  templateUrl: './select-gossip.component.html',
  styleUrls: ['./select-gossip.component.scss']
})
export class SelectGossipComponent extends SelectComponent<GossipMenu> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectGossipService,
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
