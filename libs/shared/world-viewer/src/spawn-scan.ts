import { serverTerrainHeightAt, TileCoord, worldToTile, WorldPosition, tileKey } from '@keira/shared/wow-data';
import { RebuildGeometry } from './navmesh-rebuild';
import { collectServerTileGeometry, ServerGeometrySource } from './server-geometry';
import { SpawnKind } from './world-viewer.model';

/** ok: on the ground; warn: off a little (the core puts it right) or worth a look; bad: inside the floor or floating. */
export type SpawnScanLevel = 'ok' | 'warn' | 'bad';

export interface SpawnScanInput {
  key: string;
  kind: SpawnKind;
  position: WorldPosition;
  /** A creature that flies (it may float). */
  flying?: boolean;
}

export interface SpawnScanResult {
  key: string;
  level: SpawnScanLevel;
  text: string;
  /** The floor under it (server terrain and collision), when found. */
  ground?: number;
}

/** Off by up to this (yards): on the ground. */
export const SCAN_ON_GROUND = 0.5;
/** The server looks for the floor from this far (yards) above a creature (`Z_OFFSET_FIND_HEIGHT`, collision height). */
export const SCAN_SEARCH_ABOVE = 2;
/** A walking creature floating up to this (yards) drops to the ground when it moves; higher, it's plainly wrong. */
export const SCAN_DROP = 10;
/** Grid cell (yards) the floor triangles are sorted into, so each lookup tests only a few. */
const CELL = 4;
const NAV_GROUND = 1;

/** The floor triangles of a server tile, sorted into a grid, to tell the floor heights at a place quickly. */
export class FloorGrid {
  private readonly cells = new Map<string, number[]>();

  constructor(private readonly geometry: RebuildGeometry) {
    const { positions, indices } = geometry;
    for (let t = 0; t < indices.length / 3; t++) {
      // (Recast axes: x = server y, y = height, z = server x)
      const xs = [0, 1, 2].map((i) => positions[indices[t * 3 + i] * 3]);
      const zs = [0, 1, 2].map((i) => positions[indices[t * 3 + i] * 3 + 2]);
      for (let cx = Math.floor(Math.min(...xs) / CELL); cx <= Math.floor(Math.max(...xs) / CELL); cx++) {
        for (let cz = Math.floor(Math.min(...zs) / CELL); cz <= Math.floor(Math.max(...zs) / CELL); cz++) {
          const key = `${cx}:${cz}`;
          const list = this.cells.get(key);
          if (list) {
            list.push(t);
          } else {
            this.cells.set(key, [t]);
          }
        }
      }
    }
  }

  /** Heights of the solid floors (`solid`) or liquid surfaces at a server position, highest first. */
  heightsAt(x: number, y: number, solid = true): number[] {
    const { positions, indices, areas } = this.geometry;
    const heights: number[] = [];
    for (const t of this.cells.get(`${Math.floor(y / CELL)}:${Math.floor(x / CELL)}`) ?? []) {
      if ((areas[t] === NAV_GROUND) !== solid) {
        continue;
      }
      const [a, b, c] = [0, 1, 2].map((i) => indices[t * 3 + i] * 3);
      const height = heightInTriangle(
        y,
        x,
        [positions[a], positions[a + 1], positions[a + 2]],
        [positions[b], positions[b + 1], positions[b + 2]],
        [positions[c], positions[c + 1], positions[c + 2]],
      );
      if (height !== undefined) {
        heights.push(height);
      }
    }
    return heights.sort((p, q) => q - p);
  }
}

/** The height of a triangle (Recast axes) over a point (px, pz), or undefined outside it. */
function heightInTriangle(px: number, pz: number, a: number[], b: number[], c: number[]): number | undefined {
  const det = (b[2] - c[2]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[2] - c[2]);
  if (Math.abs(det) < 1e-9) {
    return undefined;
  }
  const u = ((b[2] - c[2]) * (px - c[0]) + (c[0] - b[0]) * (pz - c[2])) / det;
  const v = ((c[2] - a[2]) * (px - c[0]) + (a[0] - c[0]) * (pz - c[2])) / det;
  const w = 1 - u - v;
  const EPS = -1e-6;
  return u < EPS || v < EPS || w < EPS ? undefined : u * a[1] + v * b[1] + w * c[1];
}

