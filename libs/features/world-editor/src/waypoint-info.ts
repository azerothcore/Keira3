import { SAI_ACTIONS } from '@keira/shared/sai-editor';

/** A step of a `waypoint_scripts` script (the `action` of a waypoint). */
export interface WaypointScriptStep {
  id: number;
  delay: number;
  command: number;
}

/**
 * A SmartAI row reacting to a waypoint (event 108 on `waypoint_data` paths, event 40 on SmartAI paths) or to the end of
 * a path (events 109 and 58).
 */
export interface WaypointSaiRow {
  /** creature entry, or −guid for a single spawn. */
  entryorguid: number;
  /** 0 = any point / path. */
  point: number;
  /** The path (negative for SmartAI paths, see `saiPathId`); 0 = any. */
  pathId: number;
  /** Reacts to SmartAI paths (events 40, 58) rather than `waypoint_data` ones. */
  escort?: boolean;
  /** Reacts to the path ending (events 109, 58) rather than to a point being reached. */
  ended?: boolean;
  actionType: number;
  /** Who the action is done to (SMART_TARGET_*: 1 = itself). */
  targetType?: number;
  comment: string;
}

/** What a creature does at a waypoint, as short lines (empty when it just walks on). */
export interface WaypointDetails {
  delay?: number;
  moveType?: number;
  action?: number;
  actionChance?: number;
}

/** `waypoint_data.move_type`. */
const MOVE_TYPES: Record<number, string> = { 1: 'run', 2: 'land', 3: 'take off' };

/** ScriptCommands of `waypoint_scripts.command` (AzerothCore ScriptMgr.h). */
const SCRIPT_COMMANDS: Record<number, string> = {
  0: 'talk',
  1: 'emote',
  2: 'set field',
  3: 'move to',
  4: 'set flag',
  5: 'remove flag',
  6: 'teleport',
  7: 'quest explored',
  8: 'kill credit',
  9: 'respawn gameobject',
  10: 'summon creature',
  11: 'open door',
  12: 'close door',
  13: 'activate object',
  14: 'remove aura',
  15: 'cast spell',
  16: 'play sound',
  17: 'create item',
  18: 'despawn',
  20: 'load path',
  21: 'call script',
  22: 'kill',
  30: 'turn',
  31: 'equip',
  32: 'change model',
  33: 'close gossip',
  34: 'play movie',
  35: 'movement',
};

const SAI_ACTION_NAMES = Object.fromEntries(
  Object.entries(SAI_ACTIONS)
    .filter(([, value]) => typeof value === 'number')
    .map(([name, value]) => [value as number, name.toLowerCase().replace(/_/g, ' ')]),
) as Record<number, string>;

/**
 * Describes a waypoint: how long the creature waits, how it moves on, the script it runs and the SmartAI rows of the
 * creatures walking the path that react to it.
 */
export function describeWaypoint(
  pathId: number,
  point: number,
  details: WaypointDetails,
  scripts: Map<number, WaypointScriptStep[]>,
  sai: WaypointSaiRow[],
): string[] {
  const lines: string[] = [];
  if (details.delay) {
    lines.push(`wait ${details.delay / 1000} s`);
  }
  const move = MOVE_TYPES[details.moveType ?? 0];
  if (move) {
    lines.push(move);
  }
  if (details.action) {
    const steps = scripts.get(details.action) ?? [];
    const commands = steps.map(
      (step) => `${SCRIPT_COMMANDS[step.command] ?? `command ${step.command}`}${step.delay ? ` (+${step.delay} s)` : ''}`,
    );
    const chance = details.actionChance !== undefined && details.actionChance < 100 ? ` (${details.actionChance}%)` : '';
    lines.push(`script ${details.action}${chance}${commands.length ? `: ${commands.join(', ')}` : ''}`);
  }
  for (const row of sai) {
    const sameKind = !!row.escort === pathId < 0;
    if (sameKind && !row.ended && (row.point === 0 || row.point === point) && (row.pathId === 0 || row.pathId === pathId)) {
      lines.push(`SAI: ${row.comment || SAI_ACTION_NAMES[row.actionType] || `action ${row.actionType}`}`);
    }
  }
  return lines;
}
