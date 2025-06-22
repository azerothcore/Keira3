import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  GOSSIP_MENU_OPTION_ID,
  GOSSIP_MENU_OPTION_ID_2,
  GOSSIP_MENU_OPTION_TABLE,
  GossipMenuOption,
} from '@keira/shared/acore-world-model';
import { GossipHandlerService } from '../gossip-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GossipMenuOptionService extends MultiRowEditorService<GossipMenuOption> {
  protected override readonly handlerService = inject(GossipHandlerService);

  constructor() {
    super(GossipMenuOption, GOSSIP_MENU_OPTION_TABLE, GOSSIP_MENU_OPTION_ID, GOSSIP_MENU_OPTION_ID_2);
  }
}
