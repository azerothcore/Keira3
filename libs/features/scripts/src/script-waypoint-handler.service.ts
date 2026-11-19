import { Service, signal, Signal } from '@angular/core';
import { SCRIPT_WAYPOINT_TABLE, ScriptWaypoint } from '@keira/shared/acore-world-model';
import { HandlerService } from '@keira/shared/base-abstract-classes';

/** The escort path (`script_waypoint.entry`: a creature entry) being edited. */
@Service()
export class ScriptWaypointHandlerService extends HandlerService<ScriptWaypoint> {
  protected readonly mainEditorRoutePath = 'scripts/script-waypoint';

  get isScriptWaypointTableUnsaved(): Signal<boolean> {
    return this.statusMap[SCRIPT_WAYPOINT_TABLE].asReadonly();
  }

  protected _statusMap = {
    [SCRIPT_WAYPOINT_TABLE]: signal(false),
  };
}
