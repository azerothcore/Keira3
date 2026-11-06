import { NavMeshTile, tileCenter, TileCoord, worldToScene, WorldPosition } from '@keira/shared/wow-data';
import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { COLLISION_LAYER } from './collision-object';
import { PathProber } from './path-probe';
import { flatTile } from './world-viewer.mock';
import { WorldScene } from './world-scene';

const CENTER = tileCenter({ tx: 32, ty: 48 });
const at = (north: number, west = 0, z = 10): WorldPosition => ({ x: CENTER.x + north, y: CENTER.y + west, z });

/** A navigation mesh tile: one square of `size` yards around the centre, at height 10, minus nothing. */
function square(size = 100): NavMeshTile {
  const corners = [at(-size, -size), at(size, -size), at(size, size), at(-size, size)].map(worldToScene);
  const positions = [0, 1, 2, 0, 2, 3].flatMap((k) => [corners[k].x, corners[k].y, corners[k].z]);
  return { positions: Float32Array.from(positions), colors: new Float32Array(positions.length) };
}

describe('PathProber', () => {
  const setup = (tiles: Record<string, NavMeshTile> = { '32_48': square() }) => {
    const world = new WorldScene();
    world.setTerrainTile(flatTile(10));
    const source = {
      getNavMeshTile: vi.fn().mockImplementation((_d: string, tile: TileCoord) => Promise.resolve(tiles[`${tile.tx}_${tile.ty}`])),
    };
    return { world, source, prober: new PathProber(source, world) };
  };
  const wall = (world: WorldScene, north: number) => {
    const mesh = new Mesh(new BoxGeometry(20, 20, 1), new MeshBasicMaterial());
    const p = worldToScene(at(north));
    mesh.position.copy(new Vector3(p.x, 10, p.z));
    mesh.layers.set(COLLISION_LAYER);
    world.buildingGroup.add(mesh);
  };

  it('only marks A until C is picked', async () => {
    const { prober, source } = setup();
    expect(await prober.probe('Azeroth', { from: at(0), range: 30, height: 2 })).toEqual({ from: at(0) });
    expect(source.getNavMeshTile).not.toHaveBeenCalled();
  });

  it('attacks from A when C is in range and in sight, and still gives the path', async () => {
    const { prober } = setup();
    const result = await prober.probe('Azeroth', { from: at(0), to: at(20), range: 30, height: 2 });
    expect(result.blockedAt).toBeUndefined();
    expect(result.attackFrom).toEqual(at(0));
    expect(result.attackDistance).toBeCloseTo(20);
    expect(result.walkToAttack).toBe(0);
    expect(result.length).toBeCloseTo(20);
  });

  it('walks until C is in range, and around a wall until it sees C', async () => {
    const { world, prober } = setup();
    const far = await prober.probe('Azeroth', { from: at(0), to: at(60), range: 30, height: 2 });
    expect(far.attackFrom?.x).toBeCloseTo(CENTER.x + 30);
    expect(far.walkToAttack).toBeCloseTo(30);

    wall(world, 50);
    const hidden = await prober.probe('Azeroth', { from: at(0), to: at(60), range: 30, height: 2 });
    expect(hidden.blockedAt?.x).toBeCloseTo(CENTER.x + 49.5);
    // (this navigation mesh goes through the wall) C is only seen from the wall on
    expect(hidden.attackFrom?.x).toBeGreaterThanOrEqual(CENTER.x + 49.5);
    expect(hidden.length).toBeCloseTo(60);
  });

  it('finds no attack position when C is never in range along the path', async () => {
    const { prober } = setup();
    const result = await prober.probe('Azeroth', { from: at(0), to: at(30, 30), range: -1, height: 2 });
    expect(result.length).toBeCloseTo(Math.hypot(30, 30));
    expect(result.attackFrom).toBeUndefined();
  });

  it('says when there is no navigation mesh, no path, or A and C are too far apart', async () => {
    const empty = setup({});
    expect((await empty.prober.probe('Azeroth', { from: at(0), to: at(20), range: 5, height: 2 })).noNavMesh).toBe(true);

    const island = setup({ '32_48': square(10) });
    const unreachable = await island.prober.probe('Azeroth', { from: at(0), to: at(200), range: 5, height: 2 });
    expect(unreachable.path).toBeUndefined();
    expect(unreachable.attackFrom).toBeUndefined();

    const tooFar = await island.prober.probe('Azeroth', { from: at(0), to: at(5000, 5000), range: 5, height: 2 });
    expect(tooFar.tooFar).toBe(true);
  });

  it('reuses the navigation mesh between probes over the same tiles', async () => {
    const { prober, source } = setup();
    await prober.probe('Azeroth', { from: at(0), to: at(60), range: 5, height: 2 });
    await prober.probe('Azeroth', { from: at(10), to: at(50), range: 5, height: 2 });
    expect(source.getNavMeshTile).toHaveBeenCalledTimes(9);
  });

  describe('checking waypoint paths', () => {
    /** Navigation mesh rectangles (north and west ranges, yards from the centre) at height 10, in one tile. */
    const rects = (...list: [number, number, number, number][]): NavMeshTile => {
      const positions: number[] = [];
      for (const [n0, n1, w0, w1] of list) {
        const corners = [at(n0, w0), at(n1, w0), at(n1, w1), at(n0, w1)].map(worldToScene);
        positions.push(...[0, 1, 2, 0, 2, 3].flatMap((k) => [corners[k].x, corners[k].y, corners[k].z]));
      }
      return { positions: Float32Array.from(positions), colors: new Float32Array(positions.length) };
    };
    const check = (prober: PathProber, points: WorldPosition[]) =>
      prober.checkPath('Azeroth', { pathKey: 'path:1', points: points.map((position, i) => ({ point: i + 1, position })) });
    const summary = (checks: Awaited<ReturnType<typeof check>>) =>
      checks.map((c) => `${c.place} ${c.status} ${c.reason.replace('WORLD_EDITOR.CHECK_', '')}`);

    it('passes points on the navigation mesh that reach each other', async () => {
      const { prober } = setup();
      const checks = await check(prober, [at(0), at(20)]);
      expect(checks[1]).toEqual({ key: 'path:1#2', point: 2, place: 'ground', status: 'ok', reason: 'WORLD_EDITOR.CHECK_OK' });
      expect(summary(checks)).toEqual(['ground ok OK', 'ground ok OK']);
    });

    it('warns off the mesh, inside something or on a detour, and fails where nothing is walkable or reachable', async () => {
      // two strips joined far north, and an island
      const { world, prober } = setup({
        '32_48': rects([0, 96, -2, 2], [0, 96, 8, 12], [96, 100, -2, 2], [96, 100, 2, 8], [96, 100, 8, 12], [-50, -40, -50, -40]),
      });
      // 2.8 yards over the mesh: off it, snapped back down
      expect(summary(await check(prober, [at(50), at(50, 0, 12.8)]))).toEqual(['ground ok OK', 'ground warn OFF_MESH']);
      expect(summary(await check(prober, [at(0), at(0, 10)]))[1]).toBe('ground warn DETOUR');
      expect((await check(prober, [at(0), at(0, 10)]))[1].params).toEqual({ from: 1, walked: expect.any(Number), straight: 10 });
      expect(summary(await check(prober, [at(0), at(-45, -45)]))[1]).toBe('ground bad UNREACHABLE');
      expect(summary(await check(prober, [at(0), at(0, 30)]))[1]).toBe('ground bad NOT_WALKABLE');
      // a low ceiling right over the point
      const slab = new Mesh(new BoxGeometry(4, 0.2, 4), new MeshBasicMaterial());
      const p = worldToScene(at(20, 0, 11));
      slab.position.set(p.x, p.y, p.z);
      slab.layers.set(COLLISION_LAYER);
      world.buildingGroup.add(slab);
      expect(summary(await check(prober, [at(20)]))).toEqual(['ground warn INSIDE']);
    });

    it('checks flying points by their line from the previous point, and cannot check without a navigation mesh', async () => {
      const { world, prober } = setup();
      expect(summary(await check(prober, [at(0, 0, 30), at(40, 0, 30), at(60)]))).toEqual([
        'air ok OK_FLYING',
        'air ok OK_FLYING',
        'ground ok OK',
      ]);
      wall(world, 20);
      expect(summary(await check(prober, [at(0), at(40, 0, 15)]))[1]).toBe('air bad BLOCKED');
      // under the terrain
      expect(summary(await check(prober, [at(0, 0, 4)]))).toEqual(['under bad UNDER_MAP']);

      const empty = setup({});
      expect(summary(await check(empty.prober, [at(0)]))).toEqual(['ground warn NO_NAVMESH']);
      expect(summary(await check(empty.prober, [at(0), at(5000)]))[1]).toBe('ground warn NO_NAVMESH');
    });
  });
});
