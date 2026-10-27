import {
  LiquidMesh,
  M2Mesh,
  MmapRecastConfig,
  ModelPlacement,
  navTerrainColor,
  TILE_SIZE,
  tileCenter,
  WmoModel,
  worldToScene,
} from '@keira/shared/wow-data';
import { collectTileGeometry, loadRecast, NavMeshRebuildSource, rebuildNavMeshTile, recastTileBounds } from './navmesh-rebuild';
import { flatTile } from './world-viewer.mock';

const TILE = { tx: 32, ty: 48 };
const CENTER = tileCenter(TILE);
const GROUND = 50;

/** A horizontal square (two up-facing triangles) in scene axes, `half` yards around a server position. */
const square = (x: number, y: number, z: number, half: number) => {
  const s = worldToScene({ x, y, z });
  const [x0, x1, z0, z1] = [s.x - half, s.x + half, s.z - half, s.z + half];
  return {
    positions: Float32Array.from([x0, s.y, z0, x0, s.y, z1, x1, s.y, z0, x1, s.y, z1]),
    indices: Uint16Array.from([0, 1, 2, 2, 1, 3]),
  };
};

const placement = (uniqueId: number, path: string, x: number, y: number): ModelPlacement => ({
  uniqueId,
  path,
  position: [x, y, GROUND],
  rotation: [0, 0, 0, 1],
  scale: 1,
});

const CONFIG: MmapRecastConfig = {
  walkableSlopeAngle: 50,
  walkableHeight: 6,
  walkableClimb: 4,
  walkableRadius: 1,
  verticesPerMapEdge: 2000,
  verticesPerTileEdge: 80,
  cellSizeHorizontal: 2,
  cellSizeVertical: 0.5,
  maxSimplificationError: 1.8,
};

