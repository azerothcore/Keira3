import {
  CREATURE_SPAWN_ADDON_TABLE,
  CREATURE_SPAWN_TABLE,
  CreatureSpawn,
  GAMEOBJECT_SPAWN_ADDON_TABLE,
  GAMEOBJECT_SPAWN_TABLE,
  GameobjectSpawn,
  WAYPOINT_DATA_TABLE,
} from '@keira/shared/acore-world-model';
import { squelConfig } from '@keira/shared/config';
import squel from 'squel';
import { pathKey, Placement, Quaternion, SpawnRecord, spawnKey, SpawnType, WaypointRecord } from './world-editor.model';

const round = (value: number): number => Math.round(value * 10_000) / 10_000;
const NEW_SPAWN_RESPAWN_SECS = 300;
const MOVEMENT_TYPE_WAYPOINT = 2;
/** GO_STATE_READY, what `.gobject add` uses (0 would spawn doors open). */
const NEW_GAMEOBJECT_STATE = 1;

/** Rows referencing a spawn guid that AzerothCore's `DeleteFromDB` removes together with the spawn. */
const RELATED_ROWS: Record<SpawnType, { table: string; field: string }[]> = {
  creature: [
    { table: CREATURE_SPAWN_ADDON_TABLE, field: 'guid' },
    { table: 'creature_multispawn', field: 'spawnId' },
    { table: 'game_event_creature', field: 'guid' },
    { table: 'game_event_model_equip', field: 'guid' },
  ],
  gameobject: [
    { table: GAMEOBJECT_SPAWN_ADDON_TABLE, field: 'guid' },
    { table: 'game_event_gameobject', field: 'guid' },
  ],
};

const tableOf = (type: SpawnType): string => (type === 'creature' ? CREATURE_SPAWN_TABLE : GAMEOBJECT_SPAWN_TABLE);
const waypointKey = (pathId: number, point: number): string => `${pathKey(pathId)}#${point}`;

/** Yaw-only quaternion stored in gameobject.rotation0..3 (what `.gobject turn` writes). */
export function gameobjectRotation(orientation: number): { rotation0: number; rotation1: number; rotation2: number; rotation3: number } {
  return { rotation0: 0, rotation1: 0, rotation2: round(Math.sin(orientation / 2)), rotation3: round(Math.cos(orientation / 2)) };
}

/**
 * Turns a gameobject from orientation `from` to `to`, keeping any tilt: the yaw delta is applied on top of the stored
 * quaternion (or of the yaw-only one when the stored quaternion is all zeros).
 */
export function rotateGameobject(rotation: Quaternion | undefined, from: number, to: number): Record<string, number> {
  const yaw = gameobjectRotation(from);
  const [bx, by, bz, bw] = rotation?.some((v) => v !== 0) ? rotation : [yaw.rotation0, yaw.rotation1, yaw.rotation2, yaw.rotation3];
  const qz = Math.sin((to - from) / 2);
  const qw = Math.cos((to - from) / 2);
  return {
    rotation0: round(qw * bx - qz * by),
    rotation1: round(qw * by + qz * bx),
    rotation2: round(qw * bz + qz * bw),
    rotation3: round(qw * bw - qz * bz),
  };
}

/** Columns to write for a placement. Gameobject rotation columns only change when the orientation did. */
function placementFields(type: SpawnType, p: Placement, original?: SpawnRecord): Record<string, number> {
  const fields: Record<string, number> = {
    position_x: round(p.x),
    position_y: round(p.y),
    position_z: round(p.z),
    orientation: round(p.o),
  };
  if (type !== 'gameobject') {
    return fields;
  }
  if (!original) {
    return { ...fields, ...gameobjectRotation(p.o) };
  }
  return round(original.o) === round(p.o) ? fields : { ...fields, ...rotateGameobject(original.rotation, original.o, p.o) };
}

const samePlacement = (a: Placement, b: Placement): boolean =>
  round(a.x) === round(b.x) && round(a.y) === round(b.y) && round(a.z) === round(b.z) && round(a.o) === round(b.o);

/**
 * Edits made in the 3D world editor that are not saved yet. Edits on the same object merge: moving a spawn placed in
 * this session changes its INSERT, deleting it drops the INSERT, moving a spawn back to where it was drops the UPDATE.
 */
