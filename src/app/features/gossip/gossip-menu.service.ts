import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { CreatureHandlerService } from '../creature/creature-handler.service';
import { QueryService } from '../../shared/services/query.service';
import {
  GOSSIP_MENU_ID,
  GOSSIP_MENU_ID_2,
  GOSSIP_MENU_TABLE,
  GossipMenu,
} from '@keira-types/gossip-menu.type';

@Injectable({
  providedIn: 'root'
})
export class GossipMenuService extends MultiRowEditorService<GossipMenu> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      GossipMenu,
      GOSSIP_MENU_TABLE,
      GOSSIP_MENU_ID,
      GOSSIP_MENU_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}
