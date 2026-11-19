import { ServerMapTile, TILE_SIZE, TileCoord, V8_SIZE, V9_SIZE, VmapGroup, VmapSpawn } from '@keira/shared/wow-data';
import type { RebuildGeometry } from './navmesh-rebuild';

/** What a rebuild from the server's own data reads (`maps/` and `vmaps/` in the server data folder). */
export interface ServerGeometrySource {
  getServerMap(mapId: number, tile: TileCoord): Promise<ServerMapTile | undefined>;
  getVmapTile(mapId: number, tile: TileCoord): Promise<VmapSpawn[] | undefined>;
  getVmapModel(name: string): Promise<VmapGroup[] | undefined>;
}

/** NavTerrain flags. */
const NAV_GROUND = 0x01;
const NAV_MAGMA = 0x02;
const NAV_SLIME = 0x04;
const NAV_WATER = 0x08;
/** Map liquid type bits. */
const LIQUID_WATER = 0x01;
const LIQUID_OCEAN = 0x02;
const LIQUID_MAGMA = 0x04;
const LIQUID_SLIME = 0x08;
const LIQUID_DARK_WATER = 0x10;

const V9_SIZE_SQ = V9_SIZE * V9_SIZE;
const V8_SIZE_SQ = V8_SIZE * V8_SIZE;
const GRID_SIZE = TILE_SIZE;
const GRID_PART_SIZE = GRID_SIZE / V8_SIZE;
const INVALID_LIQUID_HEIGHT = -500;
const INVALID_LIQUID_HEIGHT_MAX = 5000;

/** Which squares of a neighbour tile are used: all of them for the tile itself, the bordering row or column otherwise. */
enum Spot {
  TOP = 1,
  RIGHT = 2,
  LEFT = 3,
  BOTTOM = 4,
  ENTIRE = 5,
}

function loopVars(portion: Spot): [number, number, number] {
  switch (portion) {
    case Spot.TOP:
      return [0, V8_SIZE, 1];
    case Spot.LEFT:
      return [0, V8_SIZE_SQ - V8_SIZE + 1, V8_SIZE];
    case Spot.RIGHT:
      return [V8_SIZE - 1, V8_SIZE_SQ, V8_SIZE];
    case Spot.BOTTOM:
      return [V8_SIZE_SQ - V8_SIZE, V8_SIZE_SQ, 1];
    default:
      return [0, V8_SIZE_SQ, 1];
  }
}

/** The corners of a terrain triangle (4 per square, around its centre) or a liquid triangle (2 per square). */
function heightTriangle(square: number, triangle: Spot, liquid: boolean): [number, number, number] {
  const row = Math.floor(square / V8_SIZE);
  if (liquid) {
    return triangle === Spot.TOP
      ? [square + row, square + 1 + row, square + V9_SIZE + 1 + row]
      : [square + row, square + V9_SIZE + 1 + row, square + V9_SIZE + row];
  }
  switch (triangle) {
    case Spot.TOP:
      return [square + row, square + 1 + row, V9_SIZE_SQ + square];
    case Spot.LEFT:
      return [square + row, V9_SIZE_SQ + square, square + V9_SIZE + row];
    case Spot.RIGHT:
      return [square + 1 + row, square + V9_SIZE + 1 + row, V9_SIZE_SQ + square];
    default:
      return [V9_SIZE_SQ + square, square + V9_SIZE + 1 + row, square + V9_SIZE + row];
  }
}

const HOLES_H = [0x1111, 0x2222, 0x4444, 0x8888];
const HOLES_V = [0x000f, 0x00f0, 0x0f00, 0xf000];

function isHole(square: number, holes: Uint16Array): boolean {
  const row = Math.floor(square / 128);
  const col = square % 128;
  const cellRow = Math.floor(row / 8);
  const cellCol = Math.floor(col / 8);
  const holeRow = Math.floor((row % 8) / 2);
  const holeCol = Math.floor((square - (row * 128 + cellCol * 8)) / 2);
  return (holes[cellRow * 16 + cellCol] & HOLES_H[holeCol] & HOLES_V[holeRow]) !== 0;
}

function liquidTypeOf(square: number, types: Uint8Array): number {
  const row = Math.floor(square / 128);
  const col = square % 128;
  return types[Math.floor(row / 8) * 16 + Math.floor(col / 8)];
}

/** Mesh data being gathered, in Recast axes, like the generator's `MeshData`. */
class MeshData {
  readonly solidVerts: number[] = [];
  readonly solidTris: number[] = [];
  readonly liquidVerts: number[] = [];
  readonly liquidTris: number[] = [];
  readonly liquidTypes: number[] = [];
}

