import {
  LiquidKind,
  LiquidMesh,
  M2Mesh,
  navTerrainColor,
  MmapRecastConfig,
  ModelPlacement,
  NavMeshTile,
  TerrainMeshData,
  TILE_SIZE,
  TileCoord,
  tilesAround,
  WmoModel,
} from '@keira/shared/wow-data';
import { Matrix4, Object3D, Vector3 } from 'three';
import { applyPlacement } from './wmo-object';

/** What a tile rebuild reads from `WowClientService`. */
export interface NavMeshRebuildSource {
  getTerrain(directory: string, tile: TileCoord): Promise<TerrainMeshData | undefined>;
  getTilePlacements(directory: string, tile: TileCoord): Promise<{ wmos: ModelPlacement[]; doodads: ModelPlacement[] } | undefined>;
  getWmo(path: string): Promise<WmoModel | undefined>;
  getM2(path: string): Promise<M2Mesh | undefined>;
  getTerrainDetail(directory: string, tile: TileCoord): Promise<{ liquids: LiquidMesh[] } | undefined>;
}

/**
 * Triangles in Recast axes (server y, z, server x), as the mmaps generator feeds them: the solid ones (terrain,
 * collision) and the liquid surfaces, which are rasterised after the filters, each with its NavTerrain flag.
 */
export interface RebuildGeometry {
  positions: Float32Array;
  indices: Uint32Array;
  /** NavTerrain flag of each triangle: 1 ground (solid), 2 magma, 4 slime, 8 water. */
  areas: Uint8Array;
}

const NAV_GROUND = 1;
const LIQUID_AREAS: Record<LiquidKind, number> = { water: 8, ocean: 8, magma: 2, slime: 4 };

/** Geometry this far (yards) beyond the tile is used too, so its edges come out like the generator's. */
const MARGIN = 10;
/** Models placed this far beyond the tile can still reach into it. */
const MODEL_REACH = 120;

/** The tile's bounds in Recast axes (x = server y, z = server x), like `MapBuilder::getTileBounds`. */
export function recastTileBounds(tile: TileCoord): { minX: number; maxX: number; minZ: number; maxZ: number } {
  const maxX = (32 - tile.tx) * TILE_SIZE;
  const maxZ = (32 - tile.ty) * TILE_SIZE;
  return { minX: maxX - TILE_SIZE, maxX, minZ: maxZ - TILE_SIZE, maxZ };
}

/**
 * The walkable input of a tile, as the mmaps generator sees it: the terrain (without its holes) and the collision of
 * the buildings and models on and around the tile, read from the client files.
 */
export async function collectTileGeometry(source: NavMeshRebuildSource, directory: string, tile: TileCoord): Promise<RebuildGeometry> {
  const bounds = recastTileBounds(tile);
  const positions: number[] = [];
  const indices: number[] = [];
  const areas: number[] = [];
  /** Adds triangles given in scene axes (−y, z, −x), keeping those near the tile. */
  const add = (scene: ArrayLike<number>, tris: ArrayLike<number>, matrix?: Matrix4, area = NAV_GROUND) => {
    const point = new Vector3();
    const base = positions.length / 3;
    const recast: number[] = [];
    for (let i = 0; i < scene.length; i += 3) {
      point.set(scene[i], scene[i + 1], scene[i + 2]);
      if (matrix) {
        point.applyMatrix4(matrix);
      }
      // scene (−y, z, −x) → Recast (y, z, x)
      recast.push(-point.x, point.y, -point.z);
    }
    let used = 0;
    const remap = new Map<number, number>();
    for (let t = 0; t + 2 < tris.length; t += 3) {
      const corners = [tris[t], tris[t + 1], tris[t + 2]];
      // the triangle's footprint overlaps the tile and its margin (big triangles can span it with no corner inside)
      const xs = corners.map((c) => recast[c * 3]);
      const zs = corners.map((c) => recast[c * 3 + 2]);
      const near =
        Math.max(...xs) >= bounds.minX - MARGIN &&
        Math.min(...xs) <= bounds.maxX + MARGIN &&
        Math.max(...zs) >= bounds.minZ - MARGIN &&
        Math.min(...zs) <= bounds.maxZ + MARGIN;
      if (near) {
        for (const c of corners) {
          let index = remap.get(c);
          if (index === undefined) {
            index = base + used++;
            remap.set(c, index);
            positions.push(recast[c * 3], recast[c * 3 + 1], recast[c * 3 + 2]);
          }
          indices.push(index);
        }
        areas.push(area);
      }
    }
  };
  const near = (placement: ModelPlacement) => {
    // server (x, y) → Recast (z, x)
    const [x, z] = [placement.position[1], placement.position[0]];
    return (
      x >= bounds.minX - MODEL_REACH && x <= bounds.maxX + MODEL_REACH && z >= bounds.minZ - MODEL_REACH && z <= bounds.maxZ + MODEL_REACH
    );
  };
  const object = new Object3D();
  const matrixOf = (placement: ModelPlacement) => {
    applyPlacement(object, placement);
    object.updateMatrix();
    return object.matrix.clone();
  };

  const around = tilesAround(tile, 1);
  const buildings = new Map<number, ModelPlacement>();
  const doodads = new Map<number, ModelPlacement>();
  for (const neighbour of around) {
    const terrain = await source.getTerrain(directory, neighbour);
    if (terrain) {
      add(terrain.positions, terrain.indices);
    }
    for (const liquid of (await source.getTerrainDetail(directory, neighbour))?.liquids ?? []) {
      add(liquid.positions, liquid.indices, undefined, LIQUID_AREAS[liquid.kind]);
    }
    const placements = await source.getTilePlacements(directory, neighbour);
    placements?.wmos.filter(near).forEach((wmo) => buildings.set(wmo.uniqueId, wmo));
    placements?.doodads.filter(near).forEach((doodad) => doodads.set(doodad.uniqueId, doodad));
  }
  for (const building of buildings.values()) {
    const model = await source.getWmo(building.path);
    const matrix = matrixOf(building);
    for (const group of model?.groups ?? []) {
      if (group.collision) {
        add(group.collision.positions, group.collision.indices, matrix);
      }
    }
  }
  for (const doodad of doodads.values()) {
    const model = await source.getM2(doodad.path);
    if (model?.collision.indices.length) {
      add(model.collision.positions, model.collision.indices, matrixOf(doodad));
    }
  }
  return { positions: Float32Array.from(positions), indices: Uint32Array.from(indices), areas: Uint8Array.from(areas) };
}

