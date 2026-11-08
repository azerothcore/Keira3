import { pathSimulation, RUN_SPEED, WALK_SPEED, wanderSimulation } from './simulation-plan';
import { LOOP_ENDING } from './path-ending';
import { SpawnRecord } from './world-editor.model';

const creature = (extra: Partial<SpawnRecord> = {}): SpawnRecord => ({
  type: 'creature',
  guid: 1,
  entry: 1,
  name: 'Guard',
  map: 0,
  x: 0,
  y: 0,
  z: 10,
  o: 0,
  pathId: 10,
  ...extra,
});

describe('movement simulation plans', () => {
  it('walks the path once from the spawn point, running or flying where the points say so, doing what they say', () => {
    const plan = pathSimulation(
      creature({ speedWalk: 1, speedRun: 2 }),
      [
        { pathId: 10, point: 2, x: 5, y: 0, z: 10, delay: 0, moveType: 1 },
        { pathId: 10, point: 1, x: 1, y: 0, z: 10, delay: 2000 },
        { pathId: 10, point: 3, x: 9, y: 0, z: 20, delay: 0, moveType: 3 },
      ],
      'creature:1',
      new Map([
        [1, ['script 5']],
        [2, []],
      ]),
    );
    expect(plan?.start).toEqual({ x: 0, y: 0, z: 10 });
    expect(plan?.once).toBe(true);
    expect(plan?.legs.map((leg) => [leg.label, leg.speed, leg.wait, leg.fly, leg.run, leg.actions])).toEqual([
      ['point 1', WALK_SPEED, 2, false, false, ['script 5']],
      ['point 2', RUN_SPEED * 2, 0, false, true, undefined],
      ['point 3', WALK_SPEED, 0, true, false, undefined],
    ]);
    // without template speeds: the base ones
    expect(
      pathSimulation(creature(), [{ pathId: 10, point: 1, x: 1, y: 0, z: 10, delay: 0, moveType: 1 }], 'creature:1')?.legs[0].speed,
    ).toBe(RUN_SPEED);
    expect(pathSimulation(creature(), [], 'creature:1')).toBeUndefined();
  });

  it('goes round and round a path that starts over, from its first point; ends the others saying what happens then', () => {
    const points = [
      { pathId: 10, point: 1, x: 1, y: 0, z: 10, delay: 1000 },
      { pathId: 10, point: 2, x: 5, y: 0, z: 10, delay: 0 },
    ];
    const loop = pathSimulation(creature(), points, 'creature:1', new Map(), LOOP_ENDING);
    expect(loop?.once).toBeUndefined();
    expect(loop?.loopFrom).toBe(1);
    expect(loop?.legs.map((leg) => [leg.label, leg.to.x, leg.wait])).toEqual([
      ['point 1', 1, 1],
      ['point 2', 5, 0],
      ['point 1', 1, 1],
    ]);
    const despawns = pathSimulation(creature(), points, 'creature:1', new Map(), { kind: 'despawn', text: 'despawns at the last point' });
    expect(despawns?.once).toBe(true);
    expect(despawns?.ending).toBe('despawns at the last point');
    expect(despawns?.legs).toHaveLength(2);
  });

  it('wanders within the wander distance and comes back home', () => {
    const plan = wanderSimulation(creature({ wanderDistance: 10, speedWalk: 2 }), 'creature:1', () => 0.5);
    expect(plan?.legs).toHaveLength(13);
    expect(plan?.legs[0].to.x).toBeCloseTo(-Math.sqrt(0.5) * 10);
    expect(plan?.legs[0].wait).toBe(7);
    expect(plan?.legs[0].speed).toBe(WALK_SPEED * 2);
    expect(plan?.legs.at(-1)?.to).toEqual({ x: 0, y: 0, z: 10 });
    expect(wanderSimulation(creature(), 'creature:1')).toBeUndefined();
    expect(wanderSimulation(creature({ wanderDistance: 5 }), 'creature:1')?.legs.length).toBe(13);
  });
});
