import { Service, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { WAYPOINT_SCRIPTS_TABLE, WaypointScripts } from '@keira/shared/acore-world-model';

/** The waypoint action (`waypoint_scripts.id`) being edited. */
@Service()
export class WaypointScriptsHandlerService extends HandlerService<WaypointScripts> {
  protected readonly mainEditorRoutePath = 'waypoints/waypoint-scripts';

  get isWaypointScriptsTableUnsaved(): Signal<boolean> {
    return this.statusMap[WAYPOINT_SCRIPTS_TABLE].asReadonly();
  }

  protected _statusMap = {
    [WAYPOINT_SCRIPTS_TABLE]: signal(false),
  };
}
