import { Injectable } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { GOSSIP_MENU_OPTION_TABLE, GOSSIP_MENU_TABLE, GossipMenu } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class GossipHandlerService extends HandlerService<GossipMenu> {
  protected readonly mainEditorRoutePath = 'gossip/gossip-menu';

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
}
