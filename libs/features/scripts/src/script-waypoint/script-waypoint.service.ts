import { inject, Service } from '@angular/core';
import { SCRIPT_WAYPOINT_ID, SCRIPT_WAYPOINT_ID_2, SCRIPT_WAYPOINT_TABLE, ScriptWaypoint } from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { ScriptWaypointHandlerService } from '../script-waypoint-handler.service';

/** The points of an escort path (`script_waypoint`), from point 1. */
@Service()
export class ScriptWaypointService extends MultiRowEditorService<ScriptWaypoint> {
  protected override readonly handlerService = inject(ScriptWaypointHandlerService);
  protected override readonly _entityClass = ScriptWaypoint;
  protected override readonly _entityTable = SCRIPT_WAYPOINT_TABLE;
  protected override readonly _entityIdField = SCRIPT_WAYPOINT_ID;
  protected override readonly _entitySecondIdField = SCRIPT_WAYPOINT_ID_2;
  protected override FIRST_ROW_START_VALUE = 1;

  constructor() {
    super();
    this.init();
  }
}
