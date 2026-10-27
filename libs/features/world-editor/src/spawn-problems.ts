import { SpawnRecord, spawnKey, WaypointRecord } from './world-editor.model';

/** Something likely wrong with a spawn; `bad` for what players will notice, `warn` for what may be intended. */
export interface SpawnProblem {
  key: string;
  spawn: SpawnRecord;
  severity: 'bad' | 'warn';
  text: string;
}

/** A spawn this far (yards) under the ground is lost below it. */
const UNDER_GROUND = 1;
/** A spawn this far above the ground floats (fine for lanterns or flying creatures). */
const FLOATING = 3;
/** Two spawns of the same entry closer than this (yards) are a duplicate. */
const DUPLICATE_DISTANCE = 0.5;
/** A path whose first point is this far (yards) from its creature makes it run across the map first. */
const FAR_FIRST_POINT = 50;

const yards = (value: number) => value.toFixed(1);

/**
 * Checks spawns for common mistakes: under or floating above the ground (with the ground heights under them from
 * the view), duplicates of the same entry on the same spot, paths without points or starting far away.
 */
export function findSpawnProblems(
  spawns: SpawnRecord[],
  ground: Record<string, number | null>,
  waypoints: WaypointRecord[],
): SpawnProblem[] {
  const problems: SpawnProblem[] = [];
  const add = (spawn: SpawnRecord, severity: SpawnProblem['severity'], text: string) =>
    problems.push({ key: spawnKey(spawn.type, spawn.guid), spawn, severity, text });
  for (const [i, spawn] of spawns.entries()) {
    const height = ground[spawnKey(spawn.type, spawn.guid)];
    if (height !== undefined && height !== null) {
      if (height - spawn.z > UNDER_GROUND) {
        add(spawn, 'bad', `Under the ground by ${yards(height - spawn.z)} yd`);
      } else if (spawn.z - height > FLOATING) {
        add(spawn, 'warn', `${yards(spawn.z - height)} yd above the ground`);
      }
    }
    const twin = spawns
      .slice(0, i)
      .find(
        (other) =>
          other.type === spawn.type &&
          other.entry === spawn.entry &&
          Math.hypot(other.x - spawn.x, other.y - spawn.y, other.z - spawn.z) < DUPLICATE_DISTANCE,
      );
    if (twin) {
      add(spawn, 'bad', `Duplicate of GUID ${twin.guid} (same entry, same spot)`);
    }
    if (spawn.type === 'creature' && spawn.pathId > 0) {
      const points = waypoints.filter((w) => w.pathId === spawn.pathId).sort((a, b) => a.point - b.point);
      if (points.length === 0) {
        add(spawn, 'bad', `Path ${spawn.pathId} has no points`);
      } else {
        const distance = Math.hypot(points[0].x - spawn.x, points[0].y - spawn.y);
        if (distance > FAR_FIRST_POINT) {
          add(spawn, 'warn', `Path ${spawn.pathId} starts ${yards(distance)} yd away`);
        }
      }
    }
  }
  return problems;
}
