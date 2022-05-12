import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import {
  GossipMenuOption,
  GOSSIP_MENU_OPTION_ID,
  GOSSIP_MENU_OPTION_ID_2,
  GOSSIP_MENU_OPTION_TABLE,
} from '@keira-types/gossip-menu-option.type';
import { ToastrService } from 'ngx-toastr';
import { GossipHandlerService } from '../gossip-handler.service';
import { SaveQueryService } from '@keira-shared/services/save-query.service';

@Injectable()
export class GossipMenuOptionService extends MultiRowEditorService<GossipMenuOption> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GossipHandlerService,
    public readonly queryService: MysqlQueryService,
    public readonly saveQueryService: SaveQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      GossipMenuOption,
      GOSSIP_MENU_OPTION_TABLE,
      GOSSIP_MENU_OPTION_ID,
      GOSSIP_MENU_OPTION_ID_2,
      handlerService,
      queryService,
      saveQueryService,
      toastrService,
    );
  }
}
