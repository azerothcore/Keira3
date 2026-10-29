import { SHAPE_HEIGHT, SHAPE_WIDTH } from '@keira/shared/wow-data';
import { cssRgb, levelColor, paintHover, paintShapes, territoryColor } from './game-map-layers';

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

  it('paints fills, borders and sub-zone borders on the shape grid, and the zone under the pointer', () => {
    const labels = new Uint16Array(SHAPE_WIDTH * SHAPE_HEIGHT);
    labels.fill(1, 0, 10);
    labels.fill(2, 10, 20);
    const edges = new Uint8Array(SHAPE_WIDTH * SHAPE_HEIGHT);
    edges[0] = 1;
    const subEdges = new Uint8Array(SHAPE_WIDTH * SHAPE_HEIGHT);
    subEdges[1] = 1;
    const fill = vi.fn((label: number) => (label === 1 ? ([10, 20, 30] as [number, number, number]) : undefined));
    const image = paintShapes({ labels, fill, edges, subEdges });
    const px = (i: number) => Array.from(image?.data.subarray(i * 4, i * 4 + 4) ?? []);
    expect(px(0)).toEqual([255, 236, 170, 220]);
    expect(px(1)).toEqual([255, 255, 255, 110]);
    expect(px(2)).toEqual([10, 20, 30, 80]);
    expect(px(12)).toEqual([0, 0, 0, 0]);
    expect(px(30)).toEqual([0, 0, 0, 0]);
    // each label's colour asked once
    expect(fill).toHaveBeenCalledTimes(2);
    expect(paintShapes({})).toBeUndefined();
    expect(paintShapes({ labels })).toBeUndefined();
    expect(paintShapes({ edges })?.width).toBe(SHAPE_WIDTH);

    const hover = paintHover(labels, edges, 1);
    expect(Array.from(hover.data.subarray(0, 4))).toEqual([255, 214, 64, 255]);
    expect(Array.from(hover.data.subarray(4, 8))).toEqual([255, 214, 64, 70]);
    expect(hover.data[12 * 4 + 3]).toBe(0);
  });
});
