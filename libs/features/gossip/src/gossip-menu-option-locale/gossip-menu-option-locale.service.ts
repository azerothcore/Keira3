import { inject, Service } from '@angular/core';
import {
  GOSSIP_MENU_OPTION_LOCALE_ID,
  GOSSIP_MENU_OPTION_LOCALE_ID_2,
  GOSSIP_MENU_OPTION_LOCALE_ID_3,
  GOSSIP_MENU_OPTION_LOCALE_TABLE,
  GossipMenuOptionLocale,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GossipHandlerService } from '../gossip-handler.service';

/** The translations of the selected entry's options, one row per locale (#144). */
@Service()
export class GossipMenuOptionLocaleService extends MultiRowEditorService<GossipMenuOptionLocale> {
  protected override readonly handlerService = inject(GossipHandlerService);
  protected override readonly _entityClass = GossipMenuOptionLocale;
  protected override readonly _entityTable = GOSSIP_MENU_OPTION_LOCALE_TABLE;
  protected override readonly _entityIdField = GOSSIP_MENU_OPTION_LOCALE_ID;
  protected override readonly _entitySecondIdField = GOSSIP_MENU_OPTION_LOCALE_ID_2;
  protected override readonly _entityExtraIdField = GOSSIP_MENU_OPTION_LOCALE_ID_3;

  constructor() {
    super();
    this.init();
  }
}
