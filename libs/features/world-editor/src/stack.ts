import { ModelBox } from '@keira/shared/world-viewer';
import { WorldPosition } from '@keira/shared/wow-data';
import { Quaternion } from './world-editor.model';

/** Where Stack puts the copy, seen from the object (its facing is the front). */
export type StackSide = 'above' | 'below' | 'left' | 'right' | 'front' | 'behind';

export const STACK_SIDES: { side: StackSide; icon: string; label: string }[] = [
  { side: 'above', icon: 'fa-arrow-up', label: 'WORLD_EDITOR.STACK_ABOVE' },
  { side: 'below', icon: 'fa-arrow-down', label: 'WORLD_EDITOR.STACK_BELOW' },
  { side: 'left', icon: 'fa-arrow-left', label: 'WORLD_EDITOR.STACK_LEFT' },
  { side: 'right', icon: 'fa-arrow-right', label: 'WORLD_EDITOR.STACK_RIGHT' },
  { side: 'front', icon: 'fa-arrow-circle-up', label: 'WORLD_EDITOR.STACK_FRONT' },
  { side: 'behind', icon: 'fa-arrow-circle-down', label: 'WORLD_EDITOR.STACK_BEHIND' },
];

/** The model axis (0 forward, 1 left, 2 up) and direction of each side. */
const SIDES: Record<StackSide, [number, 1 | -1]> = {
  front: [0, 1],
  behind: [0, -1],
  left: [1, 1],
  right: [1, -1],
  above: [2, 1],
  below: [2, -1],
};

/** The spawn's rotation: its quaternion when set, otherwise its orientation (a turn around z). */
function rotationOf(spawn: { o: number; rotation?: Quaternion }): Quaternion {
  const rotation = spawn.rotation;
  if (rotation?.some((value) => value !== 0)) {
    return rotation;
  }
  return [0, 0, Math.sin(spawn.o / 2), Math.cos(spawn.o / 2)];
}

/** `v` turned by the unit quaternion `q` ([x, y, z, w]). */
function rotate(q: Quaternion, v: [number, number, number]): [number, number, number] {
  // v' = v + 2w (q × v) + 2 q × (q × v)
  const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const [x, y, z, w] = q;
  const axis = [x, y, z];
  const t = cross(axis, v).map((value) => value * 2);
  const u = cross(axis, t);
  return [v[0] + w * t[0] + u[0], v[1] + w * t[1] + u[1], v[2] + w * t[2] + u[2]];
}

/**
 * Where a copy of the spawn goes so that its box touches the spawn's on that side: the same model, turned the same
 * way, moved by the box's size along that axis of the object.
 */
export function stackPosition(spawn: WorldPosition & { o: number; rotation?: Quaternion }, box: ModelBox, side: StackSide): WorldPosition {
  const [axis, direction] = SIDES[side];
  const offset: [number, number, number] = [0, 0, 0];
  offset[axis] = (box.max[axis] - box.min[axis]) * direction;
  const [dx, dy, dz] = rotate(rotationOf(spawn), offset);
  return { x: spawn.x + dx, y: spawn.y + dy, z: spawn.z + dz };
}