/**
 * `TerrainBuilder::loadMap` for one tile, or the bordering row or column of a neighbour: its terrain and liquid
 * triangles, keeping per square either the terrain or the liquid when one is under the other.
 */
function loadMap(map: ServerMapTile, tile: TileCoord, portion: Spot, mesh: MeshData): boolean {
  const liquid = map.liquid;
  const xOffset = (tile.tx - 32) * GRID_SIZE;
  const yOffset = (tile.ty - 32) * GRID_SIZE;
  const [loopStart, loopEnd, loopInc] = loopVars(portion);
  const ttriangles: number[] = [];
  const ltriangles: number[] = [];

  if (map.v9 && map.v8) {
    const count = mesh.solidVerts.length / 3;
    for (let i = 0; i < V9_SIZE_SQ; i++) {
      mesh.solidVerts.push(-(xOffset + (i % V9_SIZE) * GRID_PART_SIZE), map.v9[i], -(yOffset + Math.floor(i / V9_SIZE) * GRID_PART_SIZE));
    }
    for (let i = 0; i < V8_SIZE_SQ; i++) {
      mesh.solidVerts.push(
        -(xOffset + (i % V8_SIZE) * GRID_PART_SIZE + GRID_PART_SIZE / 2),
        map.v8[i],
        -(yOffset + Math.floor(i / V8_SIZE) * GRID_PART_SIZE + GRID_PART_SIZE / 2),
      );
    }
    for (let i = loopStart; i < loopEnd; i += loopInc) {
      for (let j = Spot.TOP; j <= Spot.BOTTOM; j++) {
        const [a, b, c] = heightTriangle(i, j, false);
        ttriangles.push(c + count, b + count, a + count);
      }
    }
  }

  const liquidStart = mesh.liquidVerts.length / 3;
  if (liquid) {
    for (let i = 0, j = 0; i < V9_SIZE_SQ; i++) {
      const row = Math.floor(i / V9_SIZE);
      const col = i % V9_SIZE;
      const x = -(xOffset + col * GRID_PART_SIZE);
      const z = -(yOffset + row * GRID_PART_SIZE);
      if (!liquid.heights) {
        mesh.liquidVerts.push(x, liquid.level, z);
      } else if (
        row < liquid.offsetY ||
        row >= liquid.offsetY + liquid.height ||
        col < liquid.offsetX ||
        col >= liquid.offsetX + liquid.width
      ) {
        // a dummy vertex, with an invalid height
        mesh.liquidVerts.push(x, INVALID_LIQUID_HEIGHT, z);
      } else {
        mesh.liquidVerts.push(x, liquid.heights[j++], z);
      }
    }
    for (let i = loopStart; i < loopEnd; i += loopInc) {
      for (const j of [Spot.TOP, Spot.BOTTOM]) {
        const [a, b, c] = heightTriangle(i, j, true);
        ltriangles.push(c + liquidStart, b + liquidStart, a + liquidStart);
      }
    }
  }

  if (ltriangles.length + ttriangles.length === 0) {
    return false;
  }
  // liquid heights as read, to pad the squares that lost corners at extraction
  const lverts = mesh.liquidVerts;
  const original = lverts.slice();
  const tverts = mesh.solidVerts;
  let l = 0;
  let t = 0;
  for (let i = loopStart; i < loopEnd; i += loopInc) {
    for (let j = 0; j < 2; j++) {
      let useTerrain = true;
      let useLiquid = true;
      let navType = 0;
      if (ltriangles.length === 0) {
        useLiquid = false;
      } else {
        const type = liquidTypeOf(i, (liquid as NonNullable<typeof liquid>).types);
        if (type === LIQUID_WATER || type === LIQUID_OCEAN) {
          navType = NAV_WATER;
        } else if (type === LIQUID_MAGMA) {
          navType = NAV_MAGMA;
        } else if (type === LIQUID_SLIME) {
          navType = NAV_SLIME;
        } else {
          useLiquid = false;
          // nobody should be in dark water, creatures neither
          useTerrain = type !== LIQUID_DARK_WATER;
        }
      }
      if (ttriangles.length === 0) {
        useTerrain = false;
      }
      const ltris = ltriangles.slice(l, l + 3);
      if (useLiquid) {
        const valid = ltris.map((v) => original[v * 3 + 1]).filter((h) => h !== INVALID_LIQUID_HEIGHT && h < INVALID_LIQUID_HEIGHT_MAX);
        if (valid.length > 0 && valid.length < 3) {
          const height = valid.reduce((sum, h) => sum + h, 0) / valid.length;
          for (const v of ltris) {
            const h = lverts[v * 3 + 1];
            if (h === INVALID_LIQUID_HEIGHT || h > INVALID_LIQUID_HEIGHT_MAX) {
              lverts[v * 3 + 1] = height;
            }
          }
        }
        if (valid.length === 0) {
          useLiquid = false;
        }
      }
      if (useTerrain && map.holes) {
        useTerrain = !isHole(i, map.holes);
      }
      const ttris = ttriangles.slice(t, t + 6);
      if (useTerrain && useLiquid) {
        // one kind per square: the higher one
        const liquidHeights = ltris.map((v) => lverts[v * 3 + 1]);
        const terrainHeights = ttris.map((v) => tverts[v * 3 + 1]);
        if (Math.min(...liquidHeights) > Math.max(...terrainHeights)) {
          useTerrain = false;
        }
        if (Math.min(...terrainHeights) > Math.max(...liquidHeights)) {
          useLiquid = false;
        }
      }
      if (useLiquid) {
        mesh.liquidTypes.push(navType);
        mesh.liquidTris.push(...ltris);
      }
      if (useTerrain) {
        mesh.solidTris.push(...ttris);
      }
      l += 3;
      t += 6;
    }
  }
  return mesh.solidTris.length > 0 || mesh.liquidTris.length > 0;
}

