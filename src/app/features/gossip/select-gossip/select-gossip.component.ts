import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from '@keira-abstract/components/editors/select.component';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { GossipMenu, GOSSIP_MENU_CUSTOM_STARTING_ID, GOSSIP_MENU_ID, GOSSIP_MENU_TABLE } from '@keira-types/gossip-menu.type';
import { GossipHandlerService } from '../gossip-handler.service';
import { SelectGossipService } from './select-gossip.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-gossip',
  templateUrl: './select-gossip.component.html',
  styleUrls: ['./select-gossip.component.scss'],
})
export class SelectGossipComponent extends SelectComponent<GossipMenu> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectGossipService,
    public handlerService: GossipHandlerService,
    public queryService: MysqlQueryService,
  ) {
    super(GOSSIP_MENU_TABLE, GOSSIP_MENU_ID, GOSSIP_MENU_CUSTOM_STARTING_ID, selectService, handlerService, queryService);
  }
}
