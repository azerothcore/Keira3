import { TILE_SIZE } from '@keira/shared/wow-data';
import { FloorGrid, judgeSpawn, scanSpawnPositions, SpawnScanInput } from './spawn-scan';
import { RebuildGeometry } from './navmesh-rebuild';

/** A flat square (server x and y from -10 to 10) at a height: two triangles, in Recast axes; `area` 1 solid, 8 water. */
const square = (height: number, area = 1): { positions: number[]; indices: number[]; areas: number[] } => ({
  positions: [-10, height, -10, 10, height, -10, 10, height, 10, -10, height, 10],
  indices: [0, 1, 2, 0, 2, 3],
  areas: [area, area],
});
const geometry = (...parts: ReturnType<typeof square>[]): RebuildGeometry => {
  const positions: number[] = [];
  const indices: number[] = [];
  const areas: number[] = [];
  for (const part of parts) {
    const base = positions.length / 3;
    positions.push(...part.positions);
    indices.push(...part.indices.map((i) => i + base));
    areas.push(...part.areas);
  }
  return { positions: Float32Array.from(positions), indices: Uint32Array.from(indices), areas: Uint8Array.from(areas) };
};
const creature = (z: number, flying = false): SpawnScanInput => ({
  key: 'creature:1',
  kind: 'creature',
  position: { x: 1, y: 2, z },
  flying,
});
const gameobject = (z: number): SpawnScanInput => ({ key: 'gameobject:1', kind: 'gameobject', position: { x: 1, y: 2, z } });

describe('spawn scan', () => {
  it('tells the floors and liquids over a place, highest first', () => {
    const grid = new FloorGrid(
      geometry(square(0), square(20), square(5, 8), { positions: [0, 0, 0, 0, 0, 0, 0, 0, 0], indices: [0, 1, 2], areas: [1] }),
    );
    expect(grid.heightsAt(1, 2)).toEqual([20, 0]);
    expect(grid.heightsAt(1, 2, false)).toEqual([5]);
    expect(grid.heightsAt(50, 50)).toEqual([]);
  });

  it('judges creatures: on the ground, lifted or dropped by the core, or plainly wrong', () => {
    expect(judgeSpawn(creature(0.2), [0], [])).toEqual({ key: 'creature:1', level: 'ok', text: 'On the ground', ground: 0 });
    expect(judgeSpawn(creature(-1), [0], []).level).toBe('warn');
    expect(judgeSpawn(creature(-5), [0], [])).toEqual(
      expect.objectContaining({ level: 'bad', text: expect.stringContaining('Under the ground by 5.0') }),
    );
    expect(judgeSpawn(creature(5), [0], [])).toEqual(expect.objectContaining({ level: 'warn', text: expect.stringContaining('drops') }));
    expect(judgeSpawn(creature(50), [0], []).level).toBe('bad');
    expect(judgeSpawn(creature(50, true), [0], []).text).toBe('Flying, 50.0 yd up');
    expect(judgeSpawn(creature(3), [0], [4]).text).toBe('In water');
    // a liquid under the floor (a cave over a lake) doesn't count
    expect(judgeSpawn(creature(3), [0], [-2]).level).toBe('warn');
    // on the upper floor of two
    expect(judgeSpawn(creature(20.1), [20, 0], []).level).toBe('ok');
    expect(judgeSpawn(creature(1), [], [])).toEqual(expect.objectContaining({ level: 'bad', text: expect.stringContaining('No floor') }));
  });

  it('judges gameobjects, which the core never moves', () => {
    expect(judgeSpawn(gameobject(0), [0], []).level).toBe('ok');
    expect(judgeSpawn(gameobject(-1), [0], []).level).toBe('bad');
    expect(judgeSpawn(gameobject(3), [0], []).level).toBe('bad');
  });

  it('scans spawns tile by tile, leaving out tiles without server data, and stops when cancelled', async () => {
    const collect = vi.fn((_source: unknown, _map: number, tile: { tx: number }) =>
      tile.tx === 31
        ? Promise.resolve(geometry(square(0)))
        : tile.tx === 30
          ? Promise.reject(new Error('bad'))
          : Promise.resolve(undefined),
    );
    const source = { getServerMap: vi.fn(), getVmapTile: vi.fn(), getVmapModel: vi.fn() };
    const far = { key: 'creature:2', kind: 'creature' as const, position: { x: 1, y: TILE_SIZE + 5, z: 0 } };
    const farther = { key: 'creature:3', kind: 'creature' as const, position: { x: 1, y: -TILE_SIZE - 5, z: 0 } };
    const progress = vi.fn();
    const results = await scanSpawnPositions(source, 0, [creature(0.1), far, farther], progress, undefined, collect as never);
    expect(results).toEqual([expect.objectContaining({ key: 'creature:1', level: 'ok' })]);
    expect(progress).toHaveBeenLastCalledWith(3, 3);
    expect(await scanSpawnPositions(source, 0, [creature(0)], undefined, () => true, collect as never)).toEqual([]);
    // the real geometry reader by default (no server data: nothing)
    source.getServerMap.mockResolvedValue(undefined);
    source.getVmapTile.mockResolvedValue(undefined);
    expect(await scanSpawnPositions(source, 0, [creature(0)])).toEqual([]);
  });
});
