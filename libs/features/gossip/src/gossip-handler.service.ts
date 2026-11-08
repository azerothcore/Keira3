import { Service, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { GOSSIP_MENU_OPTION_TABLE, GOSSIP_MENU_TABLE, GossipMenu, GOSSIP_MENU_OPTION_LOCALE_TABLE } from '@keira/shared/acore-world-model';

@Service()
export class GossipHandlerService extends HandlerService<GossipMenu> {
  protected readonly mainEditorRoutePath = 'gossip/gossip-menu';
  protected override readonly copyRoutePath = 'gossip/copy';

  get isGossipMenuTableUnsaved(): Signal<boolean> {
    return this.statusMap[GOSSIP_MENU_TABLE].asReadonly();
  }
  get isGossipMenuOptionTableUnsaved(): Signal<boolean> {
    return this.statusMap[GOSSIP_MENU_OPTION_TABLE].asReadonly();
  }

  get isGossipMenuOptionLocaleUnsaved(): Signal<boolean> {
    return this.statusMap[GOSSIP_MENU_OPTION_LOCALE_TABLE].asReadonly();
  }

  protected _statusMap = {
    [GOSSIP_MENU_TABLE]: signal(false),
    [GOSSIP_MENU_OPTION_TABLE]: signal(false),
    [GOSSIP_MENU_OPTION_LOCALE_TABLE]: signal(false),
  };
}
