import { buildServerMap } from './server-data.mock';
import { parseServerMap, serverMapName } from './server-map';

describe('server maps', () => {
  it('names files like the mmtiles: map, grid y, grid x', () => {
    expect(serverMapName(0, { tx: 31, ty: 49 })).toBe('0004931.map');
  });

  it('reads the heights in each storage, the holes and the liquids', () => {
    const float = parseServerMap(buildServerMap({ holes: true, liquid: 'typed' }));
    expect(float?.v9).toHaveLength(129 * 129);
    expect(float?.v8).toHaveLength(128 * 128);
    expect(float?.v9?.[0]).toBe(10);
    expect(float?.holes?.[0]).toBe(0xffff);
    expect(float?.liquid).toEqual(expect.objectContaining({ offsetX: 0, offsetY: 0, width: 2, height: 2 }));
    expect(float?.liquid?.types[0]).toBe(4);
    expect(float?.liquid?.types[1]).toBe(1);
    expect([...(float?.liquid?.heights ?? [])]).toEqual([12, 12, 12, 12]);

    expect(parseServerMap(buildServerMap({ heights: 'int16' }))?.v8?.[5]).toBeCloseTo(10, 2);
    expect(parseServerMap(buildServerMap({ heights: 'int8' }))?.v9?.[5]).toBeCloseTo(10, 1);
    const level = parseServerMap(buildServerMap({ heights: 'none', liquid: 'level' }));
    expect(level?.v9).toBeUndefined();
    expect(level?.holes).toBeUndefined();
    expect(level?.liquid?.heights).toBeUndefined();
    expect(level?.liquid?.level).toBe(15);
    expect(level?.liquid?.types.every((type) => type === 1)).toBe(true);
  });

  it('refuses other files and versions', () => {
    expect(parseServerMap(new Uint8Array(10))).toBeUndefined();
    expect(parseServerMap(buildServerMap({ version: 8 }))).toBeUndefined();
  });
});
