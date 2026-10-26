import { ModelPlacement, tileCenter, TileCoord, WmoModel } from '@keira/shared/wow-data';
import { Group } from 'three';
import { TextureCache } from './texture-cache';
import { ObjectSource, WorldObjects } from './world-objects';

const model: WmoModel = {
  materials: [
    { texture: 'a.blp', twoSided: false, unlit: false },
    { twoSided: false, unlit: false },
  ],
  groups: [
    {
      positions: new Float32Array(9),
      normals: new Float32Array(9),
      uvs: new Float32Array(6),
      indices: new Uint16Array([0, 1, 2]),
      batches: [{ start: 0, count: 3, material: 0 }],
      indoor: false,
    },
  ],
};
const placement = (uniqueId: number, path = 'abbey.wmo'): ModelPlacement => ({
  uniqueId,
  path,
  position: [0, 0, 0],
  rotation: [0, 0, 0, 1],
  scale: 1,
});

describe('WorldObjects', () => {
  const setup = (placementsByTile: Record<string, ModelPlacement[]> = {}) => {
    const source: ObjectSource = {
      getTilePlacements: vi.fn().mockImplementation((_d: string, tile: TileCoord) => {
        const wmos = placementsByTile[`${tile.tx}_${tile.ty}`];
        return Promise.resolve(wmos ? { wmos, doodads: [] } : undefined);
      }),
      getWmo: vi.fn().mockImplementation((path: string) => Promise.resolve(path === 'missing.wmo' ? undefined : model)),
    };
    const group = new Group();
    const textures = new TextureCache(() => Promise.resolve(undefined));
    const onChange = vi.fn();
    const objects = new WorldObjects(source, group, textures, onChange);
    objects.configure({ showBuildings: true, radius: 0 });
    return { source, group, objects, onChange };
  };

  it('places the buildings of the tiles around the camera, once per unique id and file', async () => {
    const { objects, group, source, onChange } = setup({
      '32_48': [placement(1), placement(2, 'missing.wmo')],
      '33_48': [placement(1), placement(3)],
    });
    objects.setMap('Azeroth');
    objects.configure({ showBuildings: true, radius: 1 });
    await objects.update(tileCenter({ tx: 32, ty: 48 }));
    expect(objects.placedCount).toBe(2);
    expect(group.children.map((c) => c.name).sort()).toEqual(['wmo:1', 'wmo:3']);
    expect(source.getWmo).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenCalled();

    await objects.update(tileCenter({ tx: 32, ty: 48 }));
    expect(source.getTilePlacements).toHaveBeenCalledTimes(9);
  });

  it('keeps shared buildings until no loaded tile lists them', async () => {
    const { objects, group } = setup({ '32_48': [placement(1)], '34_48': [placement(1), placement(2)] });
    objects.setMap('Azeroth');
    objects.configure({ showBuildings: true, radius: 2 });
    await objects.update(tileCenter({ tx: 32, ty: 48 }));
    expect(objects.placedCount).toBe(2);

    // moving east drops tile 32 (> radius + 1 away) but 34 still lists building 1
    await objects.update(tileCenter({ tx: 36, ty: 48 }));
    expect(objects.loadedTiles).not.toContain('32_48');
    expect(group.children.map((c) => c.name).sort()).toEqual(['wmo:1', 'wmo:2']);

    await objects.update(tileCenter({ tx: 40, ty: 48 }));
    expect(objects.placedCount).toBe(0);
  });

  it('does nothing without a map or with buildings hidden', async () => {
    const { objects, source } = setup({ '32_48': [placement(1)] });
    await objects.update(tileCenter({ tx: 32, ty: 48 }));
    objects.setMap('Azeroth');
    objects.configure({ showBuildings: false, radius: 0 });
    objects.configure({ showBuildings: false, radius: 0 });
    await objects.update(tileCenter({ tx: 32, ty: 48 }));
    expect(source.getTilePlacements).not.toHaveBeenCalled();
  });

  it('drops what a tile placed when the camera leaves while it loads, and ignores loads of a previous map', async () => {
    const { objects, group, source } = setup({ '32_48': [placement(1), placement(2, 'second.wmo')] });
    let release: () => void = () => undefined;
    vi.mocked(source.getWmo)
      .mockImplementationOnce(() => Promise.resolve(model))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            release = () => resolve(model);
          }),
      );
    objects.setMap('Azeroth');
    const loading = objects.update(tileCenter({ tx: 32, ty: 48 }));
    // building 1 is placed, building 2 is still loading
    await vi.waitFor(() => expect(source.getWmo).toHaveBeenCalledTimes(2));
    await objects.update(tileCenter({ tx: 40, ty: 48 }));
    release();
    await loading;
    // first building loaded, second still pending when the camera moved: both gone
    expect(group.children.length).toBe(0);

    const second = setup({ '32_48': [placement(1)] });
    let releaseMap: () => void = () => undefined;
    vi.mocked(second.source.getWmo).mockImplementation(() => new Promise((resolve) => (releaseMap = () => resolve(model))));
    second.objects.setMap('Azeroth');
    const stale = second.objects.update(tileCenter({ tx: 32, ty: 48 }));
    await vi.waitFor(() => expect(second.source.getWmo).toHaveBeenCalled());
    second.objects.setMap('Kalimdor');
    releaseMap();
    await stale;
    expect(second.group.children.length).toBe(0);
  });

  it('warns about tiles that fail, retries failed files, and disposes templates', async () => {
    const { objects, source } = setup({ '32_48': [placement(1)] });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.mocked(source.getWmo).mockRejectedValueOnce(new Error('bad wmo'));
    objects.setMap('Azeroth');
    await objects.update(tileCenter({ tx: 32, ty: 48 }));
    expect(warn).toHaveBeenCalledWith('[World Editor] Could not load the buildings of Azeroth_32_48: bad wmo');

    objects.setMap('Azeroth');
    await objects.update(tileCenter({ tx: 32, ty: 48 }));
    expect(objects.placedCount).toBe(1);
    objects.setMap('Azeroth');
    vi.mocked(source.getTilePlacements).mockResolvedValueOnce({ wmos: [placement(5, 'missing.wmo')], doodads: [] });
    await objects.update(tileCenter({ tx: 32, ty: 48 }));
    objects.dispose();
    expect(objects.placedCount).toBe(0);
  });
});
