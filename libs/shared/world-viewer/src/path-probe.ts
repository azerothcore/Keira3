import { NavGraph, pathLength, tileKey, worldToTile, WorldPosition } from '@keira/shared/wow-data';
import { NavMeshSource } from './world-navmesh';
import { WorldScene } from './world-scene';
import { WaypointCheck, WaypointCheckRequest, WaypointCheckStatus, waypointKey } from './world-viewer.model';

/** The Path / LOS tool's question: from A to C, with an attack range and the eye height of both. */
export interface PathProbeRequest {
  from: WorldPosition;
  to?: WorldPosition;
  /** Yards from which the attacker can hit C (melee ≈ 5, spells and bows 30–40). */
  range: number;
  /** Eye height above the ground, for the line of sight. */
  height: number;
}

export interface PathProbeResult {
  from: WorldPosition;
  to?: WorldPosition;
  /** No navigation mesh (mmaps) around A or C. */
  noNavMesh?: boolean;
  /** A and C too far apart to load the navigation mesh between them. */
  tooFar?: boolean;
  /** The walking path from A to C on the navigation mesh, when there is one. */
  path?: WorldPosition[];
  length?: number;
  /** Where the line of sight from A to C is first blocked; undefined when A sees C. */
  blockedAt?: WorldPosition;
  /** The first point along the way (A itself if it can already) within range of C and seeing it. */
  attackFrom?: WorldPosition;
  attackDistance?: number;
  /** How far the attacker walks to get there. */
  walkToAttack?: number;
}

/** Tiles of navigation mesh loaded at most for one probe (A and C at most ~5 tiles apart). */
export const MAX_PROBE_TILES = 49;
/** Step (yards) of the search for an attack position along the path. */
const ATTACK_STEP = 1;
/** A ground waypoint this close (yards, in height) to the navigation mesh stands on it. */
const ON_MESH_HEIGHT = 2;
/** Clear space a creature needs above a waypoint (yards): less means it's inside or under something. */
const HEAD_ROOM = 2;
/** A walk this many times longer than the straight line (and 10+ yards longer) is a detour worth flagging. */
const DETOUR_RATIO = 2.5;
const SEVERITY: Record<WaypointCheckStatus, number> = { ok: 0, warn: 1, bad: 2 };

const distance = (a: WorldPosition, b: WorldPosition): number => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/** Answers Path / LOS questions on the navigation mesh and the collision loaded in a scene. */
export class PathProber {
  private graph?: { key: string; graph: NavGraph };

  constructor(
    private readonly source: NavMeshSource,
    private readonly world: WorldScene,
  ) {}

  async probe(directory: string, request: PathProbeRequest): Promise<PathProbeResult> {
    const { from, to } = request;
    if (!to) {
      return { from };
    }
    const eye = (p: WorldPosition): WorldPosition => ({ ...p, z: p.z + request.height });
    const sees = (p: WorldPosition): boolean => !this.world.lineOfSightBlock(eye(p), eye(to));
    const result: PathProbeResult = { from, to, blockedAt: this.world.lineOfSightBlock(eye(from), eye(to)) };
    if (!result.blockedAt && distance(from, to) <= request.range) {
      return {
        ...result,
        attackFrom: from,
        attackDistance: distance(from, to),
        walkToAttack: 0,
        ...(await this.walk(directory, from, to)),
      };
    }
    const walk = await this.walk(directory, from, to);
    Object.assign(result, walk);
    if (walk.path) {
      // along the path, the first point in range that sees C
      let walked = 0;
      for (let i = 0; i + 1 < walk.path.length; i++) {
        const [a, b] = [walk.path[i], walk.path[i + 1]];
        const segment = distance(a, b);
        for (let d = 0; d <= segment; d += ATTACK_STEP) {
          const t = d / Math.max(segment, 1e-6);
          const point = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
          if (distance(point, to) <= request.range && sees(point)) {
            return { ...result, attackFrom: point, attackDistance: distance(point, to), walkToAttack: walked + d };
          }
        }
        walked += segment;
      }
    }
    return result;
  }

