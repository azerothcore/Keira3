import { TableRow } from '@keira/shared/constants';

/** `waypoint_scripts`: the steps of the actions run at waypoints (`waypoint_data.action`). */
export const WAYPOINT_SCRIPTS_TABLE = 'waypoint_scripts';
export const WAYPOINT_SCRIPTS_ID = 'id';
export const WAYPOINT_SCRIPTS_ID_2 = 'guid';
export const WAYPOINT_SCRIPTS_SEARCH_FIELDS = [WAYPOINT_SCRIPTS_ID];
export const WAYPOINT_SCRIPTS_CUSTOM_STARTING_ID = 10_000;

export class WaypointScripts extends TableRow {
  id: number = 0;
  /** When the step runs, after reaching the point (seconds). */
  delay: number = 0;
  /** What it does (ScriptCommands). */
  command: number = 0;
  datalong: number = 0;
  datalong2: number = 0;
  dataint: number = 0;
  x: number = 0;
  y: number = 0;
  z: number = 0;
  o: number = 0;
  /** The step's own unique id. */
  guid: number = 0;
}
