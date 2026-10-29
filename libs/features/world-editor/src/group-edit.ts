import { WorldPosition } from '@keira/shared/wow-data';
import { Placement, SpawnRecord } from './world-editor.model';

/**
 * Where a spawn selected along with the moved one goes: moved by as much, and turned with it around it (keeping its
 * place relative to the moved spawn).
 */
export function followPlacement(before: Placement, after: Placement, member: Placement): Placement {
  const turn = after.o - before.o;
  const [dx, dy] = [member.x - before.x, member.y - before.y];
  const [cos, sin] = [Math.cos(turn), Math.sin(turn)];
  const o = (((member.o + turn) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return { x: after.x + dx * cos - dy * sin, y: after.y + dx * sin + dy * cos, z: member.z + after.z - before.z, o };
}

/** Spawns copied together, each with where it stands relative to the first one. */
export interface CopiedSpawn {
  spawn: SpawnRecord;
  offset: WorldPosition;
}

export function copySpawns(spawns: SpawnRecord[]): CopiedSpawn[] {
  const [first] = spawns;
  return spawns.map((spawn) => ({ spawn, offset: { x: spawn.x - first.x, y: spawn.y - first.y, z: spawn.z - first.z } }));
}

/**
 * A copy of a spawn as a new one at `place`: no path, game event or script paths of its own, but the same difficulties,
 * phases and wandering (written with it: a new spawn's row is otherwise made of the defaults).
 */
export function newSpawnFrom(spawn: SpawnRecord, guid: number, place: Partial<Placement> & WorldPosition): SpawnRecord {
  const { pathFromTemplate: _, event: __, saiPaths: ___, ...copy } = spawn;
  const fields = {
    ...(spawn.phaseMask !== undefined && spawn.phaseMask !== 1 && { phaseMask: spawn.phaseMask }),
    ...(spawn.spawnMask !== undefined && { spawnMask: spawn.spawnMask }),
    ...(spawn.wanderDistance && { MovementType: 1, wander_distance: spawn.wanderDistance }),
    ...spawn.fields,
  };
  return { ...copy, guid, pathId: 0, ...place, ...(Object.keys(fields).length && { fields }) };
}

/** A copied spawn as a new spawn at `at` (plus its offset). */
export function pastedSpawn(copied: CopiedSpawn, guid: number, at: WorldPosition): SpawnRecord {
  return newSpawnFrom(copied.spawn, guid, { x: at.x + copied.offset.x, y: at.y + copied.offset.y, z: at.z + copied.offset.z });
}