describe('navmesh rebuild', () => {
  const lake: LiquidMesh = { type: 1, kind: 'water', ...square(CENTER.x, CENTER.y, GROUND + 0.5, 60) };
  // a box on the ground: its top is walkable
  const crate = { positions: square(0, 0, 0, 1).positions, indices: square(0, 0, 0, 1).indices };
  const setup = () => {
    const near = CENTER;
    const source = {
      getTerrain: vi.fn((_d: string, tile: { tx: number; ty: number }) =>
        Promise.resolve(tile.tx === 32 && tile.ty === 48 ? flatTile(GROUND) : undefined),
      ),
      getTerrainDetail: vi.fn((_d: string, tile: { tx: number; ty: number }) =>
        Promise.resolve(
          tile.tx === 32 && tile.ty === 48
            ? { liquids: [lake] }
            : tile.tx === 33 && tile.ty === 48
              ? { liquids: [{ type: 3, kind: 'slime', ...square(CENTER.x, CENTER.y - 1500, GROUND, 5) } as LiquidMesh] }
              : undefined,
        ),
      ),
      getTilePlacements: vi.fn((_d: string, tile: { tx: number; ty: number }) =>
        Promise.resolve(
          tile.tx === 31
            ? undefined
            : {
                // the same building is listed by every tile it overlaps
                wmos: [
                  placement(1, 'house.wmo', near.x + 30, near.y),
                  placement(2, 'missing.wmo', near.x, near.y + 30),
                  placement(3, 'far.wmo', 0, 0),
                ],
                doodads: [
                  placement(10, 'crate.m2', near.x - 30, near.y),
                  placement(11, 'bush.m2', near.x, near.y - 30),
                  placement(12, 'missing.m2', near.x, near.y - 40),
                ],
              },
        ),
      ),
      getWmo: vi.fn((path: string) =>
        Promise.resolve(
          path === 'house.wmo' ? ({ materials: [], groups: [{ collision: square(0, 0, 0, 1) }, {}] } as unknown as WmoModel) : undefined,
        ),
      ),
      getM2: vi.fn((path: string) =>
        Promise.resolve(
          path === 'crate.m2'
            ? ({ collision: crate } as M2Mesh)
            : path === 'bush.m2'
              ? ({ collision: { positions: new Float32Array(0), indices: new Uint16Array(0) } } as M2Mesh)
              : undefined,
        ),
      ),
    } satisfies NavMeshRebuildSource;
    return { source };
  };

  it('knows the bounds of a tile in Recast axes', () => {
    expect(recastTileBounds({ tx: 32, ty: 48 })).toEqual({ minX: -TILE_SIZE, maxX: 0, minZ: -17 * TILE_SIZE, maxZ: -16 * TILE_SIZE });
  });

  it('collects the terrain, liquids and collision on and around the tile, in Recast axes', async () => {
    const { source } = setup();
    const geometry = await collectTileGeometry(source, 'Azeroth', TILE);
    const terrain = flatTile(GROUND).indices.length / 3;
    // terrain + lake + house (one group with collision) + crate; the slime far away and the far building are left out
    expect(geometry.indices.length / 3).toBe(terrain + 2 + 2 + 2);
    expect(geometry.areas.length).toBe(geometry.indices.length / 3);
    expect([...geometry.areas].filter((area) => area === 8)).toHaveLength(2);
    expect([...geometry.areas].filter((area) => area === 1)).toHaveLength(terrain + 4);
    expect(source.getWmo).toHaveBeenCalledTimes(2);
    expect(source.getWmo).not.toHaveBeenCalledWith('far.wmo');
    expect(source.getM2).toHaveBeenCalledTimes(3);
    // Recast x = server y, Recast z = server x
    const bounds = recastTileBounds(TILE);
    for (let i = 0; i < geometry.positions.length; i += 3) {
      expect(geometry.positions[i]).toBeGreaterThan(bounds.minX - 600);
      expect(geometry.positions[i + 2]).toBeLessThan(bounds.maxZ + 600);
    }
  });

  it('rebuilds the tile with the given settings: ground and water, inside the tile', { timeout: 60_000 }, async () => {
    const { source } = setup();
    const geometry = await collectTileGeometry(source, 'Azeroth', TILE);
    const recast = await loadRecast();
    expect(await loadRecast()).toBe(recast);
    const progress = vi.fn();
    const tile = await rebuildNavMeshTile(recast, geometry, TILE, CONFIG, progress);
    expect(tile?.config).toBe(CONFIG);
    expect(progress).toHaveBeenLastCalledWith(16, 16);
    const positions = tile?.positions as Float32Array;
    const colors = tile?.colors as Float32Array;
    expect(positions.length).toBeGreaterThan(0);
    expect(colors.length).toBe(positions.length);
    const colorAt = (i: number) => [colors[i], colors[i + 1], colors[i + 2]];
    const found = new Set<string>();
    for (let i = 0; i < positions.length; i += 3) {
      found.add(colorAt(i).join());
      // scene (−y, z, −x): inside the tile, on the ground or the lake
      const server = { x: -positions[i + 2], y: -positions[i] };
      expect(Math.abs(server.x - CENTER.x)).toBeLessThan(267);
      expect(Math.abs(server.y - CENTER.y)).toBeLessThan(267);
      expect(positions[i + 1]).toBeGreaterThan(GROUND - 2);
      expect(positions[i + 1]).toBeLessThan(GROUND + 3);
    }
    const asStored = (flags: number) => [...Float32Array.from(navTerrainColor(flags))].join();
    expect(found).toEqual(new Set([asStored(1), asStored(8)]));
  });

  it('stops when cancelled, skips sub-tiles Recast cannot build and refuses invalid settings', async () => {
    const { source } = setup();
    const geometry = await collectTileGeometry(source, 'Azeroth', TILE);
    const recast = await loadRecast();
    expect(await rebuildNavMeshTile(recast, geometry, TILE, CONFIG, undefined, () => true)).toBeUndefined();
    const config = { ...CONFIG, cellSizeHorizontal: 40 };
    const noHeightfield = await rebuildNavMeshTile({ ...recast, createHeightfield: () => false }, geometry, TILE, config);
    expect(noHeightfield?.positions).toHaveLength(0);
    const noContours = await rebuildNavMeshTile({ ...recast, buildContours: () => false }, geometry, TILE, config);
    expect(noContours?.positions).toHaveLength(0);
    // nothing to build at all
    const empty = { positions: new Float32Array(0), indices: new Uint32Array(0), areas: new Uint8Array(0) };
    expect((await rebuildNavMeshTile(recast, empty, TILE, config))?.positions).toHaveLength(0);
    await expect(rebuildNavMeshTile(recast, geometry, TILE, { ...CONFIG, cellSizeHorizontal: 0 })).rejects.toThrow('Invalid settings');
    await expect(rebuildNavMeshTile(recast, geometry, TILE, { ...CONFIG, verticesPerTileEdge: 0 })).rejects.toThrow('Invalid settings');
  });
});
