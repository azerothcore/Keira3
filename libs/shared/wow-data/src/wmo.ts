import { MapObj, MapObjGroup } from '@wowserhq/format';
import { toArrayBuffer } from './formats';
import { findChunk } from './liquid';

/** A model placed by an ADT (MODF for buildings, MDDF for doodads), in server space. */
export interface ModelPlacement {
  /** Unique per placement across the map: the same building is listed by every ADT it overlaps. */
  uniqueId: number;
  path: string;
  /** Server coordinates (x north, y west, z up). */
  position: number[];
  /** Rotation quaternion [x, y, z, w] in server axes. */
  rotation: number[];
  scale: number;
  /** Buildings (MODF): which of its doodad sets (furniture variants) the building shows besides the default set 0. */
  doodadSet?: number;
}

/** A model placed inside a building (MODD), in the building's own axes (server-like: x north, y west, z up). */
export interface WmoDoodad {
  path: string;
  position: number[];
  /** Quaternion [x, y, z, w]. */
  rotation: number[];
  scale: number;
}

/** A building's doodads (barrels, tables, lamps…) and its doodad sets: ranges of them shown together (MODS). */
export interface WmoDoodads {
  sets: { start: number; count: number }[];
  doodads: WmoDoodad[];
}

export interface WmoMaterialInfo {
  texture?: string;
  twoSided: boolean;
  unlit: boolean;
  /** MOMT blend mode: 0 opaque, 1 alpha-keyed (cut-out), 2 alpha blended, 3+ additive/modulated. */
  blend: number;
}

/** A WMO group's geometry in local scene axes (x = −y, y = z, z = −x), ready to be placed. */
export interface WmoGroupMesh {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  /** Baked vertex lighting (RGB, 0..1) of indoor groups. */
  colors?: Float32Array;
  indices: Uint16Array;
  batches: { start: number; count: number; material: number }[];
  indoor: boolean;
}

export interface WmoModel {
  materials: WmoMaterialInfo[];
  groups: WmoGroupMesh[];
}

const MATERIAL_UNLIT = 0x1;
const MATERIAL_TWO_SIDED = 0x4;
const GROUP_INDOOR = 0x2000;

/** `World\wmo\Foo\Bar.wmo` → `World\wmo\Foo\Bar_003.wmo`. */
export function wmoGroupPath(rootPath: string, index: number): string {
  return `${rootPath.replace(/\.wmo$/i, '')}_${String(index).padStart(3, '0')}.wmo`;
}

/** Copies server-axis xyz triples into scene axes: (x, y, z) → (−y, z, −x). */
export function toSceneAxes(values: ArrayLike<number>): Float32Array {
  const out = new Float32Array(values.length);
  for (let i = 0; i + 2 < values.length; i += 3) {
    out[i] = -values[i + 1];
    out[i + 1] = values[i + 2];
    out[i + 2] = -values[i];
  }
  return out;
}

/** Size of a MOMT entry; its blend mode is the third uint32. */
const MOMT_ENTRY_SIZE = 64;
const MOMT_BLEND_OFFSET = 8;

