import { TILE_SIZE, TileCoord } from './coords';

/**
 * A tile of the server's terrain (`maps/MMMYYXX.map`, written by AzerothCore's map extractor, version 9): the heights
 * of its 129 × 129 corner grid (V9) and 128 × 128 square centres (V8), its holes and its liquid, as the mmaps
 * generator (`TerrainBuilder::loadMap`) reads them.
 */
export interface ServerMapTile {
  /** Corner heights, row by row; undefined when the tile has no terrain (only liquid). */
  v9?: Float32Array;
  /** Square centre heights, row by row. */
  v8?: Float32Array;
  /** Holes per chunk (16 × 16), a bit per 2 × 2 squares; undefined when there are none. */
  holes?: Uint16Array;
  liquid?: ServerMapLiquid;
  /** Area id per chunk (16 × 16, by row of server x), or one `area` for the whole tile. */
  areas?: Uint16Array;
  area?: number;
}

export interface ServerMapLiquid {
  /** Liquid kind bits per chunk (16 × 16): 1 water, 2 ocean, 4 magma, 8 slime, 16 dark water. */
  types: Uint8Array;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  /** Heights of the `width` × `height` corners from (offsetX, offsetY); undefined: `level` everywhere. */
  heights?: Float32Array;
  level: number;
}

const MAP_MAGIC = 0x5350414d; // 'MAPS'
const MAP_VERSION = 9;
const AREA_NO_AREA = 0x1;
const HEIGHT_NO_HEIGHT = 0x1;
const HEIGHT_AS_INT16 = 0x2;
const HEIGHT_AS_INT8 = 0x4;
const LIQUID_NO_TYPE = 0x1;
const LIQUID_NO_HEIGHT = 0x2;
export const V9_SIZE = 129;
export const V8_SIZE = 128;

/** `maps/MMMYYXX.map`: map id, then the grid's y and x (the ADT tile's second and first numbers), like the mmtiles. */
export function serverMapName(mapId: number, tile: TileCoord): string {
  const pad = (value: number, size: number) => String(value).padStart(size, '0');
  return `${pad(mapId, 3)}${pad(tile.ty, 2)}${pad(tile.tx, 2)}.map`;
}

/** Reads a .map file; undefined when it isn't one (or of another version). */
export function parseServerMap(bytes: Uint8Array): ServerMapTile | undefined {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 44 || view.getUint32(0, true) !== MAP_MAGIC || view.getUint32(4, true) !== MAP_VERSION) {
    return undefined;
  }
  const [areaOffset, , heightOffset, , liquidOffset, , holesOffset, holesSize] = [12, 16, 20, 24, 28, 32, 36, 40].map((at) =>
    view.getUint32(at, true),
  );
  const tile: ServerMapTile = {};
  if (areaOffset) {
    if (view.getUint16(areaOffset + 4, true) & AREA_NO_AREA) {
      tile.area = view.getUint16(areaOffset + 6, true);
    } else {
      tile.areas = new Uint16Array(256);
      for (let i = 0; i < 256; i++) {
        tile.areas[i] = view.getUint16(areaOffset + 8 + i * 2, true);
      }
    }
  }

  const flags = view.getUint32(heightOffset + 4, true);
  if (!(flags & HEIGHT_NO_HEIGHT)) {
    const base = view.getFloat32(heightOffset + 8, true);
    const max = view.getFloat32(heightOffset + 12, true);
    const count = V9_SIZE * V9_SIZE + V8_SIZE * V8_SIZE;
    const heights = new Float32Array(count);
    let at = heightOffset + 16;
    if (flags & HEIGHT_AS_INT8) {
      const step = (max - base) / 255;
      for (let i = 0; i < count; i++) {
        heights[i] = view.getUint8(at++) * step + base;
      }
    } else if (flags & HEIGHT_AS_INT16) {
      const step = (max - base) / 65535;
      for (let i = 0; i < count; i++, at += 2) {
        heights[i] = view.getUint16(at, true) * step + base;
      }
    } else {
      for (let i = 0; i < count; i++, at += 4) {
        heights[i] = view.getFloat32(at, true);
      }
    }
    tile.v9 = heights.subarray(0, V9_SIZE * V9_SIZE);
    tile.v8 = heights.subarray(V9_SIZE * V9_SIZE);
    if (holesSize) {
      tile.holes = new Uint16Array(256);
      for (let i = 0; i < Math.min(256, holesSize / 2); i++) {
        tile.holes[i] = view.getUint16(holesOffset + i * 2, true);
      }
    }
  }

  if (liquidOffset) {
    const liquidFlags = view.getUint8(liquidOffset + 4);
    const liquid: ServerMapLiquid = {
      types: new Uint8Array(256).fill(view.getUint8(liquidOffset + 5)),
      offsetX: view.getUint8(liquidOffset + 8),
      offsetY: view.getUint8(liquidOffset + 9),
      width: view.getUint8(liquidOffset + 10),
      height: view.getUint8(liquidOffset + 11),
      level: view.getFloat32(liquidOffset + 12, true),
    };
    let at = liquidOffset + 16;
    if (!(liquidFlags & LIQUID_NO_TYPE)) {
      // liquid entries (16 × 16 uint16), then the type bits (16 × 16 uint8)
      at += 512;
      liquid.types = bytes.slice(at, at + 256);
      at += 256;
    }
    if (!(liquidFlags & LIQUID_NO_HEIGHT)) {
      liquid.heights = new Float32Array(liquid.width * liquid.height);
      for (let i = 0; i < liquid.heights.length; i++, at += 4) {
        liquid.heights[i] = view.getFloat32(at, true);
      }
    }
    tile.liquid = liquid;
  }
  return tile;
}

