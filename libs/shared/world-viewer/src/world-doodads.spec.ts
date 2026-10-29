import { EMPTY_COLLISION, M2Blend, M2Mesh, ModelPlacement, tileCenter, TileCoord, worldToScene } from '@keira/shared/wow-data';
import { Group, InstancedMesh, Matrix4, MeshBasicMaterial, Vector3 } from 'three';
import { COLLISION_LAYER, COLLISION_MATERIAL } from './collision-object';
import { TextureCache } from './texture-cache';
import { DoodadSource, isTreeModel, WorldDoodads } from './world-doodads';

const model: M2Mesh = {
  positions: new Float32Array(9),
  normals: new Float32Array(9),
  uvs: new Float32Array(6),
  indices: new Uint16Array([0, 1, 2]),
  batches: [
    { start: 0, count: 3, texture: 'tree.blp', textureType: 0, blend: M2Blend.AlphaKey, geoset: 0, twoSided: true, unlit: false },
    { start: 0, count: 3, textureType: 11, blend: M2Blend.Opaque, geoset: 0, twoSided: false, unlit: false },
  ],
  collision: EMPTY_COLLISION,
};
const CENTER = tileCenter({ tx: 32, ty: 48 });
/** A doodad `east` yards east (server −y) of the centre of tile 32_48. */
const doodad = (uniqueId: number, east: number, path = 'World\\Tree.mdx'): ModelPlacement => ({
  uniqueId,
  path,
  position: [CENTER.x, CENTER.y - east, 0],
  rotation: [0, 0, 0, 1],
  scale: 1,
});
/** Loads finish, then the refresh they queued for the next frame runs. */
const flush = async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise((resolve) => setTimeout(resolve));
  }
};

