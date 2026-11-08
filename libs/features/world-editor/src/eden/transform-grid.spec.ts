import { DEFAULT_TRANSFORM, gizmoGrid, loadTransform, saveTransform, stepMoveSize, TRANSFORM_KEY } from './transform-grid';

describe('transform grid', () => {
  afterEach(() => localStorage.removeItem(TRANSFORM_KEY));

  it('is kept on this computer, odd values back to the defaults', () => {
    expect(loadTransform()).toEqual(DEFAULT_TRANSFORM);
    saveTransform({ space: 'local', moveGrid: true, moveSize: 5, rotateGrid: true, rotateSize: 45 });
    expect(loadTransform()).toEqual({ space: 'local', moveGrid: true, moveSize: 5, rotateGrid: true, rotateSize: 45 });
    localStorage.setItem(TRANSFORM_KEY, JSON.stringify({ space: 'odd', moveSize: 3, rotateSize: 7 }));
    expect(loadTransform()).toEqual(DEFAULT_TRANSFORM);
    localStorage.setItem(TRANSFORM_KEY, '{');
    expect(loadTransform()).toEqual(DEFAULT_TRANSFORM);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    saveTransform(DEFAULT_TRANSFORM);
    setItem.mockRestore();
  });

  it('gives the grids the widget snaps to, and steps the move grid', () => {
    expect(gizmoGrid(DEFAULT_TRANSFORM)).toEqual({ move: 0, rotate: 0 });
    expect(gizmoGrid({ ...DEFAULT_TRANSFORM, moveGrid: true, rotateGrid: true })).toEqual({ move: 1, rotate: 15 });
    expect(stepMoveSize(1, 1)).toBe(2);
    expect(stepMoveSize(1, -1)).toBe(0.5);
    expect(stepMoveSize(0.25, -1)).toBe(0.25);
    expect(stepMoveSize(25, 1)).toBe(25);
    expect(stepMoveSize(3, 1)).toBe(0.5);
  });
});
