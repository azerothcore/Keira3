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
    // already loaded tiles aren't read again
    await navMesh.update(CENTER);
    expect(source.getNavMeshTile).toHaveBeenCalledTimes(16);
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
});
