import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { GOSSIP_MENU_OPTION_TABLE, GOSSIP_MENU_TABLE, GossipMenu } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class GossipHandlerService extends HandlerService<GossipMenu> {
  get isGossipMenuTableUnsaved(): boolean {
    return this.statusMap[GOSSIP_MENU_TABLE];
  }
  get isGossipMenuOptionTableUnsaved(): boolean {
    return this.statusMap[GOSSIP_MENU_OPTION_TABLE];
  }

  protected _statusMap = {
    [GOSSIP_MENU_TABLE]: false,
    [GOSSIP_MENU_OPTION_TABLE]: false,
  };

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected router: Router) {
    super('gossip/gossip-menu', router);
  }
}
