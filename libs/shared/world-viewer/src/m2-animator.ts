import { M2Animation, M2Keys, M2Skeleton } from '@keira/shared/wow-data';
import { Bone, Matrix4, Quaternion, Skeleton, Vector3 } from 'three';

const scratch = {
  t: new Vector3(),
  s: new Vector3(),
  pivot: new Vector3(),
  q: new Quaternion(),
  q2: new Quaternion(),
  m: new Matrix4(),
  p: new Matrix4(),
};

/** The key before `time` in `keys` (binary search) and how far it is towards the next one (0..1). */
function keyAt(keys: M2Keys, time: number): [number, number, number] {
  const { times } = keys;
  const n = times.length;
  const t = keys.loop ? time % Math.max(1, keys.loop) : time;
  if (n === 1 || t <= times[0]) {
    return [0, 0, 0];
  }
  if (t >= times[n - 1]) {
    return [n - 1, n - 1, 0];
  }
  let low = 0;
  let high = n - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (times[mid] <= t) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return [low, high, (t - times[low]) / Math.max(1, times[high] - times[low])];
}

function vector(keys: M2Keys | undefined, time: number, fallback: number, out: Vector3): Vector3 {
  if (!keys) {
    return out.setScalar(fallback);
  }
  const [a, b, f] = keyAt(keys, time);
  const v = keys.values;
  const lerp = (k: number) => v[a * 3 + k] + (v[b * 3 + k] - v[a * 3 + k]) * f;
  return out.set(lerp(0), lerp(1), lerp(2));
}

function rotation(keys: M2Keys | undefined, time: number, out: Quaternion): Quaternion {
  if (!keys) {
    return out.identity();
  }
  const [a, b, f] = keyAt(keys, time);
  const v = keys.values;
  out.set(v[a * 4], v[a * 4 + 1], v[a * 4 + 2], v[a * 4 + 3]).normalize();
  return out.slerp(scratch.q2.set(v[b * 4], v[b * 4 + 1], v[b * 4 + 2], v[b * 4 + 3]).normalize(), f);
}

/**
 * Plays one animation of a model on a three.js skeleton shared by every copy of the model: each frame, the bones'
 * matrices map the model's bind pose straight to the pose at that time (`pivot · translation · rotation · scale ·
 * pivot⁻¹`, times the parent's), so the skinned meshes need no bind matrices of their own.
 */
export class M2Animator {
  readonly skeleton: Skeleton;
  private readonly bones: Bone[];
  private readonly worlds: Matrix4[];

  constructor(
    private readonly model: M2Skeleton,
    private readonly animation: M2Animation | undefined,
  ) {
    this.bones = Array.from({ length: model.parents.length }, () => new Bone());
    // (bones outside the scene: their matrixWorld is what's set here, never recomputed)
    this.bones.forEach((bone) => (bone.matrixAutoUpdate = false));
    this.worlds = this.bones.map((bone) => bone.matrixWorld);
    this.skeleton = new Skeleton(
      this.bones,
      this.bones.map(() => new Matrix4()),
    );
    this.update(0);
  }

  /** Poses the skeleton at `time` (ms, looping over the animation). */
  update(time: number): void {
    const { parents, pivots } = this.model;
    const duration = Math.max(1, this.animation?.duration ?? 1);
    const t = time % duration;
    for (let b = 0; b < this.bones.length; b++) {
      const keys = this.animation?.bones[b];
      const [px, py, pz] = [pivots[b * 3], pivots[b * 3 + 1], pivots[b * 3 + 2]];
      vector(keys?.translation, t, 0, scratch.t);
      vector(keys?.scale, t, 1, scratch.s);
      rotation(keys?.rotation, t, scratch.q);
      // pivot · (translation, rotation, scale) · pivot⁻¹
      const local = scratch.m
        .compose(scratch.t.add(scratch.pivot.set(px, py, pz)), scratch.q, scratch.s)
        .multiply(scratch.p.makeTranslation(-px, -py, -pz));
      const parent = parents[b];
      this.worlds[b].copy(parent >= 0 && parent < b ? this.worlds[parent] : IDENTITY).multiply(local);
    }
    this.skeleton.update();
  }

  /** The matrix of a bone now (to place what's attached to it). */
  boneMatrix(bone: number): Matrix4 {
    return this.worlds[Math.min(bone, this.worlds.length - 1)];
  }

  dispose(): void {
    this.skeleton.dispose();
  }
}

const IDENTITY = new Matrix4();
