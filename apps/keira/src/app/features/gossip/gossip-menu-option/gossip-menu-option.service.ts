import { Injectable } from '@angular/core';
import { MultiRowEditorService, MysqlQueryService } from '@keira/shared/core';
import {
  GOSSIP_MENU_OPTION_ID,
  GOSSIP_MENU_OPTION_ID_2,
  GOSSIP_MENU_OPTION_TABLE,
  GossipMenuOption,
} from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { GossipHandlerService } from '../gossip-handler.service';

@Injectable()
export class GossipMenuOptionService extends MultiRowEditorService<GossipMenuOption> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GossipHandlerService,
    readonly queryService: MysqlQueryService,
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
