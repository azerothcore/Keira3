import { Service, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { WAYPOINT_DATA_TABLE, WaypointData } from '@keira/shared/acore-world-model';

/** The path (`waypoint_data.id`) being edited. */
@Service()
export class WaypointHandlerService extends HandlerService<WaypointData> {
  protected readonly mainEditorRoutePath = 'waypoints/waypoint-data';

  get isWaypointDataTableUnsaved(): Signal<boolean> {
    return this.statusMap[WAYPOINT_DATA_TABLE].asReadonly();
  }

  protected _statusMap = {
    [WAYPOINT_DATA_TABLE]: signal(false),
  };
}