describe('WorldDoodads', () => {
  // the next frame comes right away
  beforeEach(() => vi.stubGlobal('requestAnimationFrame', (callback: () => void) => setTimeout(callback)));
  afterEach(() => vi.unstubAllGlobals());

  const setup = (placementsByTile: Record<string, ModelPlacement[]> = {}) => {
    const source = {
      getTilePlacements: vi.fn().mockImplementation((_d: string, tile: TileCoord) => {
        const doodads = placementsByTile[`${tile.tx}_${tile.ty}`];
        return Promise.resolve(doodads ? { wmos: [], doodads } : undefined);
      }),
      getM2: vi.fn().mockImplementation((path: string) => Promise.resolve(path.includes('Missing') ? undefined : model)),
    } satisfies DoodadSource;
    const group = new Group();
    const textures = new TextureCache(() => Promise.resolve(undefined));
    const onChange = vi.fn();
    const doodads = new WorldDoodads(source, group, textures, onChange);
    doodads.configure({ show: true, distance: 100, smallDistance: 100 });
    return { source, group, doodads, onChange };
  };
  const meshes = (group: Group) => group.children as InstancedMesh[];

  it('draws the doodads within the distance, one instanced mesh per model', async () => {
    const { doodads, group, source, onChange } = setup({
      '32_48': [doodad(1, 0), doodad(2, 50), doodad(3, 500), doodad(4, 10, 'World\\Missing.mdx'), doodad(5, 20, 'World\\Rock.m2')],
      '33_48': [doodad(1, 0)],
    });
    doodads.setMap('Azeroth');
    await doodads.update(CENTER);
    await flush();

    expect(source.getTilePlacements).toHaveBeenCalledTimes(9);
    // the tree is loaded once although two tiles asked for it before it was ready
    expect(source.getM2).toHaveBeenCalledTimes(3);
    expect(source.getM2).toHaveBeenCalledWith('World\\Tree.mdx');
    expect(doodads.drawnCount).toBe(3);
    expect(meshes(group).map((mesh) => [mesh.name, mesh.count])).toEqual([
      ['doodad:world\\tree.m2', 2],
      ['doodad:world\\rock.m2', 1],
    ]);
    const matrix = new Matrix4();
    meshes(group)[0].getMatrixAt(1, matrix);
    const scene = worldToScene({ x: CENTER.x, y: CENTER.y - 50, z: 0 });
    expect(new Vector3().setFromMatrixPosition(matrix).toArray()).toEqual([scene.x, scene.y, scene.z].map(Math.fround));
    expect(meshes(group)[0].boundingSphere).not.toBeNull();
    expect(onChange).toHaveBeenCalled();
    expect(doodads.loadedTiles).toContain('32_48');
  });

  it('turns trees and the other doodads (props) on and off apart', async () => {
    const { doodads, group } = setup({ '32_48': [doodad(1, 0), doodad(5, 20, 'World\\Rock.m2')] });
    doodads.setMap('Azeroth');
    await doodads.update(CENTER);
    await flush();
    const drawn = () =>
      meshes(group)
        .filter((mesh) => mesh.count > 0)
        .map((mesh) => mesh.name);
    expect(drawn()).toEqual(['doodad:world\\tree.m2', 'doodad:world\\rock.m2']);
    doodads.configure({ show: true, distance: 100, smallDistance: 100, trees: false });
    await flush();
    expect(drawn()).toEqual(['doodad:world\\rock.m2']);
    doodads.configure({ show: true, distance: 100, smallDistance: 100, trees: true, props: false });
    await flush();
    expect(drawn()).toEqual(['doodad:world\\tree.m2']);
    expect(isTreeModel('World\\Azeroth\\Elwynn\\PassiveDoodads\\Trees\\ElwynnTree01.m2')).toBe(true);
    expect(isTreeModel('World\\Generic\\Human\\Passive Doodads\\Barrel01.m2')).toBe(false);
  });

  it('makes trees and the other doodads see-through apart, the ones loaded and those to come', async () => {
    const { doodads, group, onChange } = setup({ '32_48': [doodad(1, 0)], '33_48': [doodad(5, 20, 'World\\Rock.m2')] });
    doodads.setMap('Azeroth');
    await doodads.update(CENTER);
    await flush();
    const opacityOf = (name: string) =>
      ((meshes(group).find((mesh) => mesh.name === name)?.material as MeshBasicMaterial[])[1] as MeshBasicMaterial).opacity;
    onChange.mockClear();
    doodads.configure({ show: true, distance: 100, smallDistance: 100, treeOpacity: 0.3, propOpacity: 0.6 });
    expect(onChange).toHaveBeenCalled();
    expect(opacityOf('doodad:world\\tree.m2')).toBeCloseTo(0.3);
    expect(opacityOf('doodad:world\\rock.m2')).toBeCloseTo(0.6);
    // unchanged: nothing to redo
    onChange.mockClear();
    doodads.configure({ show: true, distance: 100, smallDistance: 100, treeOpacity: 0.3, propOpacity: 0.6 });
    expect(onChange).not.toHaveBeenCalled();
    // a model loaded afterwards
    doodads.setMap('Kalimdor');
    doodads.setMap('Azeroth');
    await doodads.update(CENTER);
    await flush();
    expect(opacityOf('doodad:world\\tree.m2')).toBeCloseTo(0.3);
    doodads.configure({ show: true, distance: 100, smallDistance: 100 });
    expect(opacityOf('doodad:world\\tree.m2')).toBeCloseTo(1);
  });

  it('follows the distance, growing the instanced meshes when more doodads come into range', async () => {
    const { doodads, group } = setup({ '32_48': [doodad(1, 0), doodad(2, 60), doodad(3, 80), doodad(4, 90)] });
    doodads.setMap('Azeroth');
    doodads.configure({ show: true, distance: 10, smallDistance: 10 });
    await doodads.update(CENTER);
    await flush();
    const small = meshes(group)[0];
    expect(small.count).toBe(1);

    doodads.configure({ show: true, distance: 10, smallDistance: 10 });
    doodads.configure({ show: true, distance: 85, smallDistance: 85 });
    expect(meshes(group)[0]).not.toBe(small);
    expect(meshes(group)[0].count).toBe(3);

    const grown = meshes(group)[0];
    doodads.configure({ show: true, distance: 100, smallDistance: 100 });
    expect(meshes(group)[0]).toBe(grown);
    expect(doodads.drawnCount).toBe(4);
  });

  it('loads and draws every doodad of the region, whatever the distance, placing unchanged models once', async () => {
    const far = tileCenter({ tx: 40, ty: 40 });
    const farDoodad = { ...doodad(9, 0), position: [far.x, far.y, 0] as [number, number, number] };
    const { doodads, group, source } = setup({ '32_48': [doodad(1, 0)], '40_40': [farDoodad] });
    // the tree arrives after both tiles: asked for once
    let release: () => void = () => undefined;
    source.getM2.mockImplementation(() => new Promise((resolve) => (release = () => resolve(model))));
    doodads.setMap('Azeroth');
    doodads.setRegion({ minX: far.x - 1, maxX: far.x + 1, minY: far.y - 1, maxY: far.y + 1 });
    await doodads.update(CENTER);
    await flush();
    await doodads.update(CENTER);
    await flush();
    release();
    await flush();
    expect(source.getM2).toHaveBeenCalledTimes(1);
    expect(doodads.drawnCount).toBe(2);
    const mesh = meshes(group)[0];
    const setMatrixAt = vi.spyOn(mesh, 'setMatrixAt');
    await doodads.update(CENTER);
    await flush();
    expect(setMatrixAt).not.toHaveBeenCalled();
    expect(doodads.loadedTiles).toContain('40_40');
  });

  it('hides everything when turned off and reloads when turned back on', async () => {
    const { doodads, group, source } = setup({ '32_48': [doodad(1, 0)] });
    doodads.setMap('Azeroth');
    await doodads.update(CENTER);
    await flush();
    expect(doodads.drawnCount).toBe(1);

    doodads.configure({ show: false, distance: 100, smallDistance: 100 });
    expect(group.children).toHaveLength(0);
    await doodads.update(CENTER);
    expect(doodads.loadedTiles).toEqual([]);

    doodads.configure({ show: true, distance: 100, smallDistance: 100 });
    await doodads.update(CENTER);
    await flush();
    expect(doodads.drawnCount).toBe(1);
    expect(source.getM2).toHaveBeenCalledTimes(1);
  });

  it('drops far tiles and the models no longer in range when the camera moves', async () => {
    const { doodads, group } = setup({ '32_48': [doodad(1, 0)], '32_52': [] });
    doodads.setMap('Azeroth');
    await doodads.update(CENTER);
    await flush();
    expect(group.children).toHaveLength(1);

    await doodads.update(tileCenter({ tx: 32, ty: 52 }));
    expect(doodads.loadedTiles).not.toContain('32_48');
    expect(group.children).toHaveLength(0);
  });

  it('gives small and large doodads their own distance', async () => {
    const big: M2Mesh = { ...model, positions: new Float32Array([0, 0, 0, 20, 0, 0, 0, 20, 0]) };
    const { doodads, source } = setup({
      '32_48': [doodad(1, 50), doodad(2, 50, 'World\\Big.m2'), doodad(3, 150, 'World\\Big.m2')],
    });
    source.getM2.mockImplementation((path: string) => Promise.resolve(path.includes('Big') ? big : model));
    doodads.setMap('Azeroth');
    doodads.configure({ show: true, distance: 200, smallDistance: 20 });
    await doodads.update(CENTER);
    await flush();
    // the small tree at 50 yards is beyond its 20-yard distance; both big ones are within 200
    expect(doodads.drawnCount).toBe(2);

    doodads.configure({ show: true, distance: 0, smallDistance: 0 });
    expect(doodads.drawnCount).toBe(0);
    await doodads.update(CENTER);
    expect(source.getTilePlacements).toHaveBeenCalledTimes(9);
  });

  it('instances the collision of models that have one on the collision layer, and removes it with them', async () => {
    const { source, group, doodads } = setup({ '32_48': [doodad(1, 10, 'World\\Fence.mdx'), doodad(2, 20, 'World\\Fence.mdx')] });
    source.getM2.mockResolvedValue({
      ...model,
      collision: { positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: new Uint16Array([0, 1, 2]) },
    });
    doodads.setMap('Azeroth');
    await doodads.update(CENTER);
    await flush();
    const collision = meshes(group).find((mesh) => mesh.layers.isEnabled(COLLISION_LAYER));
    expect(collision?.count).toBe(2);
    expect(collision?.material).toBe(COLLISION_MATERIAL);
    const matrix = new Matrix4();
    collision?.getMatrixAt(1, matrix);
    expect(new Vector3().setFromMatrixPosition(matrix).x).toBeCloseTo(worldToScene({ x: CENTER.x, y: CENTER.y - 20, z: 0 }).x);

    doodads.configure({ show: false, distance: 100, smallDistance: 100 });
    expect(group.children).toHaveLength(0);
  });

  it('does nothing without a map', async () => {
    const { doodads, source } = setup();
    await doodads.update(CENTER);
    expect(source.getTilePlacements).not.toHaveBeenCalled();
  });

  it('reports tiles and models that fail to load', async () => {
    const { doodads, source } = setup({ '32_48': [doodad(1, 0)], '33_48': [doodad(1, 0)] });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    source.getTilePlacements.mockRejectedValueOnce(new Error('bad adt'));
    source.getM2.mockRejectedValueOnce(new Error('bad m2'));
    doodads.setMap('Azeroth');
    await doodads.update(CENTER);
    await flush();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('bad adt'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('bad m2'));
    expect(doodads.drawnCount).toBe(0);
  });

  it('ignores tiles that finish loading after a map change or once the camera left', async () => {
    const { doodads, source } = setup({ '32_48': [doodad(1, 0)] });
    let resolveTile: (value: unknown) => void = () => undefined;
    source.getTilePlacements.mockReturnValueOnce(new Promise((resolve) => (resolveTile = resolve)));
    doodads.setMap('Azeroth');
    const first = doodads.update(CENTER);
    doodads.setMap('Kalimdor');
    resolveTile({ wmos: [], doodads: [doodad(1, 0)] });
    await first;
    expect(doodads.loadedTiles).toEqual([]);

    source.getTilePlacements.mockReturnValueOnce(new Promise((resolve) => (resolveTile = resolve)));
    const second = doodads.update(CENTER);
    void doodads.update(tileCenter({ tx: 32, ty: 60 }));
    resolveTile({ wmos: [], doodads: [doodad(1, 0)] });
    await second;
    expect(doodads.loadedTiles).not.toContain('31_47');
  });

  it('stops loading the tiles of a map left meanwhile, even after a tile that failed', async () => {
    const { doodads, source } = setup({ '32_48': [doodad(1, 0)] });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    let fail: (error: Error) => void = () => undefined;
    source.getTilePlacements.mockReturnValueOnce(new Promise((_resolve, reject) => (fail = reject)));
    doodads.setMap('Azeroth');
    const first = doodads.update(CENTER);
    const asked = source.getTilePlacements.mock.calls.length;
    doodads.setMap('Kalimdor');
    fail(new Error('bad tile'));
    await first;
    // (the other tiles of Azeroth weren't asked for)
    expect(source.getTilePlacements.mock.calls.length).toBe(asked);
    warn.mockRestore();
  });

  it('disposes its models, including those still loading', async () => {
    const { doodads, source } = setup({ '32_48': [doodad(1, 0), doodad(2, 5, 'World\\Missing.mdx')] });
    doodads.setMap('Azeroth');
    await doodads.update(CENTER);
    await flush();
    doodads.dispose();
    expect(doodads.drawnCount).toBe(0);

    // models that arrive after dispose() are thrown away
    const late = setup({ '32_48': [doodad(1, 0), doodad(2, 5, 'World\\Missing.mdx')] });
    const pending: (() => void)[] = [];
    late.source.getM2.mockImplementation(
      (path: string) => new Promise((resolve) => pending.push(() => resolve(path.includes('Missing') ? undefined : model))),
    );
    late.doodads.setMap('Azeroth');
    await late.doodads.update(CENTER);
    await flush();
    late.doodads.dispose();
    pending.forEach((resolve) => resolve());
    await flush();
    expect(pending).toHaveLength(2);
    expect(late.doodads.drawnCount).toBe(0);
    expect(source.getM2).toHaveBeenCalledTimes(2);
  });
});