/** `G3D::Matrix3::fromEulerAnglesXYZ(x, y, z)` (Rx · Ry · Rz), row-major. */
function eulerXYZ(x: number, y: number, z: number): number[][] {
  const [cx, sx, cy, sy, cz, sz] = [Math.cos(x), Math.sin(x), Math.cos(y), Math.sin(y), Math.cos(z), Math.sin(z)];
  const rx = [
    [1, 0, 0],
    [0, cx, -sx],
    [0, sx, cx],
  ];
  const ry = [
    [cy, 0, sy],
    [0, 1, 0],
    [-sy, 0, cy],
  ];
  const rz = [
    [cz, -sz, 0],
    [sz, cz, 0],
    [0, 0, 1],
  ];
  const mul = (a: number[][], b: number[][]) =>
    a.map((row) => [0, 1, 2].map((col) => row[0] * b[0][col] + row[1] * b[1][col] + row[2] * b[2][col]));
  return mul(rx, mul(ry, rz));
}

/**
 * Where a vertex of a vmap model placed by `spawn` lands, in server coordinates (x, y, z): vertex × rotation × scale +
 * position, like the mmaps generator (`TerrainBuilder::transform`) and the server's line of sight.
 */
export function vmapToWorld(spawn: VmapSpawn): (x: number, y: number, z: number) => [number, number, number] {
  const toRadians = Math.PI / -180;
  const rotation = eulerXYZ(spawn.rotation[2] * toRadians, spawn.rotation[0] * toRadians, spawn.rotation[1] * toRadians);
  const position = [spawn.position[0] - 32 * GRID_SIZE, spawn.position[1] - 32 * GRID_SIZE, spawn.position[2]];
  return (x, y, z) => {
    const v = [0, 1, 2].map((i) => (x * rotation[0][i] + y * rotation[1][i] + z * rotation[2][i]) * spawn.scale + position[i]);
    // vmap axes are mirrored on the horizontal axes
    return [-v[0], -v[1], v[2]];
  };
}

