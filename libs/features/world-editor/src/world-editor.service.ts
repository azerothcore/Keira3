import { inject, Service } from '@angular/core';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { WorldPosition } from '@keira/shared/wow-data';
import { firstValueFrom } from 'rxjs';
import {
  preferredPathId,
  SPAWN_LOAD_LIMIT,
  SPAWN_LOAD_RADIUS,
  Quaternion,
  SpawnRecord,
  SpawnRow,
  SpawnType,
  TeleRow,
  WaypointRecord,
  WaypointRow,
} from './world-editor.model';
import { WaypointSaiRow, WaypointScriptStep } from './waypoint-info';

const num = (value: number): number => Math.round(value * 100) / 100;
/** creature.MovementType of creatures wandering around their spawn point (within wander_distance). */
const RANDOM_MOVEMENT = 1;
/** SMART_EVENT_WAYPOINT_DATA_REACHED: a creature on a `waypoint_data` path reached a point. */
const SAI_EVENT_WAYPOINT_DATA_REACHED = 108;

/** Database access of the world editor (reads only; writes go through the generated SQL). */
@Service()
export class WorldEditorService {
  private readonly queryService = inject(MysqlQueryService);

  /** Creatures and gameobjects of `map` in a square of `radius` yards around `center`. */
  async loadSpawns(map: number, center: WorldPosition, radius = SPAWN_LOAD_RADIUS): Promise<SpawnRecord[]> {
    const area = (alias: string): string =>
      `${alias}.map = ${map}` +
      ` AND ${alias}.position_x BETWEEN ${num(center.x - radius)} AND ${num(center.x + radius)}` +
      ` AND ${alias}.position_y BETWEEN ${num(center.y - radius)} AND ${num(center.y + radius)}`;

    const creatures =
      "SELECT c.guid, c.id AS entry, IFNULL(ct.name, '') AS name, c.map, c.position_x AS x, c.position_y AS y, c.position_z AS z, c.orientation AS o, " +
      // Like Creature::GetCreatureAddon: an addon row (even with path_id 0) wins over the template addon as a whole.
      'IF(ca.guid IS NOT NULL, ca.path_id, IFNULL(cta.path_id, 0)) AS pathId, ' +
      '(ca.guid IS NULL AND IFNULL(cta.path_id, 0) <> 0) AS pathFromTemplate, ' +
      '0 AS rotation0, 0 AS rotation1, 0 AS rotation2, 0 AS rotation3, ' +
      // the first template model, as the server picks when it has a single one
      'IFNULL(ctm.CreatureDisplayID, 0) AS displayId, IFNULL(ctm.DisplayScale, 1) AS scale, ' +
      'c.wander_distance AS wanderDistance, c.MovementType AS movementType ' +
      'FROM creature c ' +
      'LEFT JOIN creature_template ct ON ct.entry = c.id ' +
      'LEFT JOIN creature_template_model ctm ON ctm.CreatureID = c.id AND ctm.Idx = 0 ' +
      'LEFT JOIN creature_addon ca ON ca.guid = c.guid ' +
      'LEFT JOIN creature_template_addon cta ON cta.entry = c.id ' +
      `WHERE ${area('c')} LIMIT ${SPAWN_LOAD_LIMIT}`;

    const gameobjects =
      "SELECT g.guid, g.id AS entry, IFNULL(gt.name, '') AS name, g.map, g.position_x AS x, g.position_y AS y, g.position_z AS z, g.orientation AS o, " +
      '0 AS pathId, 0 AS pathFromTemplate, g.rotation0, g.rotation1, g.rotation2, g.rotation3, ' +
      'IFNULL(gt.displayId, 0) AS displayId, IFNULL(gt.size, 1) AS scale, 0 AS wanderDistance, 0 AS movementType ' +
      'FROM gameobject g ' +
      'LEFT JOIN gameobject_template gt ON gt.entry = g.id ' +
      `WHERE ${area('g')} LIMIT ${SPAWN_LOAD_LIMIT}`;

    const [creatureRows, gameobjectRows] = await Promise.all([
      firstValueFrom(this.queryService.query<SpawnRow>(creatures)),
      firstValueFrom(this.queryService.query<SpawnRow>(gameobjects)),
    ]);
    return [...toSpawns('creature', creatureRows), ...toSpawns('gameobject', gameobjectRows)];
  }

  async loadWaypoints(pathIds: number[]): Promise<WaypointRecord[]> {
    if (pathIds.length === 0) {
      return [];
    }
    const rows = await firstValueFrom(
      this.queryService.query<WaypointRow>(
        'SELECT id AS pathId, point, position_x AS x, position_y AS y, position_z AS z, delay, ' +
          'move_type AS moveType, action, action_chance AS actionChance FROM waypoint_data ' +
          `WHERE id IN (${[...new Set(pathIds)].join(', ')}) ORDER BY id, point`,
      ),
    );
    return (rows ?? []).map((row) => ({
      pathId: Number(row.pathId),
      point: Number(row.point),
      x: Number(row.x),
      y: Number(row.y),
      z: Number(row.z),
      delay: Number(row.delay),
      moveType: Number(row.moveType ?? 0),
      action: Number(row.action ?? 0),
      actionChance: Number(row.actionChance ?? 100),
    }));
  }

