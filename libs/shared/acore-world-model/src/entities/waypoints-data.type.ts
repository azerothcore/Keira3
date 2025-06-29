import { TableRow } from '@keira/shared/constants';

export const WAYPOINT_DATA_TABLE = 'waypoint_data';
export const WAYPOINT_DATA_ID = 'id';
export const WAYPOINT_DATA_ID_2 = 'point';

export class WaypointData extends TableRow {
  id: number = 0;
  point: number = 0;
  position_x: number = 0;
  position_y: number = 0;
  position_z: number = 0;
  orientation: number = 0;
  delay: number = 0;
  move_type: number = 0;
  action: number = 0;
  action_chance: number = 100;
  wpguid: number = 0;
}
