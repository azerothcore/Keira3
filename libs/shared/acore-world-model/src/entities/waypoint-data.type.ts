import { TableRow } from '@keira/shared/constants';

/** `waypoint_data`: points of the paths referenced by `creature_addon.path_id` / `creature_template_addon.path_id`. */
export const WAYPOINT_DATA_TABLE = 'waypoint_data';
export const WAYPOINT_DATA_ID = 'id';
export const WAYPOINT_DATA_ID_2 = 'point';
export const WAYPOINT_DATA_SEARCH_FIELDS = [WAYPOINT_DATA_ID, WAYPOINT_DATA_ID_2, 'action', 'move_type', 'delay', 'velocity', 'wpguid'];
/** Paths are usually a creature's guid × 10: custom ones start well above. */
export const WAYPOINT_DATA_CUSTOM_STARTING_ID = 10_000_000;

export class WaypointData extends TableRow {
  id: number = 0;
  point: number = 0;
  position_x: number = 0;
  position_y: number = 0;
  position_z: number = 0;
  /**
   * Where the creature faces on arriving (radians, north 0, south π); NULL (empty): it keeps the way it walked in
   * (the core reads it as `std::optional<float>`).
   */
  orientation: number = null as unknown as number;
  /** Its speed to the point (0: its usual walk / run speed). */
  velocity: number = 0;
  /** How long it waits there (ms). */
  delay: number = 0;
  /** Whether it goes on to the next point without stopping (a smooth spline through them). */
  smoothTransition: number = 0;
  /** 0 walk, 1 run, 2 land, 3 take off (WaypointMoveType). */
  move_type: number = 0;
  /** The `waypoint_scripts` run there (its id; 0: none). */
  action: number = 0;
  /** The chance (%) the action runs. */
  action_chance: number = 100;
  wpguid: number = 0;
}
