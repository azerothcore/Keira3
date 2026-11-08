import { WaypointSaiRow, WaypointScriptStep } from './waypoint-info';

/** How a SmartAI script starts a creature on a path (SMART_ACTION_ESCORT_START, START_CLOSEST_WAYPOINT, WAYPOINT_START). */
export interface PathStart {
  /** creature entry, or −guid for a single spawn. */
  owner: number;
  /** The path (negative for SmartAI paths, see `saiPathId`). */
  pathId: number;
  /** Starts over at its first point after the last. */
  repeat: boolean;
  /** Despawns this long (ms) after the last point (escort starts only; 0 = doesn't). */
  despawn: number;
}

/** What a creature does once it reached the last point of its path. */
export interface PathEnding {
  kind: 'loop' | 'stay' | 'despawn' | 'die';
  text: string;
}

/** waypoint_scripts commands ending a creature (AzerothCore ObjectMgr.h ScriptCommands). */
const SCRIPT_DESPAWN_SELF = 18;
const SCRIPT_KILL = 22;
/** SmartAI actions ending a creature: SMART_ACTION_DIE, FORCE_DESPAWN, KILL_UNIT (on itself: SMART_TARGET_SELF). */
const SAI_DIE = 37;
const SAI_FORCE_DESPAWN = 41;
const SAI_KILL_UNIT = 51;
const SAI_TARGET_SELF = 1;

const RESPAWN_NOTE = 'back at its spawn point after its respawn time';
export const LOOP_ENDING: PathEnding = { kind: 'loop', text: 'back to point 1, round after round' };

/**
 * What a creature does at the end of path `pathId` (as AzerothCore plays it): `waypoint_data` paths repeat unless a
 * script started them not to (then it stays at the last point, its new home); SmartAI paths stop at the last point
 * unless started to repeat, and despawn after the despawn time their start gives. A script at the last point (its
 * `waypoint_scripts`, or a SmartAI "waypoint reached" or "path ended" row) that despawns or kills it comes first.
 *
 * `starts` and `sai` are those of the creatures walking it; `last` its last point.
 */
export function pathEnding(
  pathId: number,
  last: { point: number; action?: number },
  starts: PathStart[],
  scripts: Map<number, WaypointScriptStep[]>,
  sai: WaypointSaiRow[],
): PathEnding {
  const smart = pathId < 0;
  const start = starts.find((s) => s.pathId === pathId);
  const repeat = start ? start.repeat : !smart;
  const commands = (last.action ? (scripts.get(last.action) ?? []) : []).map((step) => step.command);
  // (a `waypoint_data` path's "ended" rows only come for a path that doesn't repeat; a SmartAI one's always)
  const rows = sai.filter(
    (row) =>
      !!row.escort === smart &&
      (row.pathId === 0 || row.pathId === pathId) &&
      (row.ended ? (smart || !repeat) && (row.point === 0 || row.point === last.point) : row.point === last.point),
  );
  const actions = rows.map((row) => (row.actionType === SAI_KILL_UNIT && row.targetType === SAI_TARGET_SELF ? SAI_DIE : row.actionType));
  if (commands.includes(SCRIPT_KILL) || actions.includes(SAI_DIE)) {
    return { kind: 'die', text: `dies at the last point (${RESPAWN_NOTE})` };
  }
  if (commands.includes(SCRIPT_DESPAWN_SELF) || actions.includes(SAI_FORCE_DESPAWN)) {
    return { kind: 'despawn', text: `despawns at the last point (${RESPAWN_NOTE})` };
  }
  if (repeat) {
    return LOOP_ENDING;
  }
  if (start?.despawn) {
    return { kind: 'despawn', text: `despawns ${start.despawn / 1000} s after the last point (${RESPAWN_NOTE})` };
  }
  return { kind: 'stay', text: smart ? 'stops at the last point' : 'stops at the last point (its new home)' };
}
