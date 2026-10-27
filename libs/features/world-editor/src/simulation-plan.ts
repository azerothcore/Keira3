import { MovementSimulation, SimulationLeg } from '@keira/shared/world-viewer';
import { SpawnRecord, WaypointRecord } from './world-editor.model';

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

/** A creature walking its path round after round: from the last point to the first, then on point by point. */
export function pathSimulation(spawn: SpawnRecord, points: WaypointRecord[], rate: number, key: string): MovementSimulation | undefined {
  if (points.length === 0) {
    return undefined;
  }
  const sorted = [...points].sort((a, b) => a.point - b.point);
  const last = sorted[sorted.length - 1];
  const legs: SimulationLeg[] = sorted.map((p) => ({
    to: { x: p.x, y: p.y, z: p.z },
    speed: p.moveType === MOVE_RUN ? runSpeed(spawn) : walkSpeed(spawn),
    wait: p.delay / 1000,
    fly: p.moveType === MOVE_LAND || p.moveType === MOVE_TAKE_OFF,
    label: `point ${p.point}`,
  }));
  const start = sorted.length > 1 ? { x: last.x, y: last.y, z: last.z } : { x: spawn.x, y: spawn.y, z: spawn.z };
  return { key, start, legs, rate };
}

/** A creature wandering around its spawn point, within its wander distance, back to it at the end of a round. */
export function wanderSimulation(
  spawn: SpawnRecord,
  rate: number,
  key: string,
  random: () => number = Math.random,
): MovementSimulation | undefined {
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
  return { key, start: home, legs, rate };
}
