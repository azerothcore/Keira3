import { inject, Service } from '@angular/core';
import {
  WAYPOINT_DATA_ADDON_ID,
  WAYPOINT_DATA_ADDON_ID_2,
  WAYPOINT_DATA_ADDON_ID_3,
  WAYPOINT_DATA_ADDON_TABLE,
  WaypointDataAddon,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { WaypointHandlerService } from '../waypoint-handler.service';

/**
 * The spline points of a path (`waypoint_data_addon`, keyed by point and index). A new one goes after the last
 * spline point of the last point (or of point 1).
 */
@Service()
export class WaypointDataAddonService extends MultiRowEditorService<WaypointDataAddon> {
  protected override readonly handlerService = inject(WaypointHandlerService);
  protected override readonly _entityClass = WaypointDataAddon;
  protected override readonly _entityTable = WAYPOINT_DATA_ADDON_TABLE;
  protected override readonly _entityIdField = WAYPOINT_DATA_ADDON_ID;
  protected override readonly _entitySecondIdField = WAYPOINT_DATA_ADDON_ID_2;
  protected override readonly _entityExtraIdField = WAYPOINT_DATA_ADDON_ID_3;

  constructor() {
    super();
    this.init();
  }

  protected override assignNewRowIds(newRow: WaypointDataAddon): void {
    const point = Math.max(1, ...this._newRows.map((row) => row.PointID));
    newRow.PointID = point;
    newRow.SplinePointIndex = Math.max(-1, ...this._newRows.filter((row) => row.PointID === point).map((row) => row.SplinePointIndex)) + 1;
  }

  /** A copy goes right after its spline point's last one, in the same point. */
  protected override assignDuplicatedRowIds(newRow: WaypointDataAddon): void {
    newRow.SplinePointIndex =
      Math.max(...this._newRows.filter((row) => row.PointID === newRow.PointID).map((row) => row.SplinePointIndex)) + 1;
  }
}
