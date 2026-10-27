import { WorldPosition } from '@keira/shared/wow-data';

export type SpawnKind = 'creature' | 'gameobject';

/** A creature or gameobject shown in the world. `key` must be unique in the scene (e.g. `creature:1234`). */
export interface WorldSpawn {
  key: string;
  kind: SpawnKind;
  guid: number;
  entry: number;
  label: string;
  position: WorldPosition;
  orientation: number;
  /** Spawn not saved to the database yet (drawn translucent). */
  pending?: boolean;
  /** Display id (CreatureDisplayInfo / GameObjectDisplayInfo) to draw the real model; pin only when missing. */
  displayId?: number;
  /** The spawn's own scale (creature_template_model.DisplayScale, gameobject_template.size). */
  scale?: number;
}

export interface WorldWaypoint {
  point: number;
  position: WorldPosition;
  orientation?: number | null;
  delay?: number;
}

/** An ordered path (waypoint_data / waypoints). `key` must be unique in the scene (e.g. `path:12340`). */
export interface WaypointPath {
  key: string;
  label: string;
  points: WorldWaypoint[];
  /** Draws a segment from the last point back to the first. */
  closed?: boolean;
  /** Who walks this path (e.g. creature names), shown when hovering its points. */
  owners?: string[];
}

export type PickResult =
  | { type: 'spawn'; key: string; position: WorldPosition }
  | { type: 'waypoint'; key: string; pathKey: string; point: number; position: WorldPosition }
  /** A path's direction arrow, between two of its points (only with `PickOptions.segments`). */
  | { type: 'segment'; pathKey: string; from: number; to: number; position: WorldPosition }
  | { type: 'ground'; position: WorldPosition };

export interface ObjectMoved {
  key: string;
  position: WorldPosition;
  orientation: number;
}

export type GizmoMode = 'translate' | 'rotate';

export const WAYPOINT_KEY_SEPARATOR = '#';

export function waypointKey(pathKey: string, point: number): string {
  return `${pathKey}${WAYPOINT_KEY_SEPARATOR}${point}`;
}

export function parseWaypointKey(key: string): { pathKey: string; point: number } | undefined {
  const index = key.lastIndexOf(WAYPOINT_KEY_SEPARATOR);
  if (index <= 0) {
    return undefined;
  }
  const point = Number(key.slice(index + 1));
  return Number.isInteger(point) ? { pathKey: key.slice(0, index), point } : undefined;
}
