import { Blp, BLP_COLOR_FORMAT, BLP_IMAGE_FORMAT, Map as WdtMap, MapArea } from '@wowserhq/format';
import { TILE_COUNT, TileCoord, WorldBounds } from './coords';
import { TerrainChunk } from './terrain-mesh';
import { findChunk } from './liquid';
import { ModelPlacement } from './wmo';

/** Thin adapters over `@wowserhq/format`, so the rest of the code only deals with plain data. */

export interface RgbaImage {
  width: number;
  height: number;
  /** RGBA, 8 bits per channel, row-major from the top-left corner. */
  data: Uint8Array;
}

/** `@wowserhq/io` reads from an ArrayBuffer; copy only when the bytes are a view on a larger buffer. */
export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const whole = bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength && bytes.buffer instanceof ArrayBuffer;
  return whole ? (bytes.buffer as ArrayBuffer) : bytes.slice().buffer;
}

export type LayerSplatDepth = 4 | 8;

export interface ParsedAdt {
  chunks: TerrainChunk[];
  /** Buildings (MODF). */
  wmos: ModelPlacement[];
  /** Trees, rocks and other props (MDDF). */
  doodads: ModelPlacement[];
}

/** MDDF scale is fixed point: 1024 = 1.0. */
const DOODAD_SCALE_UNIT = 1024;

/** `layerSplatDepth` must come from the map's WDT: parsing alpha maps with the wrong depth fails. */
export function parseAdt(bytes: Uint8Array, layerSplatDepth: LayerSplatDepth): ParsedAdt {
  const area = new MapArea(layerSplatDepth).load(toArrayBuffer(bytes));
  const doodadSets = buildingDoodadSets(bytes);
  return {
    chunks: area.chunks.map((chunk) => ({
      position: chunk.position,
      vertexHeights: chunk.vertexHeights,
      holes: chunk.holes,
      vertexNormals: chunk.vertexNormals,
      layers: chunk.layers.map((layer) => ({ texture: layer.texture, splat: layer.splat })),
    })),
    wmos: area.objDefs.map((def) => ({
      uniqueId: def.id,
      path: def.name,
      position: def.position,
      rotation: def.rotation,
      scale: 1,
      doodadSet: doodadSets.get(def.id) ?? 0,
    })),
    doodads: area.doodadDefs.map((def) => ({
      uniqueId: def.id,
      path: def.name,
      position: def.position,
      rotation: def.rotation,
      scale: def.scale / DOODAD_SCALE_UNIT,
    })),
  };
}

const MODF_ENTRY_SIZE = 64;
const MODF_UNIQUE_ID_OFFSET = 4;
const MODF_DOODAD_SET_OFFSET = 58;

/** Doodad set of each building (MODF), by unique id: read here as @wowserhq/format doesn't expose it. */
function buildingDoodadSets(bytes: Uint8Array): Map<number, number> {
  const sets = new Map<number, number>();
  const chunk = findChunk(bytes, 'MODF');
  if (chunk) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (let i = 0; i < Math.floor(chunk.size / MODF_ENTRY_SIZE); i++) {
      const at = chunk.offset + i * MODF_ENTRY_SIZE;
      sets.set(view.getUint32(at + MODF_UNIQUE_ID_OFFSET, true), view.getUint16(at + MODF_DOODAD_SET_OFFSET, true));
    }
  }
  return sets;
}

export function parseAdtChunks(bytes: Uint8Array, layerSplatDepth: LayerSplatDepth): TerrainChunk[] {
  return parseAdt(bytes, layerSplatDepth).chunks;
}

export interface WdtInfo {
  /** Tiles flagged as present (MAIN chunk is stored row by row: index = ty * 64 + tx). */
  tiles: TileCoord[];
  layerSplatDepth: LayerSplatDepth;
  /** The map's one building, for maps made of a single WMO instead of terrain (most dungeons and raids). */
  wmo?: ModelPlacement;
  /** Where that building stands (server x/y), and its lowest and highest points. */
  wmoBounds?: WorldBounds & { minZ: number; maxZ: number };
}

export function parseWdt(bytes: Uint8Array): WdtInfo {
  const wdt = new WdtMap().load(toArrayBuffer(bytes));
  const tiles: TileCoord[] = [];
  wdt.availableAreas.forEach((flag, index) => {
    if (flag) {
      tiles.push({ tx: index % TILE_COUNT, ty: Math.floor(index / TILE_COUNT) });
    }
  });
  const wmo = globalWmo(bytes);
  return { tiles, layerSplatDepth: wdt.layerSplatDepth, ...(wmo ?? {}) };
}

/** Half the size of the world: where placements' own axes start. */
const MAP_CORNER = 32 * (1600 / 3);

