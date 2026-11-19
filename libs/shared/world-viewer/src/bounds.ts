import { WorldBounds } from '@keira/shared/wow-data';

/** Whether a server x/y is inside `bounds` (edges included); never inside no bounds. */
export function insideBounds(bounds: WorldBounds | undefined, x: number, y: number): boolean {
  return !!bounds && x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY;
}
