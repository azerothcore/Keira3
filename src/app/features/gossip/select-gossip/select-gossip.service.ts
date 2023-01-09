import { Injectable } from '@angular/core';
import { SelectService } from '@keira-abstract/service/select/select.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { GossipMenu, GOSSIP_MENU_ID, GOSSIP_MENU_SEARCH_FIELDS, GOSSIP_MENU_TABLE } from '@keira-types/gossip-menu.type';
import { GossipHandlerService } from '../gossip-handler.service';

@Injectable()
export class SelectGossipService extends SelectService<GossipMenu> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(readonly queryService: MysqlQueryService, public handlerService: GossipHandlerService) {
    super(queryService, handlerService, GOSSIP_MENU_TABLE, GOSSIP_MENU_ID, null, GOSSIP_MENU_SEARCH_FIELDS);
  }

  onSearch(): void {
    console.log(this.queryForm.getRawValue().fields);
    const {
      limit,
      fields: { MenuID, TextID, text0_0, text0_1 },
    } = this.queryForm.getRawValue();

    this.subscriptions.push(
      this.queryService
        .query<GossipMenu>(
          "SELECT * FROM `gossip_menu` WHERE (`MenuID` LIKE '%" +
            (MenuID ?? '') +
            "%') AND (`TextID` LIKE '%" +
            (TextID ?? '') +
            "%') AND `TextID` IN (SELECT  `ID` FROM `npc_text` WHERE `text0_0` LIKE '%" +
            (text0_0 ?? '') +
            "%' AND `text0_1` LIKE '%" +
            (text0_1 ?? '') +
            "%') LIMIT " +
            (limit ?? 50) +
            ';',
        )
        .subscribe((data) => {
          this.rows = data;
        }),
    );
  }
}
