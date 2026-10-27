import { TILE_SIZE, tileCenter, TileCoord, VmapGroup, VmapSpawn, worldToScene } from '@keira/shared/wow-data';
import { Group, Mesh, Vector3 } from 'three';
import { SERVER_COLLISION_LAYER } from './collision-object';
import { VmapSource, WorldVmaps } from './world-vmaps';

const MID = 32 * TILE_SIZE;
const CENTER = tileCenter({ tx: 32, ty: 48 });
const TRIANGLE: VmapGroup = { vertices: Float32Array.from([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: Uint32Array.from([0, 1, 2]) };
/** A spawn whose model origin lands on a server position. */
const spawn = (id: number, name: string, x = CENTER.x, y = CENTER.y): VmapSpawn => ({
  flags: 0,
  id,
  position: [MID - x, MID - y, 5],
  rotation: [0, 0, 0],
  scale: 1,
  name,
});

describe('WorldVmaps', () => {
  const setup = (
    tiles: Record<string, VmapSpawn[]> = {
      '32_48': [spawn(1, 'Bank.wmo'), spawn(2, 'Empty.wmo'), spawn(3, 'Missing.wmo')],
      '33_48': [spawn(1, 'Bank.wmo')],
    },
  ) => {
    const source = {
      getVmapTile: vi.fn((_m: number, tile: TileCoord) => Promise.resolve(tiles[`${tile.tx}_${tile.ty}`])),
      getVmapModel: vi.fn((name: string) =>
        Promise.resolve(
          name === 'Bank.wmo'
            ? [TRIANGLE, { vertices: new Float32Array(0), indices: new Uint32Array(0) }]
            : name === 'Empty.wmo'
              ? []
              : undefined,
        ),
      ),
    } satisfies VmapSource;
    const group = new Group();
    const onChange = vi.fn();
    const vmaps = new WorldVmaps(source, group, onChange);
    return { source, group, vmaps, onChange };
  };

  it('loads the models of the vmap tiles around the camera once each, placed like the server places them', async () => {
    const { source, group, vmaps, onChange } = setup();
    vmaps.setMap(0);
    await vmaps.update(CENTER);
    expect(source.getVmapTile).not.toHaveBeenCalled();
    vmaps.configure({ enabled: true, radius: 1 });
    vmaps.configure({ enabled: true, radius: 1 });
    await vmaps.update(CENTER);
    expect(source.getVmapTile).toHaveBeenCalledTimes(9);
    expect(vmaps.active).toBe(true);
    expect(vmaps.pendingCount).toBe(0);
    // the bank is listed by two tiles, the empty model has no triangles
    expect(vmaps.spawnCount).toBe(1);
    expect(source.getVmapModel).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenCalled();
    const mesh = group.children[0] as Mesh;
    expect(mesh.layers.isEnabled(SERVER_COLLISION_LAYER)).toBe(true);
    const origin = new Vector3(0, 0, 0).applyMatrix4(mesh.matrixWorld);
    const expected = worldToScene({ x: CENTER.x, y: CENTER.y, z: 5 });
    expect(origin.x).toBeCloseTo(expected.x, 3);
    expect(origin.y).toBeCloseTo(expected.y, 3);
    expect(origin.z).toBeCloseTo(expected.z, 3);
    await vmaps.update(CENTER);
    expect(source.getVmapTile).toHaveBeenCalledTimes(9);
  });

  it('drops tiles left behind, keeping models still listed by a tile around', async () => {
    const { group, vmaps } = setup();
    vmaps.setMap(0);
    vmaps.configure({ enabled: true, radius: 0 });
    await vmaps.update(CENTER);
    await vmaps.update(tileCenter({ tx: 33, ty: 48 }));
    expect(group.children).toHaveLength(1);
    await vmaps.update(tileCenter({ tx: 40, ty: 48 }));
    expect(group.children).toHaveLength(0);
    expect(vmaps.active).toBe(true);
  });

  it('starts over on another map, stops when disabled, and drops what loads after the camera moved on', async () => {
    const { source, group, vmaps } = setup();
    vmaps.configure({ enabled: true, radius: 0 });
    await vmaps.update(CENTER);
    expect(source.getVmapTile).not.toHaveBeenCalled();
    vmaps.setMap(0);
    vmaps.setMap(0);
    // the map changes while a tile loads
    let finish: (spawns: VmapSpawn[]) => void = () => undefined;
    source.getVmapTile.mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
    const loading = vmaps.update(CENTER);
    vmaps.setMap(1);
    finish([spawn(1, 'Bank.wmo')]);
    await loading;
    expect(group.children).toHaveLength(0);

    // the camera moves on while a tile loads
    let finishFar: (spawns: VmapSpawn[]) => void = () => undefined;
    source.getVmapTile.mockReturnValueOnce(new Promise((resolve) => (finishFar = resolve)));
    const far = vmaps.update(CENTER);
    void vmaps.update(tileCenter({ tx: 40, ty: 48 }));
    finishFar([spawn(1, 'Bank.wmo')]);
    await far;
    expect(group.children).toHaveLength(0);

    vmaps.configure({ enabled: false, radius: 0 });
    expect(vmaps.active).toBe(false);
    vmaps.dispose();
  });
});
