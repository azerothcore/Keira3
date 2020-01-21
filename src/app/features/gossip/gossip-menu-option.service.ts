import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowEditorService } from '../../shared/abstract/service/editors/multi-row-editor.service';
import { CreatureHandlerService } from '../creature/creature-handler.service';
import { QueryService } from '../../shared/services/query.service';
import {
  GOSSIP_MENU_OPTION_ID,
  GOSSIP_MENU_OPTION_ID_2,
  GOSSIP_MENU_OPTION_TABLE,
  GossipMenuOption,
} from '@keira-types/gossip-menu-option.type';

@Injectable({
  providedIn: 'root'
})
export class GossipMenuOptionService extends MultiRowEditorService<GossipMenuOption> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      GossipMenuOption,
      GOSSIP_MENU_OPTION_TABLE,
      GOSSIP_MENU_OPTION_ID,
      GOSSIP_MENU_OPTION_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}
