import { BoundaryShape, MmapRecastConfig, TileCoord, WorldPosition } from '@keira/shared/wow-data';

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
  /** Draws its bounding radius (green) and combat reach (red) as circles (yards). */
  bounds?: { radius: number; reach: number };
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

/** A creature walking its path (or wandering) in the movement simulation: from `start`, leg by leg, over and over. */
export interface MovementSimulation {
  key: string;
  start: WorldPosition;
  legs: SimulationLeg[];
  /** Time runs this many times faster. */
  rate: number;
}

export interface SimulationLeg {
  to: WorldPosition;
  /** Yards per second. */
  speed: number;
  /** Seconds waited on arrival. */
  wait: number;
  /** Straight through the air (flying) rather than along the navigation mesh. */
  fly?: boolean;
  /** Shown while on this leg (e.g. "point 3"). */
  label: string;
}

/** A line drawn between two places (a formation member to its leader, a teleport to where it leads…). */
export interface WorldLink {
  key: string;
  from: WorldPosition;
  to: WorldPosition;
  color: number;
  /** An arrow head at `to`. */
  arrow?: boolean;
  dashed?: boolean;
  /** Points the line goes through between `from` and `to` (a flight path). */
  via?: WorldPosition[];
  /**
   * Named on hover: then each stretch gets an arrow in the middle (triangular pyramids for lines with `via`, the
   * flight paths) that tells which way it goes.
   */
  label?: string;
}

/**
 * A boss boundary (AreaBoundary shapes of the instance scripts): its flat shapes drawn on the ground as outlines with a
 * see-through fill (red and dashed for the shapes that keep the boss out), at `z` or at the heights of its height
 * ranges; named on hover.
 */
export interface WorldBoundary {
  key: string;
  label: string;
  color: number;
  z: number;
  shapes: BoundaryShape[];
}

/** A labelled place (graveyard, flight master, pool label…): a diamond on a stick, named on hover. */
export interface WorldMarker {
  key: string;
  position: WorldPosition;
  color: number;
  label: string;
}

/**
 * Where a waypoint is: on the ground, in the air (a few yards above the floor), in a liquid (swimming), or under the
 * map (no floor below it, only ground above).
 */
export type WaypointPlace = 'ground' | 'air' | 'water' | 'under';

/** "Check path": checks the points of a path (every time they change while it's set). */
export interface WaypointCheckRequest {
  pathKey: string;
  points: { point: number; position: WorldPosition }[];
}

/** ok: walkable and reachable; warn: may cause issues (off the mesh, inside something, a long detour); bad: not walkable or not reachable. */
export type WaypointCheckStatus = 'ok' | 'warn' | 'bad';

export interface WaypointCheck {
  /** Waypoint key (`waypointKey(pathKey, point)`). */
  key: string;
  point: number;
  place: WaypointPlace;
  status: WaypointCheckStatus;
  /** Translation key of the (worst) finding, and its parameters. */
  reason: string;
  params?: Record<string, number>;
}

/** A click (or hover) in the view; `additive` when Ctrl (⌘) was held, to add to a selection. */
export type PickResult = PickTarget & { additive?: boolean };

export type PickTarget =
  | { type: 'spawn'; key: string; position: WorldPosition }
  | { type: 'waypoint'; key: string; pathKey: string; point: number; position: WorldPosition }
  /** A path's direction arrow, between two of its points (only with `PickOptions.segments`). */
  | { type: 'segment'; pathKey: string; from: number; to: number; position: WorldPosition }
  /** A marker, or an arrow of a labelled link with the way it points (only with `PickOptions.overlays`). */
  | { type: 'overlay'; key: string; position: WorldPosition; direction?: number }
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

/** A navigation mesh tile to rebuild from the client files with other settings, drawn over the real one. */
export interface NavMeshRebuildRequest {
  tile: TileCoord;
  config: MmapRecastConfig;
}

/** How a rebuild is going: reading the client files, building (sub-tiles done of all), done or failed. */
export interface NavMeshRebuildState {
  status: 'reading' | 'building' | 'done' | 'failed';
  done: number;
  total: number;
  /** Triangles of the rebuilt tile, once done. */
  triangles: number;
  /** What it was rebuilt from, once done: the server's maps and vmaps, or the client's files. */
  source?: 'server' | 'client';
}

/** A right-click (without dragging) on a spawn or waypoint; `x`/`y` are in pixels from the view's top-left corner. */
/** The key of a right-click on the ground (or a building) rather than on something placed. */
export const GROUND_KEY = 'ground';

export interface ContextRequest {
  /** What was right-clicked: a spawn or waypoint key, or a path stretch, area trigger, marker or link. */
  key: string;
  x: number;
  y: number;
  /** Its hover text, and where it was clicked. */
  label?: string;
  position?: WorldPosition;
  /** Where the player marker (Space) is, when placed. */
  marker?: WorldPosition;
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
