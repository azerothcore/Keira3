import { pathSimulation, RUN_SPEED, WALK_SPEED, wanderSimulation } from './simulation-plan';
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
  it('walks the path round after round, running or flying where the points say so', () => {
    const plan = pathSimulation(
      creature({ speedWalk: 1, speedRun: 2 }),
      [
        { pathId: 10, point: 2, x: 5, y: 0, z: 10, delay: 0, moveType: 1 },
        { pathId: 10, point: 1, x: 1, y: 0, z: 10, delay: 2000 },
        { pathId: 10, point: 3, x: 9, y: 0, z: 20, delay: 0, moveType: 3 },
      ],
      2,
      'creature:1',
    );
    expect(plan?.start).toEqual({ x: 9, y: 0, z: 20 });
    expect(plan?.rate).toBe(2);
    expect(plan?.legs.map((leg) => [leg.label, leg.speed, leg.wait, leg.fly])).toEqual([
      ['point 1', WALK_SPEED, 2, false],
      ['point 2', RUN_SPEED * 2, 0, false],
      ['point 3', WALK_SPEED, 0, true],
    ]);
    // without template speeds: the base ones
    expect(
      pathSimulation(creature(), [{ pathId: 10, point: 1, x: 1, y: 0, z: 10, delay: 0, moveType: 1 }], 1, 'creature:1')?.legs[0].speed,
    ).toBe(RUN_SPEED);
    // a single point: from the spawn point to it
    expect(pathSimulation(creature(), [{ pathId: 10, point: 1, x: 1, y: 0, z: 10, delay: 0 }], 1, 'creature:1')?.start).toEqual({
      x: 0,
      y: 0,
      z: 10,
    });
    expect(pathSimulation(creature(), [], 1, 'creature:1')).toBeUndefined();
  });

  it('wanders within the wander distance and comes back home', () => {
    const plan = wanderSimulation(creature({ wanderDistance: 10, speedWalk: 2 }), 1, 'creature:1', () => 0.5);
    expect(plan?.legs).toHaveLength(13);
    expect(plan?.legs[0].to.x).toBeCloseTo(-Math.sqrt(0.5) * 10);
    expect(plan?.legs[0].wait).toBe(7);
    expect(plan?.legs[0].speed).toBe(WALK_SPEED * 2);
    expect(plan?.legs.at(-1)?.to).toEqual({ x: 0, y: 0, z: 10 });
    expect(wanderSimulation(creature(), 1, 'creature:1')).toBeUndefined();
    expect(wanderSimulation(creature({ wanderDistance: 5 }), 1, 'creature:1')?.legs.length).toBe(13);
  });
});