/** Every pending change, as plain data (see `WorldEditorChanges.snapshot`). */
export interface ChangesSnapshot {
  insertedSpawns: [string, SpawnRecord][];
  movedSpawns: [string, { original: SpawnRecord; current: Placement }][];
  deletedSpawns: [string, SpawnRecord][];
  insertedWaypoints: [string, WaypointRecord][];
  movedWaypoints: [string, { original: WaypointRecord; current: WaypointRecord }][];
  deletedWaypoints: [string, WaypointRecord][];
  createdPaths: [number, number][];
}

export class WorldEditorChanges {
  private readonly insertedSpawns = new Map<string, SpawnRecord>();
  private readonly movedSpawns = new Map<string, { original: SpawnRecord; current: Placement }>();
  private readonly deletedSpawns = new Map<string, SpawnRecord>();
  private readonly insertedWaypoints = new Map<string, WaypointRecord>();
  private readonly movedWaypoints = new Map<string, { original: WaypointRecord; current: WaypointRecord }>();
  private readonly deletedWaypoints = new Map<string, WaypointRecord>();
  private readonly createdPaths = new Map<number, number>();

  get count(): number {
    return (
      this.insertedSpawns.size +
      this.movedSpawns.size +
      this.deletedSpawns.size +
      this.insertedWaypoints.size +
      this.movedWaypoints.size +
      this.deletedWaypoints.size +
      this.createdPaths.size
    );
  }

  /** A copy of every pending change, to come back to later (undo/redo). */
  snapshot(): ChangesSnapshot {
    return structuredClone({
      insertedSpawns: [...this.insertedSpawns],
      movedSpawns: [...this.movedSpawns],
      deletedSpawns: [...this.deletedSpawns],
      insertedWaypoints: [...this.insertedWaypoints],
      movedWaypoints: [...this.movedWaypoints],
      deletedWaypoints: [...this.deletedWaypoints],
      createdPaths: [...this.createdPaths],
    });
  }

  restore(snapshot: ChangesSnapshot): void {
    const copy = structuredClone(snapshot);
    this.clear();
    copy.insertedSpawns.forEach(([key, value]) => this.insertedSpawns.set(key, value));
    copy.movedSpawns.forEach(([key, value]) => this.movedSpawns.set(key, value));
    copy.deletedSpawns.forEach(([key, value]) => this.deletedSpawns.set(key, value));
    copy.insertedWaypoints.forEach(([key, value]) => this.insertedWaypoints.set(key, value));
    copy.movedWaypoints.forEach(([key, value]) => this.movedWaypoints.set(key, value));
    copy.deletedWaypoints.forEach(([key, value]) => this.deletedWaypoints.set(key, value));
    copy.createdPaths.forEach(([key, value]) => this.createdPaths.set(key, value));
  }

  clear(): void {
    this.insertedSpawns.clear();
    this.movedSpawns.clear();
    this.deletedSpawns.clear();
    this.insertedWaypoints.clear();
    this.movedWaypoints.clear();
    this.deletedWaypoints.clear();
    this.createdPaths.clear();
  }

  // ---------------------------------------------------------------- spawns

  placeSpawn(spawn: SpawnRecord): void {
    this.insertedSpawns.set(spawnKey(spawn.type, spawn.guid), { ...spawn });
  }

  isNewSpawn(key: string): boolean {
    return this.insertedSpawns.has(key);
  }

  /** `original` is the spawn as loaded from the database (or as placed in this session). */
  moveSpawn(original: SpawnRecord, placement: Placement): void {
    const key = spawnKey(original.type, original.guid);
    const inserted = this.insertedSpawns.get(key);
    if (inserted) {
      this.insertedSpawns.set(key, { ...inserted, ...placement });
      return;
    }
    const base = this.movedSpawns.get(key)?.original ?? original;
    if (samePlacement(base, placement)) {
      this.movedSpawns.delete(key);
    } else {
      this.movedSpawns.set(key, { original: base, current: { ...placement } });
    }
  }

