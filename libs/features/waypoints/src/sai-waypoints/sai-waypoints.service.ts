import { inject, Service } from '@angular/core';
import { SAI_WAYPOINTS_ID, SAI_WAYPOINTS_ID_2, SAI_WAYPOINTS_TABLE, SaiWaypoints } from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { SaiWaypointsHandlerService } from '../sai-waypoints-handler.service';

/** The points of a SmartAI path (`waypoints`), from point 1. */
@Service()
export class SaiWaypointsService extends MultiRowEditorService<SaiWaypoints> {
  protected override readonly handlerService = inject(SaiWaypointsHandlerService);
  protected override readonly _entityClass = SaiWaypoints;
  protected override readonly _entityTable = SAI_WAYPOINTS_TABLE;
  protected override readonly _entityIdField = SAI_WAYPOINTS_ID;
  protected override readonly _entitySecondIdField = SAI_WAYPOINTS_ID_2;
  protected override FIRST_ROW_START_VALUE = 1;

  constructor() {
    super();
    this.init();
  }
}