/** The area id at a server position of a tile, like the server (`GridTerrainData::getArea`); 0 when unknown. */
export function serverAreaAt(tile: ServerMapTile, x: number, y: number): number {
  if (!tile.areas) {
    return tile.area ?? 0;
  }
  const lx = Math.floor(16 * (32 - x / TILE_SIZE)) & 15;
  const ly = Math.floor(16 * (32 - y / TILE_SIZE)) & 15;
  return tile.areas[lx * 16 + ly];
}

/** The terrain height at a server position of a tile (the nearest grid corner); undefined without terrain. */
export function serverHeightAt(tile: ServerMapTile, coord: TileCoord, x: number, y: number): number | undefined {
  if (!tile.v9) {
    return undefined;
  }
  const part = TILE_SIZE / (V9_SIZE - 1);
  const clamp = (value: number) => Math.min(V9_SIZE - 1, Math.max(0, Math.round(value)));
  const col = clamp(((32 - coord.tx) * TILE_SIZE - y) / part);
  const row = clamp(((32 - coord.ty) * TILE_SIZE - x) / part);
  return tile.v9[row * V9_SIZE + col];
}

/** ServerMapLiquid type bit of deep ("dark") water, where swimming players get fatigue. */
export const LIQUID_DARK_WATER = 0x10;

/**
 * The liquid at a server position of a tile, like the server (`GridTerrainData::GetLiquidData`): its surface height and
 * its type bits (1 water, 2 ocean, 4 magma, 8 slime, 16 dark water: fatigue); undefined where there is none.
 */
export function serverLiquidAt(tile: ServerMapTile, x: number, y: number): { level: number; types: number } | undefined {
  const liquid = tile.liquid;
  if (!liquid) {
    return undefined;
  }
  const lx = Math.floor(V8_SIZE * (32 - x / TILE_SIZE)) & (V8_SIZE - 1);
  const ly = Math.floor(V8_SIZE * (32 - y / TILE_SIZE)) & (V8_SIZE - 1);
  const types = liquid.types[(lx >> 3) * 16 + (ly >> 3)];
  // (the server reads the liquid's rows along x from its y offset, and the other way round)
  const [cx, cy] = [lx - liquid.offsetY, ly - liquid.offsetX];
  if (!types || cx < 0 || cx >= liquid.height || cy < 0 || cy >= liquid.width) {
    return undefined;
  }
  return { level: liquid.heights ? liquid.heights[cx * liquid.width + cy] : liquid.level, types };
}

/**
 * The terrain height at a server position of a tile, like the server (`GridTerrainData::getHeightFromFloat`): from the
 * four triangles of its square (corners and centre). Undefined without terrain. Holes aren't looked at.
 */
export function serverTerrainHeightAt(tile: ServerMapTile, x: number, y: number): number | undefined {
  const { v9, v8 } = tile;
  if (!v9 || !v8) {
    return undefined;
  }
  let fx = V8_SIZE * (32 - x / TILE_SIZE);
  let fy = V8_SIZE * (32 - y / TILE_SIZE);
  let xi = Math.floor(fx);
  let yi = Math.floor(fy);
  [fx, fy] = [fx - xi, fy - yi];
  [xi, yi] = [xi & (V8_SIZE - 1), yi & (V8_SIZE - 1)];
  const h = (row: number, col: number) => v9[row * V9_SIZE + col];
  const h5 = 2 * v8[xi * V8_SIZE + yi];
  let a: number;
  let b: number;
  let c: number;
  if (fx + fy < 1) {
    if (fx > fy) {
      [a, b, c] = [h(xi + 1, yi) - h(xi, yi), h5 - h(xi, yi) - h(xi + 1, yi), h(xi, yi)];
    } else {
      [a, b, c] = [h5 - h(xi, yi) - h(xi, yi + 1), h(xi, yi + 1) - h(xi, yi), h(xi, yi)];
    }
  } else if (fx > fy) {
    [a, b, c] = [h(xi + 1, yi) + h(xi + 1, yi + 1) - h5, h(xi + 1, yi + 1) - h(xi + 1, yi), h5 - h(xi + 1, yi + 1)];
  } else {
    [a, b, c] = [h(xi + 1, yi + 1) - h(xi, yi + 1), h(xi, yi + 1) + h(xi + 1, yi + 1) - h5, h5 - h(xi + 1, yi + 1)];
  }
  return a * fx + b * fy + c;
}