  /** Steps of the `waypoint_scripts` scripts run at waypoints, by script id. */
  async loadWaypointScripts(ids: number[]): Promise<Map<number, WaypointScriptStep[]>> {
    const unique = [...new Set(ids.filter((id) => id > 0))];
    const scripts = new Map<number, WaypointScriptStep[]>();
    if (unique.length === 0) {
      return scripts;
    }
    const rows = await firstValueFrom(
      this.queryService.query<WaypointScriptStep & TableRow>(
        `SELECT id, delay, command FROM waypoint_scripts WHERE id IN (${unique.join(', ')}) ORDER BY id, delay`,
      ),
    );
    for (const row of rows ?? []) {
      const step = { id: Number(row.id), delay: Number(row.delay), command: Number(row.command) };
      scripts.set(step.id, [...(scripts.get(step.id) ?? []), step]);
    }
    return scripts;
  }

  /** SmartAI "waypoint reached" rows (event 108) of the given creatures, by entry and by guid. */
  async loadWaypointSai(creatures: { entry: number; guid: number }[]): Promise<WaypointSaiRow[]> {
    const ids = [...new Set(creatures.flatMap((c) => [Math.trunc(c.entry), -Math.trunc(c.guid)]))];
    if (ids.length === 0) {
      return [];
    }
    const rows = await firstValueFrom(
      this.queryService.query<TableRow>(
        'SELECT entryorguid, event_param1 AS point, event_param2 AS pathId, action_type AS actionType, comment FROM smart_scripts ' +
          `WHERE source_type = 0 AND event_type = ${SAI_EVENT_WAYPOINT_DATA_REACHED} AND entryorguid IN (${ids.join(', ')})`,
      ),
    );
    return (rows ?? []).map((row) => ({
      entryorguid: Number(row['entryorguid']),
      point: Number(row['point']),
      pathId: Number(row['pathId']),
      actionType: Number(row['actionType']),
      comment: String(row['comment'] ?? ''),
    }));
  }

  /**
   * Id for a new path of a creature: `guid * 10` (AzerothCore's convention) when unused, otherwise the highest path id
   * + 1 (what `.wp add` does). `reserved` are ids already handed out in this session but not saved yet.
   */
  async getFreePathId(guid: number, reserved: number[] = []): Promise<number> {
    const preferred = preferredPathId(guid);
    const rows = await firstValueFrom(
      this.queryService.query<{ used: number; max: number }>(
        `SELECT (SELECT COUNT(*) FROM waypoint_data WHERE id = ${preferred}) AS used, (SELECT IFNULL(MAX(id), 0) FROM waypoint_data) AS max`,
      ),
    );
    const used = Number(rows?.[0]?.used ?? 0) > 0 || reserved.includes(preferred);
    return used ? Math.max(Number(rows?.[0]?.max ?? 0), ...reserved) + 1 : preferred;
  }

  async getMaxGuid(type: SpawnType): Promise<number> {
    const rows = await firstValueFrom(this.queryService.getMaxId(type === 'creature' ? 'creature' : 'gameobject', 'guid'));
    return Number(rows?.[0]?.max ?? 0);
  }

  getEntryName(type: SpawnType, entry: number): Promise<string> {
    return type === 'creature' ? this.queryService.getCreatureNameById(entry) : this.queryService.getGameObjectNameById(entry);
  }

  /** Display id and scale of an entry, so a newly placed spawn shows its model. */
  async getEntryDisplay(type: SpawnType, entry: number): Promise<{ displayId: number; scale: number }> {
    const sql =
      type === 'creature'
        ? `SELECT CreatureDisplayID AS displayId, DisplayScale AS scale FROM creature_template_model WHERE CreatureID = ${Math.trunc(entry)} AND Idx = 0`
        : `SELECT displayId, size AS scale FROM gameobject_template WHERE entry = ${Math.trunc(entry)}`;
    const [row] = (await firstValueFrom(this.queryService.query<{ displayId: number; scale: number }>(sql))) ?? [];
    return { displayId: Number(row?.displayId ?? 0), scale: Number(row?.scale ?? 1) };
  }

  async searchTele(text: string): Promise<TeleRow[]> {
    const rows = await firstValueFrom(
      this.queryService.query<TeleRow>(
        'SELECT id, name, map, position_x AS x, position_y AS y, position_z AS z FROM game_tele WHERE name LIKE ? ORDER BY name LIMIT 25',
        [`%${text}%`],
      ),
    );
    return rows ?? [];
  }

  async execute(sql: string): Promise<void> {
    await firstValueFrom(this.queryService.query(sql));
  }
}

function toSpawns(type: SpawnType, rows: SpawnRow[] | undefined): SpawnRecord[] {
  return (rows ?? []).map((row) => ({
    ...(type === 'gameobject'
      ? { rotation: [Number(row.rotation0), Number(row.rotation1), Number(row.rotation2), Number(row.rotation3)] as Quaternion }
      : {}),
    ...(Number(row.pathFromTemplate) ? { pathFromTemplate: true } : {}),
    type,
    guid: Number(row.guid),
    entry: Number(row.entry),
    name: String(row.name ?? ''),
    map: Number(row.map),
    x: Number(row.x),
    y: Number(row.y),
    z: Number(row.z),
    o: Number(row.o),
    pathId: Number(row.pathId),
    displayId: Number(row.displayId ?? 0),
    scale: Number(row.scale ?? 1),
    ...(Number(row.movementType) === RANDOM_MOVEMENT ? { wanderDistance: Number(row.wanderDistance) } : {}),
  }));
}
