/**
 * Bones and animations of an M2 (the parts the editor plays: standing and walking), read straight from the file:
 * WotLK keeps most animations' keyframes in separate `.anim` files, which the model's tracks point into.
 */

/** M2Sequence ids the editor plays. */
export const ANIM_STAND = 0;
export const ANIM_WALK = 4;

/** Keyframes of one bone's translation, rotation or scale for one animation; values in scene axes (3 or 4 a key). */
export interface M2Keys {
  times: Uint32Array;
  values: Float32Array;
  /** A global sequence's length (ms): the track loops on its own, whatever animation plays. */
  loop?: number;
}

export interface M2BoneKeys {
  translation?: M2Keys;
  rotation?: M2Keys;
  scale?: M2Keys;
}

export interface M2Animation {
  id: number;
  /** ms */
  duration: number;
  /** One per bone. */
  bones: M2BoneKeys[];
}

/** What it takes to pose and animate a model: its bones and, per vertex of its skin, the bones moving it. */
export interface M2Skeleton {
  /** Parent of each bone (−1: none); parents always come before their children. */
  parents: Int16Array;
  /** Pivot of each bone, scene axes (3 a bone). */
  pivots: Float32Array;
  /** Per skin vertex: 4 bone indices and 4 weights (0..255, summing to 255). */
  boneIndices: Uint16Array;
  boneWeights: Uint8Array;
  animations: M2Animation[];
}

/** An animation the model has, and whether its keyframes are in an `.anim` file. */
export interface M2SequenceRef {
  index: number;
  /** The animation asked for. */
  id: number;
  /** The id and variation of the sequence it plays (another one for an alias): its .anim file's name. */
  fileId: number;
  variation: number;
  external: boolean;
}

// WotLK M2 header fields (count + offset pairs)
const HEADER_LOOPS = 0x14;
const HEADER_SEQUENCES = 0x1c;
const HEADER_BONES = 0x2c;
const HEADER_VERTICES = 0x3c;
const SEQUENCE_SIZE = 64;
const BONE_SIZE = 88;
const VERTEX_SIZE = 48;
/** M2Sequence.flags: keyframes in the .m2 itself; an alias of the sequence at `aliasNext`. */
const SEQUENCE_EMBEDDED = 0x20;
const SEQUENCE_ALIAS = 0x40;

const array = (view: DataView, at: number): [number, number] => [view.getUint32(at, true), view.getUint32(at + 4, true)];
const viewOf = (bytes: Uint8Array) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

/** The first variation of each of the given animations (following aliases); missing ones are left out. */
export function m2Sequences(model: Uint8Array, ids: number[] = [ANIM_STAND, ANIM_WALK]): M2SequenceRef[] {
  if (model.length < HEADER_VERTICES + 8) {
    return [];
  }
  const view = viewOf(model);
  const [count, offset] = array(view, HEADER_SEQUENCES);
  if (offset + count * SEQUENCE_SIZE > model.length) {
    return [];
  }
  const at = (i: number) => offset + i * SEQUENCE_SIZE;
  const refs: M2SequenceRef[] = [];
  for (const id of ids) {
    let index = Array.from({ length: count }, (_, i) => i).find(
      (i) => view.getUint16(at(i), true) === id && view.getUint16(at(i) + 2, true) === 0,
    );
    // (an alias plays another sequence's keyframes; at most a few hops)
    for (let hops = 0; index !== undefined && hops < 4 && view.getUint32(at(index) + 12, true) & SEQUENCE_ALIAS; hops++) {
      const next = view.getUint16(at(index) + 62, true);
      index = next < count ? next : undefined;
    }
    if (index !== undefined) {
      refs.push({
        index,
        id,
        fileId: view.getUint16(at(index), true),
        variation: view.getUint16(at(index) + 2, true),
        external: (view.getUint32(at(index) + 12, true) & SEQUENCE_EMBEDDED) === 0,
      });
    }
  }
  return refs;
}

/** The `.anim` file of a model's animation: `Character\Human\Male\HumanMale0004-00.anim`. */
export function m2AnimPath(modelPath: string, ref: M2SequenceRef): string {
  return `${modelPath.replace(/\.(m2|mdx|mdl)$/i, '')}${String(ref.fileId).padStart(4, '0')}-${String(ref.variation).padStart(2, '0')}.anim`;
}

/** Compressed quaternion component (int16) to a float. */
const unpackQuat = (value: number): number => (value < 0 ? value + 32768 : value - 32767) / 32767;

/**
 * The skeleton of a model with the animations asked for (`refs`, their `.anim` files in `anims` by sequence index).
 * `skinVertices` maps the skin's vertices to the model's (M2SkinProfile.vertices). Undefined without bones.
 */
