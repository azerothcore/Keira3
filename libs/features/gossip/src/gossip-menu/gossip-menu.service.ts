import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GOSSIP_MENU_ID, GOSSIP_MENU_ID_2, GOSSIP_MENU_TABLE, GossipMenu } from '@keira/shared/acore-world-model';
import { GossipHandlerService } from '../gossip-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GossipMenuService extends MultiRowEditorService<GossipMenu> {
  protected override readonly handlerService = inject(GossipHandlerService);
  protected override readonly _entityClass = GossipMenu;
  protected override readonly _entityTable = GOSSIP_MENU_TABLE;
  protected override readonly _entityIdField = GOSSIP_MENU_ID;
  protected override readonly _entitySecondIdField = GOSSIP_MENU_ID_2;

  constructor() {
    super();
    this.init();
  }
}
