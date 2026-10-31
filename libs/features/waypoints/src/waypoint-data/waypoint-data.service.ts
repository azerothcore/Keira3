import { inject, Service } from '@angular/core';
import { WAYPOINT_DATA_ID, WAYPOINT_DATA_ID_2, WAYPOINT_DATA_TABLE, WaypointData } from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { WaypointHandlerService } from '../waypoint-handler.service';

/** The points of a path (`waypoint_data`), by point number. */
@Service()
export class WaypointDataService extends MultiRowEditorService<WaypointData> {
  protected override readonly handlerService = inject(WaypointHandlerService);
  protected override readonly _entityClass = WaypointData;
  protected override readonly _entityTable = WAYPOINT_DATA_TABLE;
  protected override readonly _entityIdField = WAYPOINT_DATA_ID;
  protected override readonly _entitySecondIdField = WAYPOINT_DATA_ID_2;
  /** (paths start at point 1) */
  protected override FIRST_ROW_START_VALUE = 1;

  constructor() {
    super();
    this.init();
  }
}
