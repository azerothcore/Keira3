import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GOSSIP_MENU_ID, GOSSIP_MENU_ID_2, GOSSIP_MENU_TABLE, GossipMenu } from '@keira/shared/acore-world-model';
import { GossipHandlerService } from '../gossip-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GossipMenuService extends MultiRowEditorService<GossipMenu> {
  protected override readonly handlerService = inject(GossipHandlerService);

  constructor() {
    super(GossipMenu, GOSSIP_MENU_TABLE, GOSSIP_MENU_ID, GOSSIP_MENU_ID_2);
  }
}
