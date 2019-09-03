import { Injectable } from '@angular/core';

import { MultiRowEditorService } from '../multi-row-editor.service';
import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';
import {
  GOSSIP_MENU_ID,
  GOSSIP_MENU_ID_2,
  GOSSIP_MENU_TABLE,
  GossipMenu,
} from '../../../types/gossip-menu.type';

@Injectable({
  providedIn: 'root'
})
export class GossipMenuService extends MultiRowEditorService<GossipMenu> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      GossipMenu,
      GOSSIP_MENU_TABLE,
      GOSSIP_MENU_ID,
      GOSSIP_MENU_ID_2,
      handlerService,
      queryService,
    );
  }
}
