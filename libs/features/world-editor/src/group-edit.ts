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

/** A copied spawn as a new spawn at `at` (plus its offset): no path, game event or script paths of its own. */
export function pastedSpawn(copied: CopiedSpawn, guid: number, at: WorldPosition): SpawnRecord {
  const { pathFromTemplate: _, event: __, saiPaths: ___, ...spawn } = copied.spawn;
  return { ...spawn, guid, pathId: 0, x: at.x + copied.offset.x, y: at.y + copied.offset.y, z: at.z + copied.offset.z };
}
