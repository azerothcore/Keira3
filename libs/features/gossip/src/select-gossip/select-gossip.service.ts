import { inject, Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { GOSSIP_MENU_ID, GOSSIP_MENU_SEARCH_FIELDS, GOSSIP_MENU_TABLE, GossipMenu } from '@keira/shared/acore-world-model';
import { GossipHandlerService } from '../gossip-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectGossipService extends SelectService<GossipMenu> {
  public readonly handlerService = inject(GossipHandlerService);
  protected readonly entityTable = GOSSIP_MENU_TABLE;
  protected readonly entityIdField = GOSSIP_MENU_ID;
  protected readonly entityNameField = null;
  protected readonly fieldList = GOSSIP_MENU_SEARCH_FIELDS;
}