/** Rebuild progress: sub-tiles done out of all. */
export type RebuildProgress = (done: number, total: number) => void;

/** The Recast module (`@recast-navigation/core`), loaded on first use only. */
type RecastModule = typeof import('@recast-navigation/core');

let recastModule: Promise<RecastModule> | undefined;

/** Loads and initialises Recast (WebAssembly) once. */
export function loadRecast(): Promise<RecastModule> {
  recastModule ??= import('@recast-navigation/core').then(async (recast) => {
    await recast.init();
    return recast;
  });
  return recastModule;
}

/** Lets the window repaint between sub-tiles. */
const nextFrame = () => new Promise<void>((resolve) => setTimeout(resolve));

/**
 * Builds a navigation mesh tile from its input geometry with the given settings, the way AzerothCore's mmaps generator
 * does (`MapBuilder::buildMoveMapTile`): the map tile cut in sub-tiles of `verticesPerTileEdge` cells, each rasterised,
 * filtered, eroded, split in watershed regions and turned into a detail mesh. Returns its triangles in scene axes.
 */
export async function rebuildNavMeshTile(
  recast: RecastModule,
  geometry: RebuildGeometry,
  tile: TileCoord,
  config: MmapRecastConfig,
  onProgress: RebuildProgress = () => undefined,
  cancelled: () => boolean = () => false,
): Promise<NavMeshTile | undefined> {
  const bounds = recastTileBounds(tile);
  const cs = config.cellSizeHorizontal;
  const ch = config.cellSizeVertical;
  const tileSize = config.verticesPerTileEdge;
  if (!(cs > 0 && ch > 0 && tileSize >= 1 && config.walkableRadius >= 0)) {
    throw new Error('Invalid settings: cell sizes must be above 0, verticesPerTileEdge at least 1');
  }
  const borderSize = config.walkableRadius + 3;
  const border = borderSize * cs;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 1; i < geometry.positions.length; i += 3) {
    minY = Math.min(minY, geometry.positions[i]);
    maxY = Math.max(maxY, geometry.positions[i]);
  }
  const cells = Math.round(TILE_SIZE / cs);
  const tiles = Math.ceil(cells / tileSize);
  const step = tileSize * cs;

  // triangles by sub-tile (with the border), so each sub-tile only rasterises what can touch it
  const buckets: number[][] = Array.from({ length: tiles * tiles }, () => []);
  const p = geometry.positions;
  for (let t = 0; t < geometry.indices.length; t += 3) {
    const corners = [geometry.indices[t], geometry.indices[t + 1], geometry.indices[t + 2]];
    const xs = corners.map((c) => p[c * 3]);
    const zs = corners.map((c) => p[c * 3 + 2]);
    const cell = (value: number, min: number) => Math.floor((value - min) / step);
    const [x0, x1] = [cell(Math.min(...xs) - border, bounds.minX), cell(Math.max(...xs) + border, bounds.minX)];
    const [z0, z1] = [cell(Math.min(...zs) - border, bounds.minZ), cell(Math.max(...zs) + border, bounds.minZ)];
    for (let x = Math.max(0, x0); x <= Math.min(tiles - 1, x1); x++) {
      for (let z = Math.max(0, z0); z <= Math.min(tiles - 1, z1); z++) {
        buckets[z * tiles + x].push(t / 3);
      }
    }
  }

  const context = new recast.RecastBuildContext();
  const verts = new recast.VerticesArray();
  verts.copy(geometry.positions);
  const nverts = geometry.positions.length / 3;
  const positions: number[] = [];
  const colors: number[] = [];
  let done = 0;
  for (let z = 0; z < tiles; z++) {
    for (let x = 0; x < tiles; x++) {
      if (cancelled()) {
        return undefined;
      }
      const triangles = buckets[z * tiles + x];
      if (triangles.length > 0) {
        const bmin: [number, number, number] = [bounds.minX + x * step - border, minY, bounds.minZ + z * step - border];
        const bmax: [number, number, number] = [bounds.minX + (x + 1) * step + border, maxY, bounds.minZ + (z + 1) * step + border];
        buildSubTile(
          recast,
          context,
          verts,
          nverts,
          geometry,
          triangles,
          bmin,
          bmax,
          config,
          tileSize + borderSize * 2,
          borderSize,
          positions,
          colors,
        );
      }
      onProgress(++done, tiles * tiles);
      if (done % 8 === 0) {
        await nextFrame();
      }
    }
  }
  verts.destroy();
  return { positions: Float32Array.from(positions), colors: Float32Array.from(colors), config };
}

