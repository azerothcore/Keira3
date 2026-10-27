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
