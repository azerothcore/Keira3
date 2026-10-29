import { copySpawns, followPlacement, newSpawnFrom, pastedSpawn } from './group-edit';
import { SpawnRecord } from './world-editor.model';

const spawn = (guid: number, x: number, y: number, extra: Partial<SpawnRecord> = {}): SpawnRecord => ({
  type: 'gameobject',
  guid,
  entry: 1,
  name: 'Bank',
  map: 0,
  x,
  y,
  z: 10,
  o: 0,
  pathId: 0,
  ...extra,
});

describe('group editing', () => {
  it('moves and turns the other selected spawns with the moved one', () => {
    const moved = followPlacement({ x: 0, y: 0, z: 0, o: 0 }, { x: 10, y: 0, z: 2, o: Math.PI / 2 }, { x: 5, y: 0, z: 1, o: 0.5 });
    expect(moved.x).toBeCloseTo(10);
    expect(moved.y).toBeCloseTo(5);
    expect(moved.z).toBe(3);
    expect(moved.o).toBeCloseTo(0.5 + Math.PI / 2);
    // orientations stay within 0..2π
    expect(followPlacement({ x: 0, y: 0, z: 0, o: 1 }, { x: 0, y: 0, z: 0, o: 0 }, { x: 0, y: 0, z: 0, o: 0.5 }).o).toBeCloseTo(
      2 * Math.PI - 0.5,
    );
  });

  it('copies spawns with their offsets, and pastes them as new spawns without paths, events or script paths', () => {
    const copied = copySpawns([spawn(1, 10, 10), spawn(2, 12, 9, { pathId: 5, pathFromTemplate: true, event: 3, saiPaths: [-4] })]);
    expect(copied.map((c) => c.offset)).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 2, y: -1, z: 0 },
    ]);
    expect(pastedSpawn(copied[1], 99, { x: 100, y: 100, z: 50 })).toEqual(spawn(99, 102, 99, { z: 50 }));
  });

  it('writes the difficulties, phases, wandering and edited columns of the copied spawn with the copy', () => {
    const original = spawn(1, 10, 10, { type: 'creature', phaseMask: 2, spawnMask: 3, wanderDistance: 5, fields: { spawntimesecs: 60 } });
    expect(newSpawnFrom(original, 9, { x: 1, y: 2, z: 3, o: 1 })).toEqual({
      ...original,
      guid: 9,
      x: 1,
      y: 2,
      z: 3,
      o: 1,
      fields: { phaseMask: 2, spawnMask: 3, MovementType: 1, wander_distance: 5, spawntimesecs: 60 },
    });
    // in the first phase, every difficulty, not wandering: nothing to write
    expect(newSpawnFrom(spawn(1, 10, 10, { phaseMask: 1 }), 9, { x: 1, y: 2, z: 3 }).fields).toBeUndefined();
  });
});