/** `TerrainBuilder::loadVMap`: the collision (and liquids) of every model in the tile's vmtile. */
async function loadVmap(source: ServerGeometrySource, mapId: number, tile: TileCoord, mesh: MeshData): Promise<void> {
  for (const spawn of (await source.getVmapTile(mapId, tile)) ?? []) {
    const groups = await source.getVmapModel(spawn.name);
    if (!groups) {
      continue;
    }
    // M2s have their triangles reversed
    const isM2 = /\.m2/i.test(spawn.name);
    const toWorld = vmapToWorld(spawn);
    /** In Recast axes (server y, z, server x). */
    const place = (x: number, y: number, z: number): [number, number, number] => {
      const [wx, wy, wz] = toWorld(x, y, z);
      return [wy, wz, wx];
    };
    for (const group of groups) {
      const offset = mesh.solidVerts.length / 3;
      for (let i = 0; i < group.vertices.length; i += 3) {
        mesh.solidVerts.push(...place(group.vertices[i], group.vertices[i + 1], group.vertices[i + 2]));
      }
      for (let i = 0; i < group.indices.length; i += 3) {
        const [a, b, c] = [group.indices[i], group.indices[i + 1], group.indices[i + 2]];
        mesh.solidTris.push(...(isM2 ? [c, b, a] : [a, b, c]).map((index) => index + offset));
      }
      const liquid = group.liquid;
      if (liquid?.flags.length) {
        const type = [NAV_WATER, NAV_WATER, NAV_MAGMA, NAV_SLIME][liquid.type & 3];
        const vertsX = liquid.tilesX + 1;
        const vertsY = liquid.tilesY + 1;
        const liquidOffset = mesh.liquidVerts.length / 3;
        for (let x = 0; x < vertsX; x++) {
          for (let y = 0; y < vertsY; y++) {
            mesh.liquidVerts.push(
              ...place(liquid.corner[0] + x * GRID_PART_SIZE, liquid.corner[1] + y * GRID_PART_SIZE, liquid.heights[y * vertsX + x]),
            );
          }
        }
        for (let x = 0; x < liquid.tilesX; x++) {
          for (let y = 0; y < liquid.tilesY; y++) {
            if ((liquid.flags[x + y * liquid.tilesX] & 0x0f) !== 0x0f) {
              const square = x * liquid.tilesY + y;
              const [i1, i2, i3, i4] = [square + x, square + 1 + x, square + liquid.tilesY + 2 + x, square + liquid.tilesY + 1 + x];
              // stored rotated: (idx2, idx1, idx3) of (idx3, idx2, idx1), and of (idx4, idx3, idx1)
              mesh.liquidTris.push(i2 + liquidOffset, i1 + liquidOffset, i3 + liquidOffset);
              mesh.liquidTris.push(i3 + liquidOffset, i1 + liquidOffset, i4 + liquidOffset);
              mesh.liquidTypes.push(type, type);
            }
          }
        }
      }
    }
  }
}

/**
 * The input of a navigation mesh tile as AzerothCore's mmaps generator gathers it (`TileBuilder::buildTile`): the
 * server's terrain and liquids of the tile and the bordering squares of its neighbours (`maps/`), plus the collision
 * and liquids of the models in its vmap tile (`vmaps/`). Undefined when the server has no data for the tile.
 */
export async function collectServerTileGeometry(
  source: ServerGeometrySource,
  mapId: number,
  tile: TileCoord,
): Promise<RebuildGeometry | undefined> {
  const mesh = new MeshData();
  const center = await source.getServerMap(mapId, tile);
  if (center && loadMap(center, tile, Spot.ENTIRE, mesh)) {
    const neighbours: [TileCoord, Spot][] = [
      [{ tx: tile.tx + 1, ty: tile.ty }, Spot.LEFT],
      [{ tx: tile.tx - 1, ty: tile.ty }, Spot.RIGHT],
      [{ tx: tile.tx, ty: tile.ty + 1 }, Spot.TOP],
      [{ tx: tile.tx, ty: tile.ty - 1 }, Spot.BOTTOM],
    ];
    for (const [neighbour, portion] of neighbours) {
      const map = await source.getServerMap(mapId, neighbour);
      if (map) {
        loadMap(map, neighbour, portion, mesh);
      }
    }
  }
  await loadVmap(source, mapId, tile, mesh);
  if (mesh.solidTris.length === 0 && mesh.liquidTris.length === 0) {
    return undefined;
  }
  // only the vertices used by triangles (they set the tile's height bounds), solids then liquids
  const positions: number[] = [];
  const indices: number[] = [];
  const areas: number[] = [];
  const add = (verts: number[], tris: number[], areaOf: (t: number) => number) => {
    const remap = new Map<number, number>();
    for (let i = 0; i < tris.length; i++) {
      let index = remap.get(tris[i]);
      if (index === undefined) {
        index = positions.length / 3;
        remap.set(tris[i], index);
        positions.push(verts[tris[i] * 3], verts[tris[i] * 3 + 1], verts[tris[i] * 3 + 2]);
      }
      indices.push(index);
    }
    for (let t = 0; t < tris.length / 3; t++) {
      areas.push(areaOf(t));
    }
  };
  add(mesh.solidVerts, mesh.solidTris, () => NAV_GROUND);
  add(mesh.liquidVerts, mesh.liquidTris, (t) => mesh.liquidTypes[t]);
  return { positions: Float32Array.from(positions), indices: Uint32Array.from(indices), areas: Uint8Array.from(areas) };
}
