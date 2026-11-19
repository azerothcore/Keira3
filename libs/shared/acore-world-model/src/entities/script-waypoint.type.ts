import { TableRow } from '@keira/shared/constants';

/** `script_waypoint`: the paths of the C++ escort scripts (npc_escortAI), by creature entry. */
export const SCRIPT_WAYPOINT_TABLE = 'script_waypoint';
export const SCRIPT_WAYPOINT_ID = 'entry';
export const SCRIPT_WAYPOINT_ID_2 = 'pointid';
export const SCRIPT_WAYPOINT_SEARCH_FIELDS = [SCRIPT_WAYPOINT_ID, SCRIPT_WAYPOINT_ID_2, 'waittime', 'point_comment'];

export class ScriptWaypoint extends TableRow {
  /** The creature (`creature_template.entry`) walking it. */
  entry: number = 0;
  pointid: number = 0;
  location_x: number = 0;
  location_y: number = 0;
  location_z: number = 0;
  /** How long it waits there (ms). */
  waittime: number = 0;
  point_comment: string = '';
}
