import { MmapRecastConfig, TileCoord, WorldPosition } from '@keira/shared/wow-data';

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
  /** Draws a circle of this radius (yards) around the spawn: how far a wandering creature roams. */
  wanderRadius?: number;
  /** More lines shown under the label on hover (event, phase, quests…). */
  details?: string[];
  /** The lines shown instead while Alt is held (e.g. every quest instead of the first one). */
  allDetails?: string[];
}

/** An area trigger (AreaTrigger.dbc): a sphere, or a box when `box` is set. Centred on `position`. */
export interface WorldAreaTrigger {
  key: string;
  label: string;
  position: WorldPosition;
  radius: number;
  box?: { length: number; width: number; height: number; orientation: number };
}

export interface WorldWaypoint {
  point: number;
  position: WorldPosition;
  orientation?: number | null;
  delay?: number;
  /** What happens there (wait, script…), shown when hovering the point. */
  info?: string[];
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
  /** An area trigger's volume (only with `PickOptions.areaTriggers`). */
  | { type: 'areatrigger'; key: string; position: WorldPosition }
  | { type: 'ground'; position: WorldPosition };

/** The navigation mesh tile (mmtile) under the camera target. */
export interface NavMeshTileInfo {
  file: string;
  mapId: number;
  tile: TileCoord;
  /** The recast settings it was generated with; undefined while it loads or when there's no file. */
  config?: MmapRecastConfig;
  /** No mmtile there. */
  missing: boolean;
}

/** A right-click (without dragging) on a spawn or waypoint; `x`/`y` are in pixels from the view's top-left corner. */
export interface ContextRequest {
  key: string;
  x: number;
  y: number;
}

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
