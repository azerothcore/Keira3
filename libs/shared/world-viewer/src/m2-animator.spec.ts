import { Matrix4, Quaternion, Vector3 } from 'three';
import { M2Animator } from './m2-animator';

const skeleton = {
  parents: new Int16Array([-1, 0]),
  pivots: new Float32Array([0, 0, 0, 0, 1, 0]),
  boneIndices: new Uint16Array(0),
  boneWeights: new Uint8Array(0),
  animations: [],
};
const keys = (times: number[], values: number[], loop?: number) => ({
  times: Uint32Array.from(times),
  values: Float32Array.from(values),
  ...(loop ? { loop } : {}),
});
const where = (matrix: Matrix4, point: Vector3) =>
  point
    .clone()
    .applyMatrix4(matrix)
    .toArray()
    .map((v) => Math.round(v * 1000) / 1000);

describe('M2Animator', () => {
  it('poses the bones by their keys, interpolated, around their pivots and their parents', () => {
    const quarter = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
    const animator = new M2Animator(skeleton, {
      id: 0,
      duration: 1000,
      bones: [
        { translation: keys([0, 1000], [0, 0, 0, 10, 0, 0]) },
        { rotation: keys([0], [quarter.x, quarter.y, quarter.z, quarter.w]), scale: keys([0, 500, 1000], [1, 1, 1, 2, 2, 2, 1, 1, 1]) },
      ],
    });
    expect(animator.skeleton.bones).toHaveLength(2);
    animator.update(500);
    // the root moved halfway; the child turned a quarter around its pivot (0, 1, 0) and doubled
    expect(where(animator.boneMatrix(0), new Vector3())).toEqual([5, 0, 0]);
    expect(where(animator.boneMatrix(1), new Vector3(1, 1, 0))).toEqual([5, 3, 0]);
    // before the first key, after the last, looping over the animation
    animator.update(1000);
    expect(where(animator.boneMatrix(0), new Vector3())).toEqual([0, 0, 0]);
    animator.update(250);
    expect(where(animator.boneMatrix(0), new Vector3())).toEqual([2.5, 0, 0]);
    expect(animator.boneMatrix(9)).toBe(animator.boneMatrix(1));
    animator.dispose();
  });

  it('plays global loops on their own, and holds the bind pose without an animation', () => {
    const animator = new M2Animator(skeleton, {
      id: 0,
      duration: 1000,
      bones: [{ translation: keys([0, 100], [0, 0, 0, 0, 10, 0], 200) }, {}],
    });
    animator.update(150);
    expect(where(animator.boneMatrix(0), new Vector3())).toEqual([0, 10, 0]);
    animator.update(250);
    expect(where(animator.boneMatrix(0), new Vector3())).toEqual([0, 5, 0]);
    const still = new M2Animator(skeleton, undefined);
    still.update(500);
    expect(where(still.boneMatrix(1), new Vector3(1, 2, 3))).toEqual([1, 2, 3]);
  });
});
