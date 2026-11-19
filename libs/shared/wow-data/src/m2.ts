import { CollisionMesh, parseM2Collision } from './collision';
import { M2_VERTEX_SHADER, M2Model, M2SkinProfile } from '@wowserhq/format';
import { toArrayBuffer } from './formats';
import { M2SequenceRef, M2Skeleton, parseM2Skeleton } from './m2-animation';

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
  /**
   * How opaque the game draws it (0..1): its texture weight times its colour's alpha, at the start of its first
   * animation. 0 for the parts the game never shows: invisible walls, the boxes of smoke and particle emitters.
   */
  alpha: number;
}

/** A static M2 model (doodad, creature, gameobject) in local scene axes, in its bind pose. */
export interface M2Mesh {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint16Array;
  batches: M2BatchInfo[];
  /** What the server collides with (empty for most small props). */
  collision: CollisionMesh;
  /** Where things attach (helmet, shoulders, hands…), in the bind pose, local scene axes. */
  attachments?: M2AttachmentPoint[];
}

export interface M2AttachmentPoint {
  /** M2Attachment.id: 11 head, 5 / 6 right / left shoulder, 1 / 2 right / left hand, 0 shield… */
  id: number;
  /** The bone it follows. */
  bone: number;
  position: [number, number, number];
}

/** WotLK M2 header: attachments (count + offset); each is 40 bytes: id, bone, unknown, position, animate track. */
const M2_ATTACHMENTS = 0xf0;
const ATTACHMENT_SIZE = 40;

/** The attachment points of an M2 (none when the file is too short for them). */
export function parseM2Attachments(bytes: Uint8Array): M2AttachmentPoint[] {
  if (bytes.length < M2_ATTACHMENTS + 8) {
    return [];
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const [count, offset] = [view.getUint32(M2_ATTACHMENTS, true), view.getUint32(M2_ATTACHMENTS + 4, true)];
  if (offset + count * ATTACHMENT_SIZE > bytes.length) {
    return [];
  }
  return Array.from({ length: count }, (_, i) => {
    const at = offset + i * ATTACHMENT_SIZE;
    const [x, y, z] = [8, 12, 16].map((field) => view.getFloat32(at + field, true));
    // (server axes to scene axes: (x, y, z) → (−y, z, −x))
    return { id: view.getUint32(at, true), bone: view.getUint16(at + 4, true), position: [-y, z, -x] as [number, number, number] };
  });
}

const VERTEX_STRIDE = 48;
const NORMAL_OFFSET = 20;
const UV_OFFSET = 32;
const MATERIAL_UNLIT = 0x1;
const MATERIAL_TWO_SIDED = 0x4;
/** Fixed-point alpha of texture weights and colours: 32767 = opaque. */
const MAX_ALPHA = 0x7fff;
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

  // (a track's first key of its first animation, or the fallback without any)
  const firstKey = (track: { sequenceKeys: ArrayLike<number>[] } | undefined, fallback: number): number => {
    const keys = track?.sequenceKeys[0];
    return keys && keys.length > 0 ? keys[0] : fallback;
  };
  const alphaOf = (batch: { textureWeightIndex: number; colorIndex: number }): number => {
    const weight = firstKey(model.textureWeights?.[batch.textureWeightIndex]?.weightTrack, MAX_ALPHA) / MAX_ALPHA;
    const color = firstKey(model.colors?.[batch.colorIndex]?.alphaTrack, MAX_ALPHA) / MAX_ALPHA;
    return Math.min(1, Math.max(0, weight * color));
  };

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
        alpha: alphaOf(batch),
      };
    });

  return {
    positions,
    normals,
    uvs,
    indices: Uint16Array.from(skin.indices),
    batches,
    collision: parseM2Collision(modelBytes),
    attachments: parseM2Attachments(modelBytes),
  };
}

/** The skeleton and animations of a model, from its files (the skin maps its vertices to the model's). */
export function parseM2SkeletonFiles(
  modelBytes: Uint8Array,
  skinBytes: Uint8Array,
  refs: M2SequenceRef[],
  anims: Map<number, Uint8Array>,
): M2Skeleton | undefined {
  const model = new M2Model().load(toArrayBuffer(modelBytes));
  const skin = new M2SkinProfile(model).load(toArrayBuffer(skinBytes));
  return parseM2Skeleton(modelBytes, skin.vertices, refs, anims);
}
