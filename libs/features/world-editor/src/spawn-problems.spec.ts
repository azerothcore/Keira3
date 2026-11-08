import { findSpawnProblems } from './spawn-problems';
import { SpawnRecord } from './world-editor.model';

const spawn = (type: 'creature' | 'gameobject', guid: number, x: number, z: number, extra: Partial<SpawnRecord> = {}): SpawnRecord => ({
  type,
  guid,
  entry: 1,
  name: 'Thing',
  map: 0,
  x,
  y: 0,
  z,
  o: 0,
  pathId: 0,
  ...extra,
});

describe('findSpawnProblems', () => {
  it('finds spawns under or floating above the ground, duplicates, and paths without points or far away', () => {
    const spawns = [
      spawn('creature', 1, 0, 8),
      spawn('creature', 2, 10, 15),
      spawn('creature', 3, 20, 10.5),
      spawn('creature', 4, 20.2, 10.5),
      spawn('gameobject', 5, 20.2, 10.5),
      spawn('creature', 6, 30, 10, { pathId: 70 }),
      spawn('creature', 7, 40, 10, { pathId: 80 }),
      spawn('creature', 8, 50, 10, { pathId: 90 }),
    ];
    const ground = { 'creature:1': 10, 'creature:2': 10, 'creature:3': 10, 'creature:6': null };
    const waypoints = [
      { pathId: 80, point: 2, x: 400, y: 0, z: 10, delay: 0 },
      { pathId: 80, point: 1, x: 100, y: 0, z: 10, delay: 0 },
      { pathId: 90, point: 1, x: 55, y: 0, z: 10, delay: 0 },
    ];
    expect(findSpawnProblems(spawns, ground, waypoints).map((p) => `${p.key} ${p.severity} ${p.text}`)).toEqual([
      'creature:1 bad Under the ground by 2.0 yd',
      'creature:2 warn 5.0 yd above the ground',
      'creature:4 bad Duplicate of GUID 3 (same entry, same spot)',
      'creature:6 bad Path 70 has no points',
      'creature:7 warn Path 80 starts 60.0 yd away',
    ]);
  });
});