/** One sub-tile through the generator's Recast steps; its detail triangles are added to `out` (scene axes). */
function buildSubTile(
  recast: RecastModule,
  context: InstanceType<RecastModule['RecastBuildContext']>,
  verts: InstanceType<RecastModule['VerticesArray']>,
  nverts: number,
  geometry: RebuildGeometry,
  triangles: number[],
  bmin: [number, number, number],
  bmax: [number, number, number],
  config: MmapRecastConfig,
  size: number,
  borderSize: number,
  out: number[],
  outColors: number[],
): void {
  const cs = config.cellSizeHorizontal;
  const ch = config.cellSizeVertical;
  // solids first; liquids are added after the filters, like the generator does
  const [solids, liquids] = [
    triangles.filter((t) => geometry.areas[t] === NAV_GROUND),
    triangles.filter((t) => geometry.areas[t] !== NAV_GROUND),
  ];
  const trianglesOf = (list: number[]) => {
    const array = new recast.TrianglesArray();
    array.copy(list.flatMap((t) => [geometry.indices[t * 3], geometry.indices[t * 3 + 1], geometry.indices[t * 3 + 2]]));
    const areas = new recast.TriangleAreasArray();
    areas.copy(list.map((t) => geometry.areas[t]));
    return { array, areas, count: list.length };
  };
  const solid = trianglesOf(solids);
  const liquid = trianglesOf(liquids);
  const heightfield = recast.allocHeightfield();
  const compact = recast.allocCompactHeightfield();
  const contours = recast.allocContourSet();
  const polyMesh = recast.allocPolyMesh();
  const detail = recast.allocPolyMeshDetail();
  try {
    if (!recast.createHeightfield(context, heightfield, size, size, bmin, bmax, cs, ch)) {
      return;
    }
    recast.clearUnwalkableTriangles(context, config.walkableSlopeAngle, verts, nverts, solid.array, solid.count, solid.areas);
    recast.rasterizeTriangles(context, verts, nverts, solid.array, solid.areas, solid.count, heightfield, config.walkableClimb);
    recast.filterLowHangingWalkableObstacles(context, config.walkableClimb, heightfield);
    recast.filterLedgeSpans(context, config.walkableHeight, config.walkableClimb, heightfield);
    recast.filterWalkableLowHeightSpans(context, config.walkableHeight, heightfield);
    recast.rasterizeTriangles(context, verts, nverts, liquid.array, liquid.areas, liquid.count, heightfield, config.walkableClimb);
    const built =
      recast.buildCompactHeightfield(context, config.walkableHeight, config.walkableClimb, heightfield, compact) &&
      recast.erodeWalkableArea(context, config.walkableRadius, compact) &&
      recast.buildDistanceField(context, compact) &&
      recast.buildRegions(context, compact, borderSize, 60 * 60, 50 * 50) &&
      recast.buildContours(
        context,
        compact,
        config.maxSimplificationError,
        config.verticesPerTileEdge + 1,
        contours,
        recast.Recast.RC_CONTOUR_TESS_WALL_EDGES,
      ) &&
      recast.buildPolyMesh(context, contours, 6, polyMesh) &&
      recast.buildPolyMeshDetail(context, polyMesh, compact, cs * 16, ch, detail);
    if (!built) {
      return;
    }
    for (let m = 0; m < detail.nmeshes(); m++) {
      const [vertBase, , triBase, triCount] = [0, 1, 2, 3].map((k) => detail.meshes(m * 4 + k));
      const color = navTerrainColor(polyMesh.areas(m));
      for (let t = 0; t < triCount; t++) {
        for (let k = 0; k < 3; k++) {
          const v = (vertBase + detail.tris((triBase + t) * 4 + k)) * 3;
          // Recast (y, z, x) → scene (−y, z, −x)
          out.push(-detail.verts(v), detail.verts(v + 1), -detail.verts(v + 2));
          outColors.push(...color);
        }
      }
    }
  } finally {
    recast.freeHeightfield(heightfield);
    recast.freeCompactHeightfield(compact);
    recast.freeContourSet(contours);
    recast.freePolyMesh(polyMesh);
    recast.freePolyMeshDetail(detail);
    for (const list of [solid, liquid]) {
      list.array.destroy();
      list.areas.destroy();
    }
  }
}
