import { Injectable } from '@angular/core';
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
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override readonly handlerService: GossipHandlerService) {
    super(GossipMenuOption, GOSSIP_MENU_OPTION_TABLE, GOSSIP_MENU_OPTION_ID, GOSSIP_MENU_OPTION_ID_2, handlerService);
  }
}
