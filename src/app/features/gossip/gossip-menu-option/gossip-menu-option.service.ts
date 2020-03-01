import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { MysqlQueryService } from '../../../shared/services/mysql-query.service';
import {
  GOSSIP_MENU_OPTION_ID,
  GOSSIP_MENU_OPTION_ID_2,
  GOSSIP_MENU_OPTION_TABLE,
  GossipMenuOption,
} from '@keira-types/gossip-menu-option.type';
import { GossipHandlerService } from '../gossip-handler.service';

@Injectable()
export class GossipMenuOptionService extends MultiRowEditorService<GossipMenuOption> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GossipHandlerService,
    protected queryService: MysqlQueryService,
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