  deleteSpawn(spawn: SpawnRecord): void {
    const key = spawnKey(spawn.type, spawn.guid);
    const createdPath = spawn.type === 'creature' ? this.createdPaths.get(spawn.guid) : undefined;
    if (createdPath !== undefined) {
      // The path only existed for this creature: drop the points queued for it too.
      this.createdPaths.delete(spawn.guid);
      for (const [waypointKeyValue, waypoint] of this.insertedWaypoints) {
        if (waypoint.pathId === createdPath) {
          this.insertedWaypoints.delete(waypointKeyValue);
        }
      }
    }
    if (this.insertedSpawns.delete(key)) {
      return;
    }
    const original = this.movedSpawns.get(key)?.original ?? spawn;
    this.movedSpawns.delete(key);
    this.deletedSpawns.set(key, original);
  }

  /** Applies pending edits to spawns loaded from the database; new spawns of `map` are appended. */
  applyToSpawns(loaded: SpawnRecord[], map: number): SpawnRecord[] {
    const result: SpawnRecord[] = [];
    for (const spawn of loaded) {
      const key = spawnKey(spawn.type, spawn.guid);
      if (this.deletedSpawns.has(key) || this.insertedSpawns.has(key)) {
        continue;
      }
      const moved = this.movedSpawns.get(key);
      const pathId = this.createdPaths.get(spawn.guid) ?? spawn.pathId;
      result.push(moved ? { ...spawn, ...moved.current, pathId } : { ...spawn, pathId });
    }
    for (const spawn of this.insertedSpawns.values()) {
      if (spawn.map === map) {
        result.push({ ...spawn, pathId: this.createdPaths.get(spawn.guid) ?? spawn.pathId });
      }
    }
    return result;
  }

  // ---------------------------------------------------------------- paths & waypoints

  createPath(creatureGuid: number, pathId: number): void {
    this.createdPaths.set(creatureGuid, pathId);
  }

  addWaypoint(waypoint: WaypointRecord): void {
    const key = waypointKey(waypoint.pathId, waypoint.point);
    if (this.deletedWaypoints.has(key)) {
      const original = this.deletedWaypoints.get(key) as WaypointRecord;
      this.deletedWaypoints.delete(key);
      this.moveWaypoint(original, waypoint);
      return;
    }
    this.insertedWaypoints.set(key, { ...waypoint });
  }

  moveWaypoint(original: WaypointRecord, position: { x: number; y: number; z: number }): void {
    const key = waypointKey(original.pathId, original.point);
    const inserted = this.insertedWaypoints.get(key);
    if (inserted) {
      this.insertedWaypoints.set(key, { ...inserted, x: position.x, y: position.y, z: position.z });
      return;
    }
    const base = this.movedWaypoints.get(key)?.original ?? original;
    const current = { ...base, x: position.x, y: position.y, z: position.z };
    if (samePlacement({ ...base, o: 0 }, { ...current, o: 0 })) {
      this.movedWaypoints.delete(key);
    } else {
      this.movedWaypoints.set(key, { original: base, current });
    }
  }

  deleteWaypoint(waypoint: WaypointRecord): void {
    const key = waypointKey(waypoint.pathId, waypoint.point);
    if (this.insertedWaypoints.delete(key)) {
      return;
    }
    const original = this.movedWaypoints.get(key)?.original ?? waypoint;
    this.movedWaypoints.delete(key);
    this.deletedWaypoints.set(key, original);
  }

  /** Applies pending edits to the waypoints of `pathIds` loaded from the database, sorted by path and point. */
  applyToWaypoints(loaded: WaypointRecord[], pathIds: number[]): WaypointRecord[] {
    const wanted = new Set(pathIds);
    const result = new Map<string, WaypointRecord>();
    for (const waypoint of loaded) {
      const key = waypointKey(waypoint.pathId, waypoint.point);
      if (!this.deletedWaypoints.has(key)) {
        result.set(key, this.movedWaypoints.get(key)?.current ?? waypoint);
      }
    }
    for (const [key, waypoint] of this.insertedWaypoints) {
      if (wanted.has(waypoint.pathId)) {
        result.set(key, waypoint);
      }
    }
    return [...result.values()].sort((a, b) => a.pathId - b.pathId || a.point - b.point);
  }

  // ---------------------------------------------------------------- output

