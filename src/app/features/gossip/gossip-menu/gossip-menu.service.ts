import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { GossipMenu, GOSSIP_MENU_ID, GOSSIP_MENU_ID_2, GOSSIP_MENU_TABLE } from '@keira-types/gossip-menu.type';
import { ToastrService } from 'ngx-toastr';
import { GossipHandlerService } from '../gossip-handler.service';

@Injectable()
export class GossipMenuService extends MultiRowEditorService<GossipMenu> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GossipHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(GossipMenu, GOSSIP_MENU_TABLE, GOSSIP_MENU_ID, GOSSIP_MENU_ID_2, handlerService, queryService, toastrService);
  }
}
