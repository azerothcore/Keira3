import { TableRow } from '@keira/shared/constants';

/** `waypoints`: the paths SmartAI walks creatures on (SMART_ACTION_WP_START, its param2 the `entry`). */
export const SAI_WAYPOINTS_TABLE = 'waypoints';
export const SAI_WAYPOINTS_ID = 'entry';
export const SAI_WAYPOINTS_ID_2 = 'pointid';
export const SAI_WAYPOINTS_SEARCH_FIELDS = [SAI_WAYPOINTS_ID, SAI_WAYPOINTS_ID_2, 'delay', 'point_comment'];
export const SAI_WAYPOINTS_CUSTOM_STARTING_ID = 1_000_000;

export class SaiWaypoints extends TableRow {
  entry: number = 0;
  pointid: number = 0;
  position_x: number = 0;
  position_y: number = 0;
  position_z: number = 0;
  /** Where the creature faces on arriving; NULL (empty): the way it walked in. */
  orientation: number = null as unknown as number;
  /** How long it waits there (ms). */
  delay: number = 0;
  point_comment: string = '';
}

/** `waypoint_data_addon`: the spline points between a path's point and the one before (smooth curves). */
export const WAYPOINT_DATA_ADDON_TABLE = 'waypoint_data_addon';
export const WAYPOINT_DATA_ADDON_ID = 'PathID';
export const WAYPOINT_DATA_ADDON_ID_2 = 'PointID';
export const WAYPOINT_DATA_ADDON_ID_3 = 'SplinePointIndex';

export class WaypointDataAddon extends TableRow {
  PathID: number = 0;
  PointID: number = 0;
  SplinePointIndex: number = 0;
  PositionX: number = 0;
  PositionY: number = 0;
  PositionZ: number = 0;
}
