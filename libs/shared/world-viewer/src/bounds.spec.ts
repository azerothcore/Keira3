import { insideBounds } from './bounds';

describe('insideBounds', () => {
  it('tells whether a place is inside an area', () => {
    const bounds = { minX: 0, maxX: 10, minY: 0, maxY: 10 };
    expect(insideBounds(bounds, 0, 10)).toBe(true);
    expect(insideBounds(bounds, -1, 5)).toBe(false);
    expect(insideBounds(bounds, 11, 5)).toBe(false);
    expect(insideBounds(bounds, 5, -1)).toBe(false);
    expect(insideBounds(bounds, 5, 11)).toBe(false);
    expect(insideBounds(undefined, 5, 5)).toBe(false);
  });
});
