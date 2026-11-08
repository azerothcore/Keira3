import { MovementSimulation, SimulationLeg } from '@keira/shared/world-viewer';
import { SpawnRecord, WaypointRecord } from './world-editor.model';
import { PathEnding } from './path-ending';

/** Base creature speeds (yards per second), times creature_template.speed_walk / speed_run. */
export const WALK_SPEED = 2.5;
export const RUN_SPEED = 7;
/** waypoint_data.move_type: 1 run, 2 land, 3 take off (flying). */
const MOVE_RUN = 1;
const MOVE_LAND = 2;
const MOVE_TAKE_OFF = 3;
/** Wandering: this many moves per round, waiting 4–10 s after each (like the server's random movement). */
const WANDER_MOVES = 12;
const WANDER_WAIT = [4, 10];

const walkSpeed = (spawn: SpawnRecord): number => WALK_SPEED * (spawn.speedWalk ?? 1);
const runSpeed = (spawn: SpawnRecord): number => RUN_SPEED * (spawn.speedRun ?? 1);

/**
 * A creature walking its path as it does when it spawns: from its spawn point to the first point, then on. A path that
 * starts over (`ending`) goes on from the last point back to the first, round after round; the others are played once
 * and end saying what happens then (it stays, despawns or dies).
 */
export function pathSimulation(
  spawn: SpawnRecord,
  points: WaypointRecord[],
  key: string,
  actions: Map<number, string[]> = new Map(),
  ending?: PathEnding,
): MovementSimulation | undefined {
  if (points.length === 0) {
    return undefined;
  }
  const sorted = [...points].sort((a, b) => a.point - b.point);
  const legs: SimulationLeg[] = sorted.map((p) => ({
    to: { x: p.x, y: p.y, z: p.z },
    speed: p.moveType === MOVE_RUN ? runSpeed(spawn) : walkSpeed(spawn),
    wait: p.delay / 1000,
    fly: p.moveType === MOVE_LAND || p.moveType === MOVE_TAKE_OFF,
    run: p.moveType === MOVE_RUN,
    // (creatures walk straight from one waypoint to the next)
    straight: true,
    label: `point ${p.point}`,
    ...(actions.get(p.point)?.length ? { actions: actions.get(p.point) } : {}),
  }));
  const start = { x: spawn.x, y: spawn.y, z: spawn.z };
  if (ending?.kind === 'loop') {
    // (back to the first point: the leg to it from the spawn point, but from the last point)
    return { key, start, legs: [...legs, { ...legs[0] }], loopFrom: 1 };
  }
  return { key, start, legs, once: true, ...(ending ? { ending: ending.text } : {}) };
}

/** A creature wandering around its spawn point, within its wander distance, back to it at the end of a round. */
export function wanderSimulation(spawn: SpawnRecord, key: string, random: () => number = Math.random): MovementSimulation | undefined {
  const radius = spawn.wanderDistance ?? 0;
  if (radius <= 0) {
    return undefined;
  }
  const home = { x: spawn.x, y: spawn.y, z: spawn.z };
  const wait = () => WANDER_WAIT[0] + random() * (WANDER_WAIT[1] - WANDER_WAIT[0]);
  const legs: SimulationLeg[] = Array.from({ length: WANDER_MOVES }, (_, i) => {
    const angle = random() * 2 * Math.PI;
    const distance = Math.sqrt(random()) * radius;
    return {
      to: { x: home.x + Math.cos(angle) * distance, y: home.y + Math.sin(angle) * distance, z: home.z },
      speed: walkSpeed(spawn),
      wait: wait(),
      label: `wander ${i + 1}`,
    };
  });
  legs.push({ to: home, speed: walkSpeed(spawn), wait: wait(), label: 'home' });
  return { key, start: home, legs, once: true };
}
