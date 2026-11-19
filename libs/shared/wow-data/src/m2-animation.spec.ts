import { ANIM_STAND, ANIM_WALK, m2AnimPath, m2Sequences, parseM2Skeleton } from './m2-animation';

/** A little-endian buffer written at offsets, growing as needed. */
class Writer {
  bytes = new Uint8Array(0x400);
  private view = new DataView(this.bytes.buffer);
  u16(at: number, v: number): this {
    this.view.setUint16(at, v, true);
    return this;
  }
  i16(at: number, v: number): this {
    this.view.setInt16(at, v, true);
    return this;
  }
  u32(at: number, v: number): this {
    this.view.setUint32(at, v, true);
    return this;
  }
  f32(at: number, v: number): this {
    this.view.setFloat32(at, v, true);
    return this;
  }
  u8(at: number, v: number): this {
    this.view.setUint8(at, v);
    return this;
  }
}

/**
 * A model with 2 bones (the second a child of the first), 1 vertex, a global loop of 500 ms and two sequences:
 * stand (embedded keys) and walk (in an .anim), plus an alias of walk as variation 0 of id 5.
 */
function model() {
  const w = new Writer();
  // header: loops, sequences, bones, vertices
  w.u32(0x14, 1).u32(0x18, 0x100).u32(0x100, 500);
  w.u32(0x1c, 3).u32(0x20, 0x110);
  const seq = (i: number, id: number, duration: number, flags: number, alias = 0) =>
    w
      .u16(0x110 + i * 64, id)
      .u16(0x112 + i * 64, 0)
      .u32(0x114 + i * 64, duration)
      .u32(0x11c + i * 64, flags)
      .u16(0x14e + i * 64, alias);
  seq(0, ANIM_STAND, 1000, 0x20);
  seq(1, ANIM_WALK, 800, 0);
  seq(2, 5, 0, 0x40, 1);
  w.u32(0x2c, 2).u32(0x30, 0x200);
  // bone 0: no parent, translation track with keys per sequence; bone 1: child, rotation on a global loop
  w.i16(0x208, -1)
    .f32(0x200 + 76, 1)
    .f32(0x200 + 80, 2)
    .f32(0x200 + 84, 3);
  const track = (at: number, global: number, times: number, values: number) =>
    w
      .i16(at + 2, global)
      .u32(at + 4, 2)
      .u32(at + 8, times)
      .u32(at + 12, 2)
      .u32(at + 16, values);
  track(0x200 + 16, -1, 0x300, 0x320);
  // times / values lists: [stand: 1 key in the model at 0x340 / 0x350] [walk: in the .anim at 0 / 8]
  w.u32(0x300, 1).u32(0x304, 0x340).u32(0x308, 1).u32(0x30c, 0);
  w.u32(0x320, 1).u32(0x324, 0x350).u32(0x328, 1).u32(0x32c, 8);
  w.u32(0x340, 0).f32(0x350, 1).f32(0x354, 2).f32(0x358, 3);
  w.i16(0x258 + 8, 0);
  track(0x258 + 36, 0, 0x360, 0x370);
  w.u32(0x360, 1).u32(0x364, 0x380);
  w.u32(0x370, 1).u32(0x374, 0x390);
  w.u32(0x380, 0).i16(0x390, 32767).i16(0x392, -32768).i16(0x394, 0).i16(0x396, -1);
  // bone 1's scale: stand only (walk has no list), keys at 0x3e0 / 0x3f0
  track(0x258 + 56, -1, 0x3d0, 0x3d8);
  // (one list each: the stand's)
  w.u32(0x258 + 56 + 4, 1).u32(0x258 + 56 + 12, 1);
  w.u32(0x3d0, 1).u32(0x3d4, 0x3e0).u32(0x3d8, 1).u32(0x3dc, 0x3f0);
  w.u32(0x3e0, 0).f32(0x3f0, 1).f32(0x3f4, 2).f32(0x3f8, 3);
  // one vertex at 0x3c0: weights 255 / 0…, bone 1
  w.u32(0x3c, 1).u32(0x40, 0x3a0);
  w.u8(0x3a0 + 12, 255).u8(0x3a0 + 16, 1);
  return w.bytes;
}

function anim() {
  const w = new Writer();
  w.u32(0, 100).f32(8, 4).f32(12, 5).f32(16, 6);
  return w.bytes;
}