export function parseM2Skeleton(
  model: Uint8Array,
  skinVertices: ArrayLike<number>,
  refs: M2SequenceRef[],
  anims: Map<number, Uint8Array>,
): M2Skeleton | undefined {
  if (model.length < HEADER_VERTICES + 8) {
    return undefined;
  }
  const view = viewOf(model);
  const [boneCount, boneOffset] = array(view, HEADER_BONES);
  const [, vertexOffset] = array(view, HEADER_VERTICES);
  if (boneCount === 0 || boneOffset + boneCount * BONE_SIZE > model.length) {
    return undefined;
  }
  const [loopCount, loopOffset] = array(view, HEADER_LOOPS);
  const loops = Array.from({ length: loopOffset + loopCount * 4 <= model.length ? loopCount : 0 }, (_, i) =>
    view.getUint32(loopOffset + i * 4, true),
  );
  const parents = new Int16Array(boneCount);
  const pivots = new Float32Array(boneCount * 3);
  for (let b = 0; b < boneCount; b++) {
    const at = boneOffset + b * BONE_SIZE;
    parents[b] = view.getInt16(at + 8, true);
    const [x, y, z] = [76, 80, 84].map((field) => view.getFloat32(at + field, true));
    pivots.set([-y, z, -x], b * 3);
  }
  const boneIndices = new Uint16Array(skinVertices.length * 4);
  const boneWeights = new Uint8Array(skinVertices.length * 4);
  for (let i = 0; i < skinVertices.length; i++) {
    const at = vertexOffset + skinVertices[i] * VERTEX_SIZE;
    if (at + VERTEX_SIZE > model.length) {
      boneWeights[i * 4] = 255;
      continue;
    }
    for (let k = 0; k < 4; k++) {
      boneWeights[i * 4 + k] = view.getUint8(at + 12 + k);
      boneIndices[i * 4 + k] = Math.min(view.getUint8(at + 16 + k), boneCount - 1);
    }
  }

  // one track of a bone for the sequence: its keys, in the .m2 or the sequence's .anim
  const readTrack = (
    at: number,
    sequence: number,
    external: boolean,
    size: number,
    convert: (v: DataView, o: number) => number[],
  ): M2Keys | undefined => {
    const global = view.getInt16(at + 2, true);
    const index = global >= 0 ? 0 : sequence;
    const [timeLists, timeOffset] = array(view, at + 4);
    const [valueLists, valueOffset] = array(view, at + 12);
    if (
      index >= timeLists ||
      index >= valueLists ||
      timeOffset + timeLists * 8 > model.length ||
      valueOffset + valueLists * 8 > model.length
    ) {
      return undefined;
    }
    // (the sequences kept have their .anim when they need one)
    const source = global < 0 && external ? (anims.get(sequence) as Uint8Array) : model;
    const data = viewOf(source);
    const [keys, keysAt] = array(view, timeOffset + index * 8);
    const [values, valuesAt] = array(view, valueOffset + index * 8);
    const n = Math.min(keys, values);
    if (n === 0 || keysAt + n * 4 > source.length || valuesAt + n * size > source.length) {
      return undefined;
    }
    const times = new Uint32Array(n);
    const converted: number[] = [];
    for (let k = 0; k < n; k++) {
      times[k] = data.getUint32(keysAt + k * 4, true);
      converted.push(...convert(data, valuesAt + k * size));
    }
    return { times, values: Float32Array.from(converted), ...(global >= 0 ? { loop: loops[global] ?? times[n - 1] } : {}) };
  };
  const vec3 = (v: DataView, o: number) => [v.getFloat32(o, true), v.getFloat32(o + 4, true), v.getFloat32(o + 8, true)];
  // (server axes to scene axes: positions (x, y, z) → (−y, z, −x); scales keep their sign; quaternions like vectors)
  const translation = (v: DataView, o: number) => {
    const [x, y, z] = vec3(v, o);
    return [-y, z, -x];
  };
  const scale = (v: DataView, o: number) => {
    const [x, y, z] = vec3(v, o);
    return [y, z, x];
  };
  const rotation = (v: DataView, o: number) => {
    const [x, y, z, w] = [0, 2, 4, 6].map((field) => unpackQuat(v.getInt16(o + field, true)));
    return [-y, z, -x, w];
  };

  const [sequenceCount, sequenceOffset] = array(view, HEADER_SEQUENCES);
  const animations = refs
    .filter((ref) => ref.index < sequenceCount && (!ref.external || anims.has(ref.index)))
    .map((ref) => ({
      id: ref.id,
      duration: view.getUint32(sequenceOffset + ref.index * SEQUENCE_SIZE + 4, true),
      bones: Array.from({ length: boneCount }, (_, b) => {
        const at = boneOffset + b * BONE_SIZE;
        const keys: M2BoneKeys = {};
        const t = readTrack(at + 16, ref.index, ref.external, 12, translation);
        const r = readTrack(at + 36, ref.index, ref.external, 8, rotation);
        const s = readTrack(at + 56, ref.index, ref.external, 12, scale);
        if (t) keys.translation = t;
        if (r) keys.rotation = r;
        if (s) keys.scale = s;
        return keys;
      }),
    }));
  return { parents, pivots, boneIndices, boneWeights, animations };
}
