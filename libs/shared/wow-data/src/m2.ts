import { M2_VERTEX_SHADER, M2Model, M2SkinProfile } from '@wowserhq/format';
import { toArrayBuffer } from './formats';

/** How a batch is blended with what's behind it (M2_MATERIAL_BLEND). */
export enum M2Blend {
  Opaque = 0,
  AlphaKey = 1,
  Alpha = 2,
  NoAlphaAdd = 3,
  Add = 4,
  Mod = 5,
  Mod2x = 6,
}

export interface M2BatchInfo {
  /** First index and index count in `indices`. */
  start: number;
  count: number;
  /** Texture file, or undefined for a texture picked at runtime (creature skin, hair…): see `textureType`. */
  texture?: string;
  /** M2_TEXTURE_COMPONENT: 0 for a hardcoded file, otherwise the replaceable slot (e.g. 11..13 = creature skins). */
  textureType: number;
  blend: M2Blend;
  /** Skin section id: on character models, the geoset (hair style, ears, sleeves…) the batch belongs to. */
  geoset: number;
  twoSided: boolean;
  unlit: boolean;
}

/** A static M2 model (doodad, creature, gameobject) in local scene axes, in its bind pose. */
export interface M2Mesh {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint16Array;
  batches: M2BatchInfo[];
}

const VERTEX_STRIDE = 48;
const NORMAL_OFFSET = 20;
const UV_OFFSET = 32;
const MATERIAL_UNLIT = 0x1;
const MATERIAL_TWO_SIDED = 0x4;
/** Batches whose first texture stage is a reflection (environment map): they need a shader we don't have. */
const ENVIRONMENT_FIRST = new Set([M2_VERTEX_SHADER.VERTEX_ENV, M2_VERTEX_SHADER.VERTEX_ENV_T2, M2_VERTEX_SHADER.VERTEX_ENV_ENV]);

/** ADTs and DBCs still name models `.mdx`/`.mdl` (their pre-release format); the files are `.m2`. */
export function m2Path(path: string): string {
  return path.replace(/\.(mdx|mdl|m2)$/i, '.m2');
}

/** `Foo\Bar.m2` → `Foo\Bar00.skin` (the highest level of detail). */
export function m2SkinPath(path: string): string {
  return `${m2Path(path).slice(0, -3)}00.skin`;
}

export function parseM2(modelBytes: Uint8Array, skinBytes: Uint8Array): M2Mesh {
  const model = new M2Model().load(toArrayBuffer(modelBytes));
  const skin = new M2SkinProfile(model).load(toArrayBuffer(skinBytes));
  const view = new DataView(model.vertices);
  const vertexCount = skin.vertices.length;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);

  for (let i = 0; i < vertexCount; i++) {
    const base = skin.vertices[i] * VERTEX_STRIDE;
    // model axes are server axes: (x, y, z) → scene (−y, z, −x)
    positions[i * 3] = -view.getFloat32(base + 4, true);
    positions[i * 3 + 1] = view.getFloat32(base + 8, true);
    positions[i * 3 + 2] = -view.getFloat32(base, true);
    normals[i * 3] = -view.getFloat32(base + NORMAL_OFFSET + 4, true);
    normals[i * 3 + 1] = view.getFloat32(base + NORMAL_OFFSET + 8, true);
    normals[i * 3 + 2] = -view.getFloat32(base + NORMAL_OFFSET, true);
    uvs[i * 2] = view.getFloat32(base + UV_OFFSET, true);
    uvs[i * 2 + 1] = view.getFloat32(base + UV_OFFSET + 4, true);
  }

  const batches = skin.batches
    .filter((batch) => !ENVIRONMENT_FIRST.has(batch.vertexShader) && batch.skinSection.indexCount > 0)
    .map((batch) => {
      const texture = batch.textures[0];
      return {
        start: batch.skinSection.indexStart,
        count: batch.skinSection.indexCount,
        texture: texture?.component === 0 && texture.filename ? texture.filename : undefined,
        textureType: texture?.component ?? 0,
        blend: batch.material.blend as number as M2Blend,
        geoset: batch.skinSection.id,
        twoSided: (batch.material.flags & MATERIAL_TWO_SIDED) !== 0,
        unlit: (batch.material.flags & MATERIAL_UNLIT) !== 0,
      };
    });

  return { positions, normals, uvs, indices: Uint16Array.from(skin.indices), batches };
}
