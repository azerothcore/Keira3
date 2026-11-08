import { ServerMapLiquid, ServerMapTile, TILE_SIZE, TileCoord, VmapGroup, VmapSpawn } from '@keira/shared/wow-data';
import { collectServerTileGeometry, ServerGeometrySource, vmapToWorld } from './server-geometry';

const TILE = { tx: 31, ty: 49 };
const MID = 32 * TILE_SIZE;
const flat = (height = 10, extra: Partial<ServerMapTile> = {}): ServerMapTile => ({
  v9: new Float32Array(129 * 129).fill(height),
  v8: new Float32Array(128 * 128).fill(height),
  ...extra,
});
const liquid = (extra: Partial<ServerMapLiquid> = {}): ServerMapLiquid => ({
  types: new Uint8Array(256).fill(1),
  offsetX: 0,
  offsetY: 0,
  width: 0,
  height: 0,
  level: 20,
  ...extra,
});
const TRIANGLE: VmapGroup = { vertices: Float32Array.from([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: Uint32Array.from([0, 1, 2]) };

describe('collectServerTileGeometry', () => {
  const setup = (maps: Record<string, ServerMapTile> = {}, spawns: VmapSpawn[] = [], models: Record<string, VmapGroup[]> = {}) => {
    const source = {
      getServerMap: vi.fn((_m: number, tile: TileCoord) => Promise.resolve(maps[`${tile.tx}_${tile.ty}`])),
      getVmapTile: vi.fn(() => Promise.resolve(spawns.length ? spawns : undefined)),
      getVmapModel: vi.fn((name: string) => Promise.resolve(models[name])),
    } satisfies ServerGeometrySource;
    return { source, collect: () => collectServerTileGeometry(source, 0, TILE) };
  };
  const count = (areas: Uint8Array | undefined, area: number) => [...(areas ?? [])].filter((a) => a === area).length;

  it('turns the terrain of the tile into 4 triangles per square, in Recast axes, and adds the bordering squares of its neighbours', async () => {
    const alone = await setup({ '31_49': flat() }).collect();
    expect(alone?.indices.length).toBe(128 * 128 * 4 * 3);
    expect(count(alone?.areas, 1)).toBe(128 * 128 * 4);
    // Recast x = server y: within the tile
    const maxX = (32 - TILE.tx) * TILE_SIZE;
    for (let i = 0; i < (alone?.positions.length ?? 0); i += 3) {
      expect(alone?.positions[i]).toBeGreaterThanOrEqual(maxX - TILE_SIZE - 1e-3);
      expect(alone?.positions[i]).toBeLessThanOrEqual(maxX + 1e-3);
      expect(alone?.positions[i + 1]).toBe(10);
    }
    const { source, collect } = setup({ '31_49': flat(), '32_49': flat(), '30_49': flat(), '31_50': flat(), '31_48': flat() });
    expect((await collect())?.indices.length).toBe((128 * 128 + 4 * 128) * 4 * 3);
    expect(source.getServerMap).toHaveBeenCalledTimes(5);
  });

  it('leaves out holes and dark water, keeps the higher of terrain and liquid per square, and pads liquids missing corners', async () => {
    const holes = new Uint16Array(256);
    holes[0] = 0xffff;
    const withHoles = await setup({ '31_49': flat(10, { holes }) }).collect();
    expect(withHoles?.indices.length).toBe((128 * 128 - 64) * 4 * 3);

    // water over the first chunk (8 × 8 squares), magma over the second, slime over the third, dark water over the fourth
    const types = new Uint8Array(256);
    types.set([1, 4, 8, 16]);
    const heights = new Float32Array(129 * 33).fill(20);
    const lake = await setup({ '31_49': flat(10, { liquid: liquid({ types, width: 33, height: 129, heights }) }) }).collect();
    expect(count(lake?.areas, 8)).toBe(64 * 2);
    expect(count(lake?.areas, 2)).toBe(64 * 2);
    expect(count(lake?.areas, 4)).toBe(64 * 2);
    expect(count(lake?.areas, 1)).toBe((128 * 128 - 4 * 64) * 4);

    // under the terrain: not used
    const under = await setup({ '31_49': flat(10, { liquid: liquid({ level: 5 }) }) }).collect();
    expect(count(under?.areas, 8)).toBe(0);

    // a 2 × 2 corner area: squares with some of their corners get the average height of the others
    const corner = await setup({
      '31_49': flat(-50, { liquid: liquid({ width: 2, height: 2, heights: new Float32Array(4).fill(20) }) }),
    }).collect();
    expect(count(corner?.areas, 8)).toBeGreaterThan(2);
    const geometry = corner as NonNullable<typeof corner>;
    for (let t = 0; t < geometry.areas.length; t++) {
      if (geometry.areas[t] === 8) {
        [0, 1, 2].forEach((k) => expect(geometry.positions[geometry.indices[t * 3 + k] * 3 + 1]).toBe(20));
      }
    }
  });

  it('uses liquid without terrain, and nothing when there is no data', async () => {
    const water = await setup({ '31_49': { liquid: liquid() } }).collect();
    expect(count(water?.areas, 8)).toBe(128 * 128 * 2);
    expect(count(water?.areas, 1)).toBe(0);
    expect(await setup({ '31_49': {} }).collect()).toBeUndefined();
    expect(await setup().collect()).toBeUndefined();
  });

  it("adds the collision of the vmap tile's models, M2 triangles reversed, and their liquids", async () => {
    const spawn = (name: string, id: number): VmapSpawn => ({ flags: 0, id, position: [MID, MID, 0], rotation: [0, 0, 0], scale: 1, name });
    const pool: VmapGroup = {
      ...TRIANGLE,
      liquid: { tilesX: 2, tilesY: 1, corner: [0, 0, 5], type: 2, heights: new Float32Array(6).fill(5), flags: Uint8Array.from([0, 0x0f]) },
    };
    const { collect } = setup({}, [spawn('Bank.wmo', 1), spawn('Crate.m2', 2), spawn('Missing.m2', 3)], {
      'Bank.wmo': [pool],
      'Crate.m2': [TRIANGLE],
    });
    const geometry = (await collect()) as NonNullable<Awaited<ReturnType<typeof collect>>>;
    expect(count(geometry.areas, 1)).toBe(2);
    // one liquid square (the other is flagged as no liquid), magma
    expect(count(geometry.areas, 2)).toBe(2);
    const corners = (t: number) =>
      [0, 1, 2].map((k) => Array.from(geometry.positions.slice(geometry.indices[t * 3 + k] * 3, geometry.indices[t * 3 + k] * 3 + 3)));
    expect(corners(1)).toEqual([corners(0)[2], corners(0)[1], corners(0)[0]]);
  });
});

describe('vmapToWorld', () => {
  it('turns, scales and places model vertices like the server, in server coordinates', () => {
    const at = (rotation: [number, number, number], scale = 1) =>
      vmapToWorld({ flags: 0, id: 1, position: [MID + 100, MID + 200, 30], rotation, scale, name: 'x' });
    const close = (actual: number[], expected: number[]) => expected.forEach((value, i) => expect(actual[i]).toBeCloseTo(value, 4));
    close(at([0, 0, 0])(0, 0, 0), [-100, -200, 30]);
    close(at([0, 0, 0], 2)(1, 0, 0), [-102, -200, 30]);
    // 90° around the vertical axis: x goes to y
    close(at([0, 90, 0])(1, 0, 0), [-100, -201, 30]);
  });
});
