import { NavMeshTile, tileCenter, TileCoord } from '@keira/shared/wow-data';
import { Group, Mesh, MeshBasicMaterial } from 'three';
import { NavMeshSource, WorldNavMesh } from './world-navmesh';

const TILE: NavMeshTile = { positions: new Float32Array(9), colors: new Float32Array(9) };
const CENTER = tileCenter({ tx: 32, ty: 48 });

describe('WorldNavMesh', () => {
  const setup = (tiles: Record<string, NavMeshTile> = { '32_48': TILE, '33_48': TILE }) => {
    const source = {
      getNavMeshTile: vi.fn().mockImplementation((_d: string, tile: TileCoord) => Promise.resolve(tiles[`${tile.tx}_${tile.ty}`])),
    } satisfies NavMeshSource;
    const group = new Group();
    const onChange = vi.fn();
    const navMesh = new WorldNavMesh(source, group, onChange);
    return { source, group, navMesh, onChange };
  };

  it('draws nothing until turned on, then the tiles around the camera, see-through with their edges', async () => {
    const { source, group, navMesh, onChange } = setup();
    navMesh.setMap('Azeroth');
    await navMesh.update(CENTER);
    expect(source.getNavMeshTile).not.toHaveBeenCalled();

    navMesh.configure({ show: true, radius: 1 });
    navMesh.configure({ show: true, radius: 1 });
    await navMesh.update(CENTER);
    expect(source.getNavMeshTile).toHaveBeenCalledTimes(9);
    expect(navMesh.loadedTiles.sort()).toEqual(['32_48', '33_48']);
    expect(navMesh.pendingCount).toBe(0);
    expect(onChange).toHaveBeenCalled();
    const [fill, edges] = group.children[0].children as Mesh[];
    expect((fill.material as MeshBasicMaterial).transparent).toBe(true);
    expect((edges.material as MeshBasicMaterial).wireframe).toBe(true);
    expect(fill.raycast(undefined as never, [])).toBeUndefined();
    // tiles already read (with a file or without) aren't read again
    await navMesh.update(CENTER);
    expect(source.getNavMeshTile).toHaveBeenCalledTimes(9);
    expect(navMesh.tileAt('32_48')).toBe(TILE);
    expect(navMesh.tileAt('31_47')).toBeNull();
    expect(navMesh.tileAt('10_10')).toBeUndefined();
  });

  it('also reads every tile of the region', async () => {
    const { source, navMesh } = setup();
    navMesh.setMap('Azeroth');
    navMesh.configure({ show: true, radius: 0 });
    const far = tileCenter({ tx: 40, ty: 40 });
    navMesh.setRegion({ minX: far.x - 1, maxX: far.x + 1, minY: far.y - 1, maxY: far.y + 1 });
    await navMesh.update(CENTER);
    expect(source.getNavMeshTile).toHaveBeenCalledWith('Azeroth', { tx: 40, ty: 40 });
    expect(navMesh.tileAt('40_40')).toBeNull();
  });

  it('draws the edges of the tile the camera is on in their own colour', async () => {
    const { group, navMesh, onChange } = setup();
    navMesh.configure({ show: true, radius: 1 });
    navMesh.setMap('Azeroth');
    navMesh.setCurrent('32_48');
    await navMesh.update(CENTER);
    const edges = (key: string) => (group.getObjectByName(`navmesh:${key}`)?.children[1] as Mesh).material as MeshBasicMaterial;
    expect(edges('32_48').color.getHex()).toBe(0xfff35c);
    expect(edges('33_48').vertexColors).toBe(true);
    onChange.mockClear();
    navMesh.setCurrent('32_48');
    expect(onChange).not.toHaveBeenCalled();
    navMesh.setCurrent('33_48');
    expect(edges('33_48').color.getHex()).toBe(0xfff35c);
    expect(edges('32_48').vertexColors).toBe(true);
    expect(onChange).toHaveBeenCalled();
  });

  it('drops tiles out of range, and everything when turned off or the map changes', async () => {
    const { group, navMesh } = setup();
    navMesh.configure({ show: true, radius: 0 });
    navMesh.setMap('Azeroth');
    await navMesh.update(CENTER);
    expect(navMesh.loadedTiles).toEqual(['32_48']);
    await navMesh.update(tileCenter({ tx: 33, ty: 48 }));
    expect(navMesh.loadedTiles).toEqual(['33_48']);
    navMesh.configure({ show: false, radius: 0 });
    expect(group.children).toHaveLength(0);
    navMesh.configure({ show: true, radius: 0 });
    await navMesh.update(CENTER);
    navMesh.setMap(undefined);
    expect(group.children).toHaveLength(0);
    await navMesh.update(CENTER);
    expect(group.children).toHaveLength(0);
  });

  it('ignores tiles that arrive after a map change, the camera left, or that are empty', async () => {
    let resolve: (tile: NavMeshTile) => void = () => undefined;
    const { source, navMesh } = setup({ '32_49': { positions: new Float32Array(0), colors: new Float32Array(0) } });
    source.getNavMeshTile.mockReturnValueOnce(new Promise((r) => (resolve = r)));
    navMesh.configure({ show: true, radius: 0 });
    navMesh.setMap('Azeroth');
    const pending = navMesh.update(CENTER);
    navMesh.setMap('Kalimdor');
    resolve(TILE);
    await pending;
    expect(navMesh.loadedTiles).toEqual([]);

    source.getNavMeshTile.mockReturnValueOnce(new Promise((r) => (resolve = r)));
    const first = navMesh.update(CENTER);
    const second = navMesh.update(tileCenter({ tx: 32, ty: 49 }));
    resolve(TILE);
    await Promise.all([first, second]);
    expect(navMesh.loadedTiles).toEqual([]);
    navMesh.dispose();
  });

  it('draws a rebuilt tile over the real one with its own edges, can hide the real one, and replaces or removes it', async () => {
    const { group, navMesh, onChange } = setup();
    navMesh.configure({ show: true, radius: 1 });
    navMesh.setMap('Azeroth');
    await navMesh.update(CENTER);
    const real = () => group.getObjectByName('navmesh:32_48') as Group;
    const preview = () => group.getObjectByName('navmesh-preview:32_48') as Group | undefined;

    onChange.mockClear();
    navMesh.setPreview('32_48', TILE);
    expect(onChange).toHaveBeenCalled();
    const [fill, edges] = (preview() as Group).children as Mesh[];
    expect((edges.material as MeshBasicMaterial).color.getHex()).toBe(0xff40ff);
    expect(fill.renderOrder).toBe(2);
    expect(fill.raycast(undefined as never, [])).toBeUndefined();
    expect(real().visible).toBe(true);

    navMesh.setRealHidden(true);
    expect(real().visible).toBe(false);
    expect((group.getObjectByName('navmesh:33_48') as Group).visible).toBe(true);
    navMesh.setRealHidden(false);
    expect(real().visible).toBe(true);

    navMesh.setRealHidden(true);
    navMesh.setPreview('33_48', TILE);
    expect(preview()).toBeUndefined();
    expect(real().visible).toBe(true);
    expect((group.getObjectByName('navmesh:33_48') as Group).visible).toBe(false);
    navMesh.setPreview(undefined);
    expect(group.getObjectByName('navmesh-preview:33_48')).toBeUndefined();

    // another map drops it; dispose too
    navMesh.setPreview('32_48', TILE);
    navMesh.setMap('Kalimdor');
    expect(preview()).toBeUndefined();
    navMesh.setPreview('32_48', TILE);
    navMesh.dispose();
    expect(group.children).toHaveLength(0);
  });
});
