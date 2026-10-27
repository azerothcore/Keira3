import { NavGraph, pathLength, tileKey, worldToTile, WorldPosition } from '@keira/shared/wow-data';
import { NavMeshSource } from './world-navmesh';
import { WorldScene } from './world-scene';

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

  /** The walking path from A to C, loading the navigation mesh tiles around and between them. */
  private async walk(directory: string, from: WorldPosition, to: WorldPosition): Promise<Partial<PathProbeResult>> {
    const [a, b] = [worldToTile(from.x, from.y), worldToTile(to.x, to.y)];
    const tiles = [];
    for (let tx = Math.min(a.tx, b.tx) - 1; tx <= Math.max(a.tx, b.tx) + 1; tx++) {
      for (let ty = Math.min(a.ty, b.ty) - 1; ty <= Math.max(a.ty, b.ty) + 1; ty++) {
        tiles.push({ tx, ty });
      }
    }
    if (tiles.length > MAX_PROBE_TILES) {
      return { tooFar: true };
    }
    const key = `${directory}:${tiles.map(tileKey).join(',')}`;
    if (this.graph?.key !== key) {
      const loaded = (await Promise.all(tiles.map((tile) => this.source.getNavMeshTile(directory, tile)))).filter((tile) => !!tile);
      if (loaded.length === 0) {
        return { noNavMesh: true };
      }
      this.graph = { key, graph: new NavGraph(loaded) };
    }
    const path = this.graph.graph.findPath(from, to);
    return path ? { path, length: pathLength(path) } : {};
  }
}
