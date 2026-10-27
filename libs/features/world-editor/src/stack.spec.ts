import { ModelBox } from '@keira/shared/world-viewer';
import { stackPosition, StackSide, STACK_SIDES } from './stack';

const BOX: ModelBox = { min: [-1, -0.5, 0], max: [1, 0.5, 2] };
const round = (p: { x: number; y: number; z: number }) => ({ x: +p.x.toFixed(4), y: +p.y.toFixed(4), z: +p.z.toFixed(4) });

describe('stackPosition', () => {
  const at = { x: 10, y: 20, z: 30, o: 0 };

  it('puts the copy one box size away on each side of an object facing north', () => {
    const expected: Record<StackSide, { x: number; y: number; z: number }> = {
      front: { x: 12, y: 20, z: 30 },
      behind: { x: 8, y: 20, z: 30 },
      left: { x: 10, y: 21, z: 30 },
      right: { x: 10, y: 19, z: 30 },
      above: { x: 10, y: 20, z: 32 },
      below: { x: 10, y: 20, z: 28 },
    };
    for (const { side } of STACK_SIDES) {
      expect(round(stackPosition(at, BOX, side))).toEqual(expected[side]);
    }
  });

  it('follows the facing, and the full rotation of a tilted gameobject', () => {
    expect(round(stackPosition({ ...at, o: Math.PI / 2 }, BOX, 'front'))).toEqual({ x: 10, y: 22, z: 30 });
    // an all-zero quaternion means "use the orientation"
    expect(round(stackPosition({ ...at, o: Math.PI / 2, rotation: [0, 0, 0, 0] }, BOX, 'front'))).toEqual({ x: 10, y: 22, z: 30 });
    // tipped over 90° around x: its top points to −y
    const tipped = { ...at, rotation: [Math.SQRT1_2, 0, 0, Math.SQRT1_2] as [number, number, number, number] };
    expect(round(stackPosition(tipped, BOX, 'above'))).toEqual({ x: 10, y: 18, z: 30 });
  });
});