  /**
   * Checks the points of a waypoint path, each against the previous one. On the ground: standing on the navigation
   * mesh (else off it, or not walkable at all), with room above it, and reachable from the previous point without a big
   * detour. In the air or in water (flying, swimming): a clear line from the previous point.
   */
  async checkPath(directory: string, request: WaypointCheckRequest): Promise<WaypointCheck[]> {
    const checks: WaypointCheck[] = [];
    for (let i = 0; i < request.points.length; i++) {
      const { point, position } = request.points[i];
      const previous = request.points[i - 1];
      const place = this.world.waypointPlace(position);
      const findings: { status: WaypointCheckStatus; reason: string; params?: Record<string, number> }[] = [];
      if (place === 'ground') {
        const graph = await this.graphFor(directory, previous?.position ?? position, position);
        if (!graph || graph === 'tooFar') {
          findings.push({ status: 'warn', reason: 'WORLD_EDITOR.CHECK_NO_NAVMESH' });
        } else {
          const surface = graph.surfaceAt(position);
          if (surface === undefined || Math.abs(surface - position.z) > ON_MESH_HEIGHT) {
            findings.push(
              graph.locate(position) === undefined
                ? { status: 'bad', reason: 'WORLD_EDITOR.CHECK_NOT_WALKABLE' }
                : { status: 'warn', reason: 'WORLD_EDITOR.CHECK_OFF_MESH' },
            );
          }
          if (previous && this.world.waypointPlace(previous.position) === 'ground') {
            const path = graph.findPath(previous.position, position);
            const straight = distance(previous.position, position);
            if (!path) {
              findings.push({ status: 'bad', reason: 'WORLD_EDITOR.CHECK_UNREACHABLE', params: { from: previous.point } });
            } else {
              const walked = pathLength(path);
              if (walked > straight * DETOUR_RATIO && walked - straight > 10) {
                findings.push({
                  status: 'warn',
                  reason: 'WORLD_EDITOR.CHECK_DETOUR',
                  params: { from: previous.point, walked: Math.round(walked), straight: Math.round(straight) },
                });
              }
            }
          }
        }
        if (this.world.lineOfSightBlock({ ...position, z: position.z + 0.3 }, { ...position, z: position.z + HEAD_ROOM })) {
          findings.push({ status: 'warn', reason: 'WORLD_EDITOR.CHECK_INSIDE' });
        }
      } else if (place === 'under') {
        findings.push({ status: 'bad', reason: 'WORLD_EDITOR.CHECK_UNDER_MAP' });
      } else if (previous && this.world.lineOfSightBlock(previous.position, position)) {
        findings.push({ status: 'bad', reason: 'WORLD_EDITOR.CHECK_BLOCKED', params: { from: previous.point } });
      }
      const worst = findings.reduce<(typeof findings)[number] | undefined>(
        (current, finding) => (!current || SEVERITY[finding.status] > SEVERITY[current.status] ? finding : current),
        undefined,
      );
      checks.push({
        key: waypointKey(request.pathKey, point),
        point,
        place,
        ...(worst ?? { status: 'ok', reason: place === 'ground' ? 'WORLD_EDITOR.CHECK_OK' : 'WORLD_EDITOR.CHECK_OK_FLYING' }),
      });
    }
    return checks;
  }

  /** The walking path from A to C on the navigation mesh, or undefined when there is none (or no mesh). */
  async walkPath(directory: string, from: WorldPosition, to: WorldPosition): Promise<WorldPosition[] | undefined> {
    return (await this.walk(directory, from, to)).path;
  }

  /** The walking path from A to C, loading the navigation mesh tiles around and between them. */
  private async walk(directory: string, from: WorldPosition, to: WorldPosition): Promise<Partial<PathProbeResult>> {
    const graph = await this.graphFor(directory, from, to);
    if (graph === 'tooFar') {
      return { tooFar: true };
    }
    if (!graph) {
      return { noNavMesh: true };
    }
    const path = graph.findPath(from, to);
    return path ? { path, length: pathLength(path) } : {};
  }

  /** The navigation mesh around and between two points (kept for the next question on the same tiles). */
  private async graphFor(directory: string, from: WorldPosition, to: WorldPosition): Promise<NavGraph | 'tooFar' | undefined> {
    const [a, b] = [worldToTile(from.x, from.y), worldToTile(to.x, to.y)];
    const tiles = [];
    for (let tx = Math.min(a.tx, b.tx) - 1; tx <= Math.max(a.tx, b.tx) + 1; tx++) {
      for (let ty = Math.min(a.ty, b.ty) - 1; ty <= Math.max(a.ty, b.ty) + 1; ty++) {
        tiles.push({ tx, ty });
      }
    }
    if (tiles.length > MAX_PROBE_TILES) {
      return 'tooFar';
    }
    const key = `${directory}:${tiles.map(tileKey).join(',')}`;
    if (this.graph?.key !== key) {
      const loaded = (await Promise.all(tiles.map((tile) => this.source.getNavMeshTile(directory, tile)))).filter((tile) => !!tile);
      if (loaded.length === 0) {
        return undefined;
      }
      this.graph = { key, graph: new NavGraph(loaded) };
    }
    return this.graph.graph;
  }
}