  /** Human readable list of the pending edits. */
  describe(): string[] {
    const label = (s: SpawnRecord): string => `${s.type} ${s.guid}${s.name ? ` (${s.name})` : ''}`;
    return [
      ...[...this.deletedSpawns.values()].map((s) => `Delete ${label(s)}`),
      ...[...this.insertedSpawns.values()].map((s) => `Place ${label(s)}`),
      ...[...this.movedSpawns.values()].map(({ original }) => `Move ${label(original)}`),
      ...[...this.createdPaths].map(([guid, pathId]) => `Create path ${pathId} for creature ${guid}`),
      ...[...this.deletedWaypoints.values()].map((w) => `Delete waypoint ${w.pathId} #${w.point}`),
      ...[...this.insertedWaypoints.values()].map((w) => `Add waypoint ${w.pathId} #${w.point}`),
      ...[...this.movedWaypoints.values()].map(({ original: w }) => `Move waypoint ${w.pathId} #${w.point}`),
    ];
  }

  toSql(): string {
    const statements: string[] = [];

    for (const spawn of this.deletedSpawns.values()) {
      statements.push(this.deleteQuery(tableOf(spawn.type), { guid: spawn.guid }));
      for (const { table, field } of RELATED_ROWS[spawn.type]) {
        statements.push(this.deleteQuery(table, { [field]: spawn.guid }));
      }
    }
    for (const spawn of this.insertedSpawns.values()) {
      statements.push(this.insertSpawnQuery(spawn));
    }
    for (const { original, current } of this.movedSpawns.values()) {
      statements.push(this.updateQuery(tableOf(original.type), placementFields(original.type, current, original), { guid: original.guid }));
    }
    for (const [guid, pathId] of this.createdPaths) {
      statements.push(
        `INSERT INTO \`${CREATURE_SPAWN_ADDON_TABLE}\` (\`guid\`, \`path_id\`) VALUES (${guid}, ${pathId}) ON DUPLICATE KEY UPDATE \`path_id\` = ${pathId};`,
      );
      statements.push(this.updateQuery(CREATURE_SPAWN_TABLE, { MovementType: MOVEMENT_TYPE_WAYPOINT }, { guid }));
    }
    for (const waypoint of this.deletedWaypoints.values()) {
      statements.push(this.deleteQuery(WAYPOINT_DATA_TABLE, { id: waypoint.pathId, point: waypoint.point }));
    }
    for (const waypoint of this.insertedWaypoints.values()) {
      const fields = {
        id: waypoint.pathId,
        point: waypoint.point,
        position_x: round(waypoint.x),
        position_y: round(waypoint.y),
        position_z: round(waypoint.z),
        delay: waypoint.delay,
      };
      statements.push(`${squel.insert(squelConfig).into(WAYPOINT_DATA_TABLE).setFields(fields).toString()};`);
    }
    for (const { original, current } of this.movedWaypoints.values()) {
      const fields = { position_x: round(current.x), position_y: round(current.y), position_z: round(current.z) };
      statements.push(this.updateQuery(WAYPOINT_DATA_TABLE, fields, { id: original.pathId, point: original.point }));
    }
    return statements.join('\n');
  }

  private insertSpawnQuery(spawn: SpawnRecord): string {
    const placement = placementFields(spawn.type, spawn);
    const row =
      spawn.type === 'creature'
        ? Object.assign(
            new CreatureSpawn(),
            { guid: spawn.guid, id: spawn.entry, map: spawn.map, spawntimesecs: NEW_SPAWN_RESPAWN_SECS },
            placement,
          )
        : Object.assign(
            new GameobjectSpawn(),
            { guid: spawn.guid, id: spawn.entry, map: spawn.map, spawntimesecs: NEW_SPAWN_RESPAWN_SECS, state: NEW_GAMEOBJECT_STATE },
            placement,
          );
    return `${squel
      .insert(squelConfig)
      .into(tableOf(spawn.type))
      .setFields({ ...row })
      .toString()};`;
  }

  private updateQuery(table: string, fields: Record<string, number>, where: Record<string, number>): string {
    const query = squel.update(squelConfig).table(table).setFields(fields);
    Object.entries(where).forEach(([field, value]) => query.where(`\`${field}\` = ${value}`));
    return `${query.toString()};`;
  }

  private deleteQuery(table: string, where: Record<string, number>): string {
    const query = squel.delete(squelConfig).from(table);
    Object.entries(where).forEach(([field, value]) => query.where(`\`${field}\` = ${value}`));
    return `${query.toString()};`;
  }
}