/** Blend modes of the root's materials, read from MOMT (@wowserhq/format doesn't expose them). */
function materialBlendModes(bytes: Uint8Array): number[] {
  const chunk = findChunk(bytes, 'MOMT');
  if (!chunk) {
    return [];
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const count = Math.floor(chunk.size / MOMT_ENTRY_SIZE);
  return Array.from({ length: count }, (_, i) => view.getUint32(chunk.offset + i * MOMT_ENTRY_SIZE + MOMT_BLEND_OFFSET, true));
}

export function parseWmoRoot(bytes: Uint8Array): { materials: WmoMaterialInfo[]; groups: { indoor: boolean }[]; flags: number } {
  const root = new MapObj().load(toArrayBuffer(bytes));
  const blends = materialBlendModes(bytes);
  return {
    flags: root.flags,
    materials: root.materials.map((material, i) => ({
      texture: material.textures[0],
      twoSided: (material.flags & MATERIAL_TWO_SIDED) !== 0,
      unlit: (material.flags & MATERIAL_UNLIT) !== 0,
      blend: blends[i] ?? 0,
    })),
    groups: root.groupInfo.map((info) => ({ indoor: (info.flags & GROUP_INDOOR) !== 0 })),
  };
}

/** Root flag telling that vertex colours need no fix-up. */
const ROOT_CVERTS_FIXED = 0x8;

function loadGroup(bytes: Uint8Array, rootFlags: number): MapObjGroup {
  try {
    return new MapObjGroup(rootFlags).load(toArrayBuffer(bytes));
  } catch {
    // @wowserhq/format's vertex colour fix-up reads past the batch list for groups made only of "trans" batches;
    // skipping the fix-up keeps the group (with slightly different baked lighting).
    return new MapObjGroup(rootFlags | ROOT_CVERTS_FIXED).load(toArrayBuffer(bytes));
  }
}

export function parseWmoGroup(bytes: Uint8Array, rootFlags: number, indoor: boolean): WmoGroupMesh {
  const group = loadGroup(bytes, rootFlags);
  const vertexCount = group.vertices.length / 3;
  let colors: Float32Array | undefined;
  if (indoor && group.colors && group.colors.length >= vertexCount * 4) {
    // MOCV is BGRA
    colors = new Float32Array(vertexCount * 3);
    for (let i = 0; i < vertexCount; i++) {
      colors[i * 3] = group.colors[i * 4 + 2] / 255;
      colors[i * 3 + 1] = group.colors[i * 4 + 1] / 255;
      colors[i * 3 + 2] = group.colors[i * 4] / 255;
    }
  }
  return {
    positions: toSceneAxes(group.vertices),
    normals: toSceneAxes(group.normals ?? new Float32Array(group.vertices.length)),
    uvs: group.textureCoords ? Float32Array.from(group.textureCoords) : new Float32Array(vertexCount * 2),
    colors,
    indices: Uint16Array.from(group.indices ?? []),
    batches: group.batches.map((batch) => ({ start: batch.indexStart, count: batch.indexCount, material: batch.materialIndex })),
    indoor,
  };
}

const MODS_ENTRY_SIZE = 32;
const MODS_START_OFFSET = 20;
const MODD_ENTRY_SIZE = 40;
const MODD_NAME_MASK = 0xffffff;

/** Reads the doodad sets (MODS), names (MODN) and placements (MODD) of a WMO root file. */
export function parseWmoDoodads(bytes: Uint8Array): WmoDoodads {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const sets: WmoDoodads['sets'] = [];
  const mods = findChunk(bytes, 'MODS');
  for (let i = 0; mods && i < Math.floor(mods.size / MODS_ENTRY_SIZE); i++) {
    const at = mods.offset + i * MODS_ENTRY_SIZE + MODS_START_OFFSET;
    sets.push({ start: view.getUint32(at, true), count: view.getUint32(at + 4, true) });
  }
  const modn = findChunk(bytes, 'MODN');
  const name = (offset: number): string => {
    if (!modn || offset >= modn.size) {
      return '';
    }
    const start = modn.offset + offset;
    let end = start;
    while (end < modn.offset + modn.size && bytes[end] !== 0) {
      end++;
    }
    return String.fromCharCode(...bytes.subarray(start, end));
  };
  const doodads: WmoDoodad[] = [];
  const modd = findChunk(bytes, 'MODD');
  for (let i = 0; modd && i < Math.floor(modd.size / MODD_ENTRY_SIZE); i++) {
    const at = modd.offset + i * MODD_ENTRY_SIZE;
    const float = (index: number): number => view.getFloat32(at + 4 + index * 4, true);
    doodads.push({
      path: name(view.getUint32(at, true) & MODD_NAME_MASK),
      position: [float(0), float(1), float(2)],
      rotation: [float(3), float(4), float(5), float(6)],
      scale: float(7),
    });
  }
  return { sets, doodads };
}

/** Hamilton product a × b of [x, y, z, w] quaternions. */
function multiplyQuaternions(a: number[], b: number[]): number[] {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

function rotateVector(q: number[], v: number[]): number[] {
  const [x, y, z, w] = q;
  // t = 2 (q × v); v' = v + w t + q × t
  const tx = 2 * (y * v[2] - z * v[1]);
  const ty = 2 * (z * v[0] - x * v[2]);
  const tz = 2 * (x * v[1] - y * v[0]);
  return [v[0] + w * tx + (y * tz - z * ty), v[1] + w * ty + (z * tx - x * tz), v[2] + w * tz + (x * ty - y * tx)];
}

/**
 * The doodads a placed building shows (its default set 0 and its chosen set), placed in the world. Their unique ids
 * are negative, derived from the building's, so they never clash with the ADT's own doodads.
 */
export function wmoDoodadPlacements(building: ModelPlacement, info: WmoDoodads): ModelPlacement[] {
  const chosen = [...new Set([0, building.doodadSet ?? 0])].map((index) => info.sets[index]).filter((set) => !!set);
  const placements: ModelPlacement[] = [];
  for (const set of chosen) {
    for (let i = set.start; i < Math.min(set.start + set.count, info.doodads.length); i++) {
      const doodad = info.doodads[i];
      const offset = rotateVector(
        building.rotation,
        doodad.position.map((value) => value * building.scale),
      );
      placements.push({
        uniqueId: -(building.uniqueId * 100000 + i + 1),
        path: doodad.path,
        position: building.position.map((value, axis) => value + offset[axis]),
        rotation: multiplyQuaternions(building.rotation, doodad.rotation),
        scale: building.scale * doodad.scale,
      });
    }
  }
  return placements;
}
