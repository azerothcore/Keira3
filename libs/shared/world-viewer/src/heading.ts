import { WorldPosition } from '@keira/shared/wow-data';

const COMPASS = ['N', 'NW', 'W', 'SW', 'S', 'SE', 'E', 'NE'];

/**
 * A server orientation (radians, 0 = north (+x), counter-clockwise: π/2 = west (+y)) as text: the compass point and
 * the orientation, e.g. "NW (0.79)".
 */
export function headingText(orientation: number): string {
  const o = ((orientation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return `${COMPASS[Math.round(o / (Math.PI / 4)) % 8]} (${o.toFixed(2)})`;
}

/** Which way and how far from one place to another: "→ NW (0.79), 12.3 yd". */
export function stretchText(from: WorldPosition, to: WorldPosition): string {
  const distance = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
  return `→ ${headingText(Math.atan2(to.y - from.y, to.x - from.x))}, ${distance.toFixed(1)} yd`;
}