/**
 * The WDT's MWMO (its building's file name) and MODF (where it's placed), turned to server axes the way
 * `@wowserhq/format` turns the placements of ADTs (it doesn't read these two chunks of WDTs).
 */
function globalWmo(bytes: Uint8Array): { wmo: ModelPlacement; wmoBounds: WorldBounds & { minZ: number; maxZ: number } } | undefined {
  const name = findChunk(bytes, 'MWMO');
  const placement = findChunk(bytes, 'MODF');
  if (!name || !placement || name.size === 0 || placement.size < MODF_ENTRY_SIZE) {
    return undefined;
  }
  const raw = bytes.subarray(name.offset, name.offset + name.size);
  const end = raw.indexOf(0);
  const path = String.fromCharCode(...raw.subarray(0, end < 0 ? raw.length : end));
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const at = placement.offset;
  const float = (i: number) => view.getFloat32(at + 8 + i * 4, true);
  const values = Array.from({ length: 12 }, (_, i) => float(i));
  // like the client (and the server's vmap extractor): a building placed at 0, 0 sits in the middle of the map, so
  // it and its extents are moved there
  const shift = values[0] === 0 && values[2] === 0 ? MAP_CORNER : 0;
  const [px, py, pz, rx, ry, rz, minX, minY, minZ, maxX, maxY, maxZ] = values.map((value, i) =>
    [0, 2, 6, 8, 9, 11].includes(i) ? value + shift : value,
  );
  return {
    wmo: {
      uniqueId: view.getUint32(at + MODF_UNIQUE_ID_OFFSET, true),
      path,
      position: [MAP_CORNER - pz, MAP_CORNER - px, py],
      rotation: eulerQuaternion(rz, rx, ry + 180),
      scale: 1,
      doodadSet: view.getUint16(at + MODF_DOODAD_SET_OFFSET, true),
    },
    // the extents (corner to corner, in the placement's axes)
    wmoBounds: {
      minX: MAP_CORNER - maxZ,
      maxX: MAP_CORNER - minZ,
      minY: MAP_CORNER - maxX,
      maxY: MAP_CORNER - minX,
      minZ: minY,
      maxZ: maxY,
    },
  };
}

/** gl-matrix's `quat.fromEuler` (degrees, z-y-x order), as used for ADT placements. */
function eulerQuaternion(x: number, y: number, z: number): number[] {
  const half = Math.PI / 360;
  const [sx, cx, sy, cy, sz, cz] = [x, y, z].flatMap((angle) => [Math.sin(angle * half), Math.cos(angle * half)]);
  return [sx * cy * cz - cx * sy * sz, cx * sy * cz + sx * cy * sz, cx * cy * sz - sx * sy * cz, cx * cy * cz + sx * sy * sz];
}

/**
 * A texture as the graphics card takes it: DXT-compressed BLPs keep their compressed mip levels (no decoding at all,
 * and a quarter to an eighth of the memory), the others are decoded to RGBA (their top level).
 */
export type GpuTexture =
  | { format: 'rgba'; width: number; height: number; data: Uint8Array }
  | {
      format: 'dxt1' | 'dxt1a' | 'dxt3' | 'dxt5';
      width: number;
      height: number;
      mips: { width: number; height: number; data: Uint8Array }[];
    };

export function decodeBlpForGpu(bytes: Uint8Array): GpuTexture {
  const blp = new Blp().load(toArrayBuffer(bytes));
  if (blp.colorFormat !== BLP_COLOR_FORMAT.COLOR_DXT) {
    const image = blp.getImage(0, BLP_IMAGE_FORMAT.IMAGE_ABGR8888);
    return { format: 'rgba', width: image.width, height: image.height, data: new Uint8Array(image.data) };
  }
  const mips = blp
    .getImages(0)
    .filter((image) => image.width > 0 && image.height > 0)
    .map((image) => ({ width: image.width, height: image.height, data: new Uint8Array(image.data) }));
  const kind = blp.getImage(0).format;
  const format =
    kind === BLP_IMAGE_FORMAT.IMAGE_DXT3 ? 'dxt3' : kind === BLP_IMAGE_FORMAT.IMAGE_DXT5 ? 'dxt5' : blp.alphaSize > 0 ? 'dxt1a' : 'dxt1';
  return { format, width: blp.width, height: blp.height, mips };
}

/** Decodes the top mip level of a BLP texture. ABGR8888 is laid out in memory as R, G, B, A bytes. */
export function decodeBlp(bytes: Uint8Array): RgbaImage {
  const blp = new Blp().load(toArrayBuffer(bytes));
  const image = blp.getImage(0, BLP_IMAGE_FORMAT.IMAGE_ABGR8888);
  return { width: image.width, height: image.height, data: new Uint8Array(image.data) };
}
