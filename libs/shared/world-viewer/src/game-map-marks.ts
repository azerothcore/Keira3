/**
 * What the user marks on the in-game map: pins put with Shift + click (kept on this computer, newest first) and the
 * points of the measuring tool.
 */

/** A place on a map (server coordinates). */
export interface MapPlace {
  mapId: number;
  x: number;
  y: number;
}

/** A pin put on the in-game map: where, what page it was put on, and when. */
export interface UserPin extends MapPlace {
  id: number;
  label: string;
  at: number;
}

export const USER_PINS_KEY = 'keira3.worldEditor.gameMapPins';
/** How many pins are kept (the oldest go). */
export const MAX_USER_PINS = 50;

export function loadUserPins(): UserPin[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(USER_PINS_KEY) ?? '[]');
    return Array.isArray(stored)
      ? stored.filter(
          (pin): pin is UserPin =>
            !!pin &&
            typeof pin === 'object' &&
            ['id', 'mapId', 'x', 'y', 'at'].every((key) => typeof (pin as Record<string, unknown>)[key] === 'number'),
        )
      : [];
  } catch {
    return [];
  }
}

export function saveUserPins(pins: UserPin[]): void {
  try {
    localStorage.setItem(USER_PINS_KEY, JSON.stringify(pins));
  } catch {
    // (storage full or blocked: the pins last until Keira closes)
  }
}

/** Puts a pin first, keeping at most `MAX_USER_PINS`. */
export function addUserPin(pins: UserPin[], place: MapPlace, label: string, now = Date.now()): UserPin[] {
  const id = Math.max(now, ...pins.map((pin) => pin.id + 1));
  return [{ ...place, id, label, at: now }, ...pins].slice(0, MAX_USER_PINS);
}

/** The length of a line through the points, in yards (points on another map than the one before start over). */
export function pathLength(points: MapPlace[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const [a, b] = [points[i - 1], points[i]];
    if (a.mapId === b.mapId) {
      total += Math.hypot(b.x - a.x, b.y - a.y);
    }
  }
  return total;
}
