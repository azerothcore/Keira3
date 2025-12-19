import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { GOSSIP_MENU_OPTION_TABLE, GOSSIP_MENU_TABLE, GossipMenu } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class GossipHandlerService extends HandlerService<GossipMenu> {
  protected readonly mainEditorRoutePath = 'gossip/gossip-menu';
  protected readonly copyRoutePath = 'gossip/copy';

  get isGossipMenuTableUnsaved(): Signal<boolean> {
    return this.statusMap[GOSSIP_MENU_TABLE].asReadonly();
  }
  get isGossipMenuOptionTableUnsaved(): Signal<boolean> {
    return this.statusMap[GOSSIP_MENU_OPTION_TABLE].asReadonly();
  }

  protected _statusMap = {
    [GOSSIP_MENU_TABLE]: signal(false),
    [GOSSIP_MENU_OPTION_TABLE]: signal(false),
  };

  override select(isNew: boolean, id: string | number | Partial<GossipMenu>, name?: string, navigate = true, sourceId?: string) {
    // If we're creating a new entity from a copy, navigate to copy route
    if (isNew && sourceId) {
      super.select(isNew, id, name, false, sourceId);
      this.router.navigate([this.copyRoutePath]);
    } else {
      super.select(isNew, id, name, navigate);
    }
  }
}
