import { cssRgb, levelColor, territoryColor } from './game-map-layers';

describe('game map layers', () => {
  const zone = (flags: number, levels?: [number, number], faction?: number) => ({ name: 'Zone', flags, levels, faction });

  it('colours zones by level and by whose land they are', () => {
    expect(levelColor(zone(0, [1, 10]))).toEqual([47, 158, 68]);
    expect(levelColor(zone(0, [72, 80]))).toEqual([21, 170, 191]);
    expect(levelColor(zone(0x100))).toEqual([241, 230, 200]);
    expect(levelColor(zone(0))).toBeUndefined();
    expect(levelColor(zone(0, [0, 1]))).toBeUndefined();
    expect(levelColor(undefined)).toBeUndefined();
    expect(territoryColor(zone(0x800, undefined, 1))).toEqual([250, 250, 250]);
    expect(territoryColor(zone(0, undefined, 1))).toEqual([60, 120, 230]);
    expect(territoryColor(zone(0, undefined, 0))).toEqual([220, 50, 50]);
    expect(territoryColor(zone(0, undefined, -1))).toEqual([240, 190, 40]);
    expect(territoryColor(zone(0))).toBeUndefined();
    expect(territoryColor(undefined)).toBeUndefined();
    expect(cssRgb([1, 2, 3])).toBe('rgb(1, 2, 3)');
  });
});
