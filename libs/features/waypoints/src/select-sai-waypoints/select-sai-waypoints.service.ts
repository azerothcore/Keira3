import { inject, Service } from '@angular/core';
import { SAI_WAYPOINTS_ID, SAI_WAYPOINTS_SEARCH_FIELDS, SAI_WAYPOINTS_TABLE, SaiWaypoints } from '@keira/shared/acore-world-model';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SaiWaypointsHandlerService } from '../sai-waypoints-handler.service';

/** The SmartAI paths of `waypoints`, one row each. */
@Service()
export class SelectSaiWaypointsService extends SelectService<SaiWaypoints> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(SaiWaypointsHandlerService);
  protected override readonly entityTable = SAI_WAYPOINTS_TABLE;
  protected override readonly entityIdField = SAI_WAYPOINTS_ID;
  protected override entityNameField = null;
  protected override readonly fieldList = SAI_WAYPOINTS_SEARCH_FIELDS as (keyof SaiWaypoints & string)[];
  protected override readonly selectFields = ['entry'];
  protected override readonly groupFields = ['entry'];

  constructor() {
    super();
    this.init();
  }
}
