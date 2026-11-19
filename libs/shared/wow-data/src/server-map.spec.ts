import { buildServerMap } from './server-data.mock';
import {
  LIQUID_DARK_WATER,
  serverTerrainHeightAt,
  parseServerMap,
  serverAreaAt,
  serverHeightAt,
  serverLiquidAt,
  serverMapName,
  ServerMapTile,
} from './server-map';
import { TILE_SIZE } from './coords';

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

  it('tells the area at a position: per chunk, or one for the whole tile', () => {
    const tile = parseServerMap(buildServerMap({ areas: 'chunks' })) as NonNullable<ReturnType<typeof parseServerMap>>;
    // Goldshire's tile (31_49): x −9600..−9067, y 0..533; chunk row by x, column by y
    expect(serverAreaAt(tile, -9070, 530)).toBe(0);
    expect(serverAreaAt(tile, -9070, 500)).toBe(1);
    expect(serverAreaAt(tile, -9110, 530)).toBe(16);
    expect(serverAreaAt(parseServerMap(buildServerMap({ areas: 'one' })) as NonNullable<ReturnType<typeof parseServerMap>>, 0, 0)).toBe(87);
    expect(serverAreaAt(parseServerMap(buildServerMap()) as NonNullable<ReturnType<typeof parseServerMap>>, 0, 0)).toBe(0);
  });

  it('tells the terrain height at a position (the nearest grid corner)', () => {
    const tile = parseServerMap(buildServerMap({ height: 42 })) as NonNullable<ReturnType<typeof parseServerMap>>;
    expect(serverHeightAt(tile, { tx: 31, ty: 49 }, -9300, 200)).toBe(42);
    // outside the tile: the nearest edge
    expect(serverHeightAt(tile, { tx: 31, ty: 49 }, 0, 0)).toBe(42);
    expect(serverHeightAt({}, { tx: 31, ty: 49 }, 0, 0)).toBeUndefined();
  });

  it('tells the liquid at a place, with its surface and whether it is deep water', () => {
    // a square (along x, y) of the liquid grid: just inside the tile's top corner, then 2 squares further
    const at = (square: number) => -((square + 0.5) * TILE_SIZE) / 128;
    const types = new Uint8Array(256);
    types[0] = 2 | LIQUID_DARK_WATER;
    const tile: ServerMapTile = {
      liquid: { types, offsetX: 1, offsetY: 0, width: 3, height: 2, heights: new Float32Array([4, 5, 6, 7, 8, 9]), level: 0 },
    };
    expect(serverLiquidAt(tile, at(1), at(2))).toEqual({ level: 8, types: 2 | LIQUID_DARK_WATER });
    expect(serverLiquidAt(tile, at(0), at(1))).toEqual({ level: 4, types: 18 });
    // outside the liquid's grid, or in a chunk without liquid
    expect(serverLiquidAt(tile, at(0), at(0))).toBeUndefined();
    expect(serverLiquidAt(tile, at(2), at(1))).toBeUndefined();
    expect(serverLiquidAt(tile, at(0), at(4))).toBeUndefined();
    expect(serverLiquidAt(tile, at(9), at(1))).toBeUndefined();
    // one level everywhere, and no liquid at all
    expect(serverLiquidAt({ liquid: { ...tile.liquid!, heights: undefined, level: 3 } }, at(1), at(1))).toEqual({ level: 3, types: 18 });
    expect(serverLiquidAt({}, 0, 0)).toBeUndefined();
  });

  it('tells the terrain height inside a square from its corners and centre, like the server', () => {
    // corners rising with the column (server y going down), the centre in between
    const v9 = new Float32Array(129 * 129).map((_, i) => i % 129);
    const v8 = new Float32Array(128 * 128).map((_, i) => (i % 128) + 0.5);
    const tile: ServerMapTile = { v9, v8 };
    const at = (row: number, col: number) => [-(row * TILE_SIZE) / 128, -(col * TILE_SIZE) / 128] as const;
    // each of the four triangles of square (10, 20) gives the plane's height
    for (const [row, col] of [
      [10.6, 20.2],
      [10.2, 20.6],
      [10.9, 20.7],
      [10.7, 20.9],
    ]) {
      expect(serverTerrainHeightAt(tile, ...at(row, col))).toBeCloseTo(col, 3);
    }
    expect(serverTerrainHeightAt({ v9 }, 0, 0)).toBeUndefined();
  });
});