describe('m2-animation', () => {
  it('finds the animations asked for, following aliases, and where their keys are', () => {
    expect(m2Sequences(model())).toEqual([
      { index: 0, id: 0, fileId: 0, variation: 0, external: false },
      { index: 1, id: 4, fileId: 4, variation: 0, external: true },
    ]);
    expect(m2Sequences(model(), [5])).toEqual([{ index: 1, id: 5, fileId: 4, variation: 0, external: true }]);
    expect(m2Sequences(model(), [9])).toEqual([]);
    // an alias to a sequence the model doesn't have
    const lost = model();
    new DataView(lost.buffer).setUint16(0x110 + 2 * 64 + 62, 40, true);
    expect(m2Sequences(lost, [5])).toEqual([]);
    expect(m2Sequences(new Uint8Array(8))).toEqual([]);
    const broken = model();
    new DataView(broken.buffer).setUint32(0x1c, 999, true);
    expect(m2Sequences(broken)).toEqual([]);
    expect(m2AnimPath('Character\\Human\\Male\\HumanMale.m2', { index: 1, id: 5, fileId: 4, variation: 0, external: true })).toBe(
      'Character\\Human\\Male\\HumanMale0004-00.anim',
    );
  });

  it('reads the bones, the skin weights and the keys, in scene axes', () => {
    const refs = m2Sequences(model());
    const skeleton = parseM2Skeleton(model(), [0], refs, new Map([[1, anim()]])) as NonNullable<ReturnType<typeof parseM2Skeleton>>;
    expect(Array.from(skeleton.parents)).toEqual([-1, 0]);
    expect(Array.from(skeleton.pivots.slice(0, 3))).toEqual([-2, 3, -1]);
    expect(Array.from(skeleton.boneIndices)).toEqual([1, 0, 0, 0]);
    expect(Array.from(skeleton.boneWeights)).toEqual([255, 0, 0, 0]);
    const [stand, walk] = skeleton.animations;
    expect(stand.duration).toBe(1000);
    expect(Array.from(stand.bones[0].translation?.values ?? [])).toEqual([-2, 3, -1]);
    // walk's keys from its .anim
    expect(Array.from(walk.bones[0].translation?.times ?? [])).toEqual([100]);
    expect(Array.from(walk.bones[0].translation?.values ?? [])).toEqual([-5, 6, -4]);
    // a global loop's rotation, unpacked
    const rotation = stand.bones[1].rotation;
    expect(rotation?.loop).toBe(500);
    expect(Array.from(rotation?.values ?? []).map((v) => Math.round(v * 100) / 100)).toEqual([-0, -1, -0, 1]);
    expect(Array.from(stand.bones[1].scale?.values ?? [])).toEqual([2, 3, 1]);
    expect(walk.bones[1].scale).toBeUndefined();
  });

  it('leaves out what it cannot read', () => {
    const refs = m2Sequences(model());
    // the walk without its .anim
    expect(parseM2Skeleton(model(), [0], refs, new Map())?.animations.map((a) => a.id)).toEqual([0]);
    // a vertex past the end: weighted to the first bone
    expect(Array.from(parseM2Skeleton(model(), [99], refs, new Map())?.boneWeights ?? [])).toEqual([255, 0, 0, 0]);
    expect(parseM2Skeleton(new Uint8Array(8), [], [], new Map())).toBeUndefined();
    const boneless = model();
    new DataView(boneless.buffer).setUint32(0x2c, 0, true);
    expect(parseM2Skeleton(boneless, [], [], new Map())).toBeUndefined();
    // a sequence beyond those the model has; a track with too few lists or keys out of the file
    const odd = model();
    const view = new DataView(odd.buffer);
    view.setUint32(0x30c, 9999, true);
    view.setUint32(0x204 + 4, 0, true);
    const skeleton = parseM2Skeleton(
      odd,
      [0],
      [...refs, { index: 7, id: 9, fileId: 9, variation: 0, external: false }],
      new Map([[1, anim()]]),
    );
    expect(skeleton?.animations.map((a) => a.id)).toEqual([0, 4]);
    expect(skeleton?.animations[1].bones[0].translation).toBeUndefined();
    // a global loop index the model doesn't have: its last key's time
    const loopless = model();
    new DataView(loopless.buffer).setUint32(0x14, 0, true);
    // (a loop table past the end of the file counts as none)
    const farLoops = model();
    new DataView(farLoops.buffer).setUint32(0x18, 0xfffff, true);
    expect(parseM2Skeleton(farLoops, [0], refs, new Map())?.animations[0].bones[1].rotation?.loop).toBe(0);
    expect(parseM2Skeleton(loopless, [0], refs, new Map())?.animations[0].bones[1].rotation?.loop).toBe(0);
  });
});
