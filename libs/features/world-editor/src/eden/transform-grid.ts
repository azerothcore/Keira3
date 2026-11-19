import { GizmoGrid, GizmoSpace } from '@keira/shared/world-viewer';

export const TRANSFORM_KEY = 'keira3.worldEditor.transform';
/** The move grid sizes (yards) and the rotation grid sizes (degrees), as Eden's drop-downs. */
export const MOVE_GRID_SIZES = [0.25, 0.5, 1, 2, 5, 10, 25];
export const ROTATE_GRID_SIZES = [1, 5, 10, 15, 30, 45, 90];

/** The transformation widget's settings: its axes, and each grid on or off with its size. */
export interface TransformSettings {
  space: GizmoSpace;
  moveGrid: boolean;
  moveSize: number;
  rotateGrid: boolean;
  rotateSize: number;
}

export const DEFAULT_TRANSFORM: TransformSettings = { space: 'world', moveGrid: false, moveSize: 1, rotateGrid: false, rotateSize: 15 };

export function loadTransform(): TransformSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(TRANSFORM_KEY) ?? '{}') as Partial<TransformSettings>;
    return {
      space: stored.space === 'local' ? 'local' : 'world',
      moveGrid: stored.moveGrid === true,
      moveSize: MOVE_GRID_SIZES.includes(stored.moveSize as number) ? (stored.moveSize as number) : DEFAULT_TRANSFORM.moveSize,
      rotateGrid: stored.rotateGrid === true,
      rotateSize: ROTATE_GRID_SIZES.includes(stored.rotateSize as number) ? (stored.rotateSize as number) : DEFAULT_TRANSFORM.rotateSize,
    };
  } catch {
    return { ...DEFAULT_TRANSFORM };
  }
}

export function saveTransform(settings: TransformSettings): void {
  try {
    localStorage.setItem(TRANSFORM_KEY, JSON.stringify(settings));
  } catch {
    // (not kept)
  }
}

/** The grid the widget snaps to (0: that grid off). */
export function gizmoGrid(settings: TransformSettings): GizmoGrid {
  return { move: settings.moveGrid ? settings.moveSize : 0, rotate: settings.rotateGrid ? settings.rotateSize : 0 };
}

/** The next smaller (-1) or bigger (+1) move grid size (Eden's `[` and `]`), kept at the ends. */
export function stepMoveSize(size: number, step: -1 | 1): number {
  const i = Math.max(0, MOVE_GRID_SIZES.indexOf(size));
  return MOVE_GRID_SIZES[Math.min(MOVE_GRID_SIZES.length - 1, Math.max(0, i + step))];
}
