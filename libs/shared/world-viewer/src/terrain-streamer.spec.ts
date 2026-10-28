import { TerrainMeshData, TileCoord, tileCenter } from '@keira/shared/wow-data';
import { TerrainSource, TerrainStreamer } from './terrain-streamer';
import { TextureCache } from './texture-cache';
import { flatDetail } from './world-viewer.mock';
import { WorldScene } from './world-scene';

const mesh = (tile: TileCoord): TerrainMeshData => ({
  tile,
  positions: new Float32Array(0),
  uvs: new Float32Array(0),
  indices: new Uint32Array(0),
  minHeight: 0,
  maxHeight: 0,
});

describe('TerrainStreamer', () => {
  const grid = (cx: number, cy: number, r: number): TileCoord[] => {
    const tiles: TileCoord[] = [];
    for (let tx = cx - r; tx <= cx + r; tx++) {
      for (let ty = cy - r; ty <= cy + r; ty++) {
        tiles.push({ tx, ty });
      }
    }
    return tiles;
  };

  const setup = (tiles = grid(32, 48, 4)) => {
    const source: TerrainSource = {
      getMapTiles: vi.fn().mockResolvedValue(tiles),
      getTerrain: vi.fn().mockImplementation((_d: string, tile: TileCoord) => Promise.resolve(mesh(tile))),
      getMinimap: vi.fn().mockResolvedValue(undefined),
      getTerrainDetail: vi.fn().mockImplementation((_d: string, tile: TileCoord) => Promise.resolve(flatDetail(50, tile))),
    };
    const scene = new WorldScene();
    const onTileLoaded = vi.fn();
    const textures = new TextureCache(() => Promise.resolve({ width: 1, height: 1, data: new Uint8Array(4) }));
    const streamer = new TerrainStreamer(source, scene, textures, onTileLoaded);
    return { source, scene, onTileLoaded, streamer };
  };

  it('does nothing without a map', async () => {
    const { streamer, source } = setup();
    await streamer.update(tileCenter({ tx: 32, ty: 48 }));
    await streamer.setMap(undefined);
    expect(streamer.mapDirectory).toBeUndefined();
    expect(source.getMapTiles).not.toHaveBeenCalled();
  });

  it('loads the 3x3 tiles around the centre that exist in the WDT', async () => {
    const { streamer, scene, source, onTileLoaded } = setup([
      { tx: 32, ty: 48 },
      { tx: 33, ty: 48 },
      { tx: 40, ty: 40 },
    ]);
    await streamer.setMap('Azeroth');
    expect(streamer.mapDirectory).toBe('Azeroth');
    expect(streamer.availableTiles.length).toBe(3);

    await streamer.update(tileCenter({ tx: 32, ty: 48 }));
    expect(scene.terrainKeys.sort()).toEqual(['32_48', '33_48']);
    expect(onTileLoaded).toHaveBeenCalledTimes(2);
    expect(source.getMinimap).toHaveBeenCalledWith('Azeroth', { tx: 32, ty: 48 });

    await streamer.update(tileCenter({ tx: 32, ty: 48 }));
    expect(source.getTerrain).toHaveBeenCalledTimes(2);
    expect(streamer.pendingCount).toBe(0);
  });

  it('drops tiles far from the centre', async () => {
    const { streamer, scene } = setup();
    await streamer.setMap('Azeroth');
    await streamer.update(tileCenter({ tx: 32, ty: 48 }));
    expect(scene.terrainKeys.length).toBe(9);

    await streamer.update(tileCenter({ tx: 35, ty: 48 }));
    expect(scene.terrainKeys.every((key) => Number(key.split('_')[0]) >= 33)).toBe(true);
  });

  it('keeps tiles without minimap and skips missing ADTs', async () => {
    const { streamer, scene, source } = setup([
      { tx: 32, ty: 48 },
      { tx: 32, ty: 49 },
    ]);
    vi.mocked(source.getMinimap).mockRejectedValue(new Error('no blp'));
    vi.mocked(source.getTerrain).mockImplementation((_d, tile) => Promise.resolve(tile.ty === 49 ? undefined : mesh(tile)));
    await streamer.setMap('Azeroth');
    await streamer.update(tileCenter({ tx: 32, ty: 48 }));
    expect(scene.terrainKeys).toEqual(['32_48']);
  });

  it('warns about tiles that fail to load', async () => {
    const { streamer, source } = setup([{ tx: 32, ty: 48 }]);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.mocked(source.getTerrain).mockRejectedValue(new Error('broken adt'));
    await streamer.setMap('Azeroth');
    await streamer.update(tileCenter({ tx: 32, ty: 48 }));
    expect(warn).toHaveBeenCalledWith('[World Editor] Could not load tile Azeroth_32_48: broken adt');
    expect(streamer.pendingCount).toBe(0);
  });

  it('ignores results that arrive after the map changed', async () => {
    const { streamer, scene, source } = setup([{ tx: 32, ty: 48 }]);
    let resolveTerrain: (value: TerrainMeshData) => void = () => undefined;
    vi.mocked(source.getTerrain).mockReturnValue(new Promise((resolve) => (resolveTerrain = resolve)));
    await streamer.setMap('Azeroth');
    const pending = streamer.update(tileCenter({ tx: 32, ty: 48 }));

    let resolveTiles: (tiles: TileCoord[]) => void = () => undefined;
    vi.mocked(source.getMapTiles).mockReturnValueOnce(new Promise((resolve) => (resolveTiles = resolve)));
    const switching = streamer.setMap('Kalimdor');
    resolveTerrain(mesh({ tx: 32, ty: 48 }));
    await pending;
    expect(scene.terrainKeys).toEqual([]);

    const stale = streamer.setMap('Northrend');
    resolveTiles([{ tx: 1, ty: 1 }]);
    await Promise.all([switching, stale]);
    expect(streamer.availableTiles).toEqual([{ tx: 32, ty: 48 }]);
  });

  it('drops tiles that finish loading after the camera moved away or after dispose', async () => {
    const { streamer, scene, source } = setup([
      { tx: 32, ty: 48 },
      { tx: 50, ty: 48 },
    ]);
    const resolvers: ((mesh: TerrainMeshData) => void)[] = [];
    vi.mocked(source.getTerrain).mockImplementation(() => new Promise((resolve) => resolvers.push(resolve)));
    await streamer.setMap('Azeroth');

    const first = streamer.update(tileCenter({ tx: 32, ty: 48 }));
    await Promise.resolve();
    const second = streamer.update(tileCenter({ tx: 50, ty: 48 }));
    await Promise.resolve();
    resolvers[0](mesh({ tx: 32, ty: 48 }));
    await first;
    expect(scene.terrainKeys).toEqual([]);

    streamer.dispose();
    resolvers[1](mesh({ tx: 50, ty: 48 }));
    await second;
    expect(scene.terrainKeys).toEqual([]);
    expect(streamer.mapDirectory).toBeUndefined();
    expect(streamer.pendingCount).toBe(0);
  });

  describe('textured mode', () => {
    it('loads textured tiles with their tileset textures, sharing each texture', async () => {
      const { streamer, scene, source } = setup([{ tx: 32, ty: 48 }]);
      streamer.configure({ detailed: true, radius: 1 });
      await streamer.setMap('Azeroth');
      await streamer.update(tileCenter({ tx: 32, ty: 48 }));
      expect(source.getTerrainDetail).toHaveBeenCalledWith('Azeroth', { tx: 32, ty: 48 });
      expect(source.getTerrain).not.toHaveBeenCalled();
      expect(scene.terrainKeys).toEqual(['32_48']);
      expect(scene.scene.getObjectByName('tile:32_48')?.children.length).toBe(256 + 1 + 2); // the chunks (picking), one drawn mesh (they all use the same textures), and the two overlays
    });

    it('skips tiles without ADT', async () => {
      const { streamer, scene, source } = setup([{ tx: 32, ty: 48 }]);
      vi.mocked(source.getTerrainDetail).mockResolvedValue(undefined);
      streamer.configure({ detailed: true, radius: 1 });
      await streamer.setMap('Azeroth');
      await streamer.update(tileCenter({ tx: 32, ty: 48 }));
      expect(scene.terrainKeys).toEqual([]);
    });

    it('reloads with new options and ignores unchanged ones', async () => {
      const { streamer, scene, source } = setup();
      await streamer.setMap('Azeroth');
      await streamer.update(tileCenter({ tx: 32, ty: 48 }));
      expect(scene.terrainKeys.length).toBe(9);

      streamer.configure({ detailed: false, radius: 1 });
      expect(scene.terrainKeys.length).toBe(9);

      streamer.configure({ detailed: false, radius: 2 });
      expect(scene.terrainKeys).toEqual([]);
      await streamer.update(tileCenter({ tx: 32, ty: 48 }));
      expect(scene.terrainKeys.length).toBe(25);
      expect(source.getTerrain).toHaveBeenCalledTimes(9 + 25);
    });
  });

  it('loads a whole region, with the real textures only near the camera', async () => {
    const { streamer, scene, source } = setup(grid(32, 48, 6));
    streamer.configure({ detailed: true, radius: 0 });
    await streamer.setMap('Azeroth');
    const from = tileCenter({ tx: 32, ty: 48 });
    const to = tileCenter({ tx: 32, ty: 51 });
    streamer.setRegion({ minX: to.x, maxX: from.x, minY: from.y, maxY: from.y });
    await streamer.update(from);
    expect(scene.terrainKeys.sort()).toEqual(['32_48', '32_49', '32_50', '32_51']);
    expect(source.getTerrainDetail).toHaveBeenCalledTimes(1);
    expect(source.getTerrain).toHaveBeenCalledTimes(3);

    // walking to the far end swaps which tile is detailed
    await streamer.update(to);
    expect(source.getTerrainDetail).toHaveBeenLastCalledWith('Azeroth', { tx: 32, ty: 51 });
    expect(source.getTerrain).toHaveBeenLastCalledWith('Azeroth', { tx: 32, ty: 48 });
    expect(scene.terrainKeys).toHaveLength(4);

    // leaving the region drops it
    streamer.setRegion(undefined);
    await streamer.update(tileCenter({ tx: 32, ty: 54 }));
    expect(scene.terrainKeys).toEqual(['32_54']);
  });
});