/** How a spawn stands on the floors found at its place (highest first) and the liquids there. */
export function judgeSpawn(spawn: SpawnScanInput, floors: number[], liquids: number[]): SpawnScanResult {
  const z = spawn.position.z;
  const yards = (value: number) => value.toFixed(1);
  // like the server: the highest floor not more than a little above it
  const ground = floors.find((floor) => floor <= z + SCAN_SEARCH_ABOVE);
  if (floors.length === 0) {
    return { key: spawn.key, level: 'bad', text: 'No floor under or over it (off the edge of the world?)' };
  }
  if (ground === undefined) {
    return { key: spawn.key, level: 'bad', text: `Under the ground by ${yards(floors[floors.length - 1] - z)} yd: no floor below it` };
  }
  const offset = z - ground;
  const water = liquids.find((surface) => surface > ground && z <= surface + SCAN_ON_GROUND);
  const result = (level: SpawnScanLevel, text: string): SpawnScanResult => ({ key: spawn.key, level, text, ground });
  if (Math.abs(offset) <= SCAN_ON_GROUND) {
    return result('ok', 'On the ground');
  }
  if (offset < 0) {
    return spawn.kind === 'creature'
      ? result('warn', `${yards(-offset)} yd into the ground: the core lifts it onto the floor`)
      : result('bad', `${yards(-offset)} yd into the ground: gameobjects are never moved by the core`);
  }
  if (water !== undefined || (spawn.kind === 'creature' && spawn.flying)) {
    return result('ok', water !== undefined ? 'In water' : `Flying, ${yards(offset)} yd up`);
  }
  if (spawn.kind === 'gameobject') {
    return result('bad', `Floats ${yards(offset)} yd: gameobjects are never moved by the core`);
  }
  return offset <= SCAN_DROP
    ? result('warn', `Floats ${yards(offset)} yd: drops to the ground when it moves`)
    : result('bad', `Floats ${yards(offset)} yd`);
}

/**
 * Checks where spawns stand against the server's own floors (terrain and building collision of each server tile, as
 * the mmaps generator reads them), tile by tile. Spawns on tiles without server data are left out. `onProgress` gets
 * the tiles done and their count; `cancelled` is checked between tiles.
 */
export async function scanSpawnPositions(
  source: ServerGeometrySource,
  mapId: number,
  spawns: SpawnScanInput[],
  onProgress: (done: number, total: number) => void = () => undefined,
  cancelled: () => boolean = () => false,
  collect: typeof collectServerTileGeometry = collectServerTileGeometry,
): Promise<SpawnScanResult[]> {
  const byTile = new Map<string, { tile: TileCoord; spawns: SpawnScanInput[] }>();
  for (const spawn of spawns) {
    const tile = worldToTile(spawn.position.x, spawn.position.y);
    const entry = byTile.get(tileKey(tile)) ?? { tile, spawns: [] };
    entry.spawns.push(spawn);
    byTile.set(tileKey(tile), entry);
  }
  const results: SpawnScanResult[] = [];
  let done = 0;
  for (const { tile, spawns: here } of byTile.values()) {
    if (cancelled()) {
      break;
    }
    const [geometry, terrain] = await Promise.all([
      collect(source, mapId, tile).catch(() => undefined),
      source.getServerMap(mapId, tile).catch(() => undefined),
    ]);
    if (geometry) {
      const grid = new FloorGrid(geometry);
      for (const spawn of here) {
        const { x, y } = spawn.position;
        // (the navigation mesh's input leaves out the terrain under water: the terrain itself is added)
        const ground = terrain && serverTerrainHeightAt(terrain, x, y);
        const floors = [...grid.heightsAt(x, y), ...(ground === undefined ? [] : [ground])].sort((a, b) => b - a);
        results.push(judgeSpawn(spawn, floors, grid.heightsAt(x, y, false)));
      }
    }
    onProgress(++done, byTile.size);
    // (a breath between tiles: the window stays responsive)
    await new Promise((resolve) => setTimeout(resolve));
  }
  return results;
}
