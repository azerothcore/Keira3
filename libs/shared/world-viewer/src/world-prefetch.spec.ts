import { tileCenter, TileCoord } from '@keira/shared/wow-data';
import { PrefetchSource, PrefetchTargets, WorldPrefetch } from './world-prefetch';

const flush = async () => {
  for (let i = 0; i < 10; i++) {
    await new Promise((resolve) => setTimeout(resolve));
  }
};
const key = (tile: TileCoord) => `${tile.tx}_${tile.ty}`;

describe('WorldPrefetch', () => {
  const setup = (tiles: TileCoord[] = [], idle = () => true) => {
    const source = {
      getMapTiles: vi.fn().mockResolvedValue(tiles),
      getTerrain: vi.fn().mockResolvedValue(undefined),
      getTerrainDetail: vi
        .fn()
        .mockImplementation((_d: string, tile: TileCoord) =>
          Promise.resolve(
            key(tile) === '35_48' ? undefined : { chunks: [{ textures: ['a.blp', 'b.blp'] }, { textures: ['a.blp'] }], liquids: [] },
          ),
        ),
      getTilePlacements: vi.fn().mockImplementation((_d: string, tile: TileCoord) =>
        Promise.resolve(
          key(tile) === '35_48'
            ? undefined
            : {
                wmos: [{ path: 'Inn.wmo' }, { path: 'Inn.wmo' }],
                doodads: [{ path: 'Tree.mdx' }, { path: 'Tree.mdx' }, { path: 'Rock.mdx' }],
              },
        ),
      ),
    } as unknown as PrefetchSource & Record<string, ReturnType<typeof vi.fn>>;
    const targets = {
      texture: vi.fn().mockResolvedValue(undefined),
      building: vi.fn().mockResolvedValue(undefined),
      model: vi.fn(),
      idle: vi.fn().mockImplementation(idle),
    } satisfies PrefetchTargets;
    return { source, targets, prefetch: new WorldPrefetch(source, targets) };
  };
  // a row of tiles east of 32_48
  const row = [32, 33, 34, 35, 36].map((tx) => ({ tx, ty: 48 }));

  it('reads the tiles beyond the drawn ones, nearest first: terrain, textures, buildings and models', async () => {
    const { source, targets, prefetch } = setup(row);
    await prefetch.setMap('Azeroth');
    prefetch.configure({ rings: 2, radius: 1, detailed: true });
    prefetch.update(tileCenter({ tx: 32, ty: 48 }));
    await flush();
    // 32 and 33 are drawn; 34 and 35 are read ahead; 36 is too far
    expect(source.getTerrainDetail.mock.calls.map((call) => key(call[1]))).toEqual(['34_48', '35_48']);
    expect(targets.texture.mock.calls.map((call) => call[0])).toEqual(['a.blp', 'b.blp']);
    expect(targets.building).toHaveBeenCalledTimes(1);
    expect(targets.model.mock.calls.map((call) => call[0])).toEqual(['Tree.mdx', 'Rock.mdx']);
    expect(prefetch.pendingCount).toBe(0);
    // read once
    prefetch.update(tileCenter({ tx: 32, ty: 48 }));
    await flush();
    expect(source.getTerrainDetail).toHaveBeenCalledTimes(2);
  });

  it('reads the low-poly terrain when that is drawn, and again the other kind when it changes', async () => {
    const { source, prefetch } = setup(row);
    await prefetch.setMap('Azeroth');
    prefetch.configure({ rings: 1, radius: 1, detailed: false });
    prefetch.update(tileCenter({ tx: 32, ty: 48 }));
    await flush();
    expect(source.getTerrain.mock.calls.map((call) => key(call[1]))).toEqual(['34_48']);
    prefetch.configure({ rings: 1, radius: 1, detailed: true });
    prefetch.update(tileCenter({ tx: 32, ty: 48 }));
    await flush();
    expect(source.getTerrainDetail.mock.calls.map((call) => key(call[1]))).toEqual(['34_48']);
  });

  it('waits while the view loads what is in sight, and does nothing when off or without a map', async () => {
    let busy = true;
    const { source, prefetch } = setup(row, () => !busy);
    prefetch.update(tileCenter({ tx: 32, ty: 48 }));
    await prefetch.setMap('Azeroth');
    prefetch.configure({ rings: 0, radius: 1, detailed: true });
    prefetch.update(tileCenter({ tx: 32, ty: 48 }));
    expect(prefetch.pendingCount).toBe(0);
    prefetch.configure({ rings: 1, radius: 1, detailed: true });
    prefetch.update(tileCenter({ tx: 32, ty: 48 }));
    prefetch.update(tileCenter({ tx: 32, ty: 48 }));
    await flush();
    expect(source.getTerrainDetail).not.toHaveBeenCalled();
    busy = false;
    await new Promise((resolve) => setTimeout(resolve, 200));
    await flush();
    expect(source.getTerrainDetail).toHaveBeenCalledTimes(1);
    // turned off: what's waiting is dropped
    prefetch.configure({ rings: 2, radius: 1, detailed: true });
    busy = true;
    prefetch.update(tileCenter({ tx: 32, ty: 48 }));
    prefetch.configure({ rings: 0, radius: 1, detailed: true });
    expect(prefetch.pendingCount).toBe(0);
  });

  it('skips tiles listed twice, drops what a map change made stale, and reports failures', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { source, targets, prefetch } = setup(row);
    await prefetch.setMap('Azeroth');
    prefetch.configure({ rings: 1, radius: 1, detailed: true });
    // the same tile twice in the queue
    (prefetch as unknown as { queue: TileCoord[] }).queue = [
      { tx: 34, ty: 48 },
      { tx: 34, ty: 48 },
    ];
    prefetch.update(tileCenter({ tx: 32, ty: 48 }));
    (prefetch as unknown as { queue: TileCoord[] }).queue.push({ tx: 34, ty: 48 });
    await flush();
    expect(source.getTerrainDetail).toHaveBeenCalledTimes(1);

    // a map change while a tile is read: its buildings aren't loaded
    const late = setup(row);
    let release: () => void = () => undefined;
    late.source.getTilePlacements.mockReturnValueOnce(
      new Promise((resolve) => (release = () => resolve({ wmos: [{ path: 'Late.wmo' }], doodads: [] }))),
    );
    await late.prefetch.setMap('Azeroth');
    late.prefetch.configure({ rings: 1, radius: 1, detailed: true });
    late.prefetch.update(tileCenter({ tx: 32, ty: 48 }));
    await flush();
    await late.prefetch.setMap('Kalimdor');
    release();
    await flush();
    expect(late.targets.building).not.toHaveBeenCalled();
    expect(targets.building).toHaveBeenCalled();

    // a map whose tiles can't be read, and a read failing
    source.getMapTiles.mockRejectedValueOnce(new Error('bad wdt'));
    await prefetch.setMap('Broken');
    prefetch.update(tileCenter({ tx: 32, ty: 48 }));
    expect(prefetch.pendingCount).toBe(0);
    source.getTerrainDetail.mockRejectedValueOnce(new Error('bad adt'));
    await prefetch.setMap('Azeroth');
    prefetch.update(tileCenter({ tx: 32, ty: 48 }));
    await flush();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('bad adt'));
    // a map change while its tiles are being listed
    let list: (tiles: TileCoord[]) => void = () => undefined;
    source.getMapTiles.mockReturnValueOnce(new Promise((resolve) => (list = resolve)));
    const listing = prefetch.setMap('Slow');
    await prefetch.setMap(undefined);
    list(row);
    await listing;
    prefetch.update(tileCenter({ tx: 32, ty: 48 }));
    expect(prefetch.pendingCount).toBe(0);
  });
});
