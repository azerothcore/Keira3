import { TableRow } from '@keira/shared/constants';

export type SpawnType = 'creature' | 'gameobject';

/** A creature or gameobject spawn as the world editor sees it. */
export interface SpawnRecord {
  type: SpawnType;
  guid: number;
  entry: number;
  name: string;
  map: number;
  x: number;
  y: number;
  z: number;
  o: number;
  /** Waypoint path (creature_addon.path_id, or creature_template_addon.path_id when there is no addon row), 0 if none. */
  pathId: number;
  /** The path comes from creature_template_addon, so it is shared by every creature of this entry. */
  pathFromTemplate?: boolean;
  /** gameobject.rotation0..3 (x, y, z, w quaternion; all 0 = derived from orientation). */
  rotation?: Quaternion;
  /** Model shown in the 3D view (creature_template_model / gameobject_template.displayId), 0 = pin only. */
  displayId?: number;
  /** creature_template_model.DisplayScale or gameobject_template.size. */
  scale?: number;
  /** Creatures that wander (MovementType 1): how far from the spawn point (creature.wander_distance). */
  wanderDistance?: number;
  /** Game event the spawn belongs to (game_event_creature / game_event_gameobject with a positive eventEntry). */
  event?: number;
  /** Invisible trigger or "[DND]" helper (CREATURE_FLAG_EXTRA_TRIGGER, or "Trigger" / "Bunny" / "DND" in its name). */
  trigger?: boolean;
  /** creature.phaseMask / gameobject.phaseMask. */
  phaseMask?: number;
}

/** A quest a creature or gameobject entry starts or ends (creature_queststarter / _questender, gameobject_…). */
export interface SpawnQuest {
  type: SpawnType;
  entry: number;
  quest: number;
  role: 'starts' | 'ends';
  title: string;
}

export type Quaternion = [number, number, number, number];

export interface WaypointRecord {
  pathId: number;
  point: number;
  x: number;
  y: number;
  z: number;
  delay: number;
  /** waypoint_data.move_type: 0 walk, 1 run, 2 land, 3 take off. */
  moveType?: number;
  /** waypoint_scripts id run on arrival (0 = none), and its chance in %. */
  action?: number;
  actionChance?: number;
}

export interface Placement {
  x: number;
  y: number;
  z: number;
  o: number;
}

export type EditorTool = 'select' | 'place-creature' | 'place-gameobject' | 'add-waypoint';

export interface LayerVisibility {
  creatures: boolean;
  gameobjects: boolean;
  waypoints: boolean;
}

/** Rows as returned by the spawn and waypoint queries. */
export interface SpawnRow extends TableRow {
  guid: number;
  entry: number;
  name: string;
  map: number;
  x: number;
  y: number;
  z: number;
  o: number;
  pathId: number;
  pathFromTemplate: number;
  rotation0: number;
  rotation1: number;
  rotation2: number;
  rotation3: number;
  displayId: number;
  scale: number;
  wanderDistance: number;
  movementType: number;
  eventEntry: number;
  isTrigger: number;
  phaseMask: number;
}

export interface WaypointRow extends TableRow {
  pathId: number;
  point: number;
  x: number;
  y: number;
  z: number;
  delay: number;
  moveType: number;
  action: number;
  actionChance: number;
}

export interface TeleRow extends TableRow {
  id: number;
  name: string;
  map: number;
  x: number;
  y: number;
  z: number;
}

export const spawnKey = (type: SpawnType, guid: number): string => `${type}:${guid}`;
export const pathKey = (pathId: number): string => `path:${pathId}`;

export function parseSpawnKey(key: string): { type: SpawnType; guid: number } | undefined {
  const match = /^(creature|gameobject):(\d+)$/.exec(key);
  return match ? { type: match[1] as SpawnType, guid: Number(match[2]) } : undefined;
}

/** Preferred id for a new path: AzerothCore's data conventionally uses `guid * 10`. */
export const preferredPathId = (guid: number): number => guid * 10;

/** Half-size of the square (in yards) around the camera whose spawns are loaded. */
export const SPAWN_LOAD_RADIUS = 450;
export const SPAWN_LOAD_LIMIT = 3000;
