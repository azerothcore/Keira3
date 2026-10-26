import { inject, Service } from '@angular/core';
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

const num = (value: number): number => Math.round(value * 100) / 100;

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
      'IFNULL(ctm.CreatureDisplayID, 0) AS displayId, IFNULL(ctm.DisplayScale, 1) AS scale ' +
      'FROM creature c ' +
      'LEFT JOIN creature_template ct ON ct.entry = c.id ' +
      'LEFT JOIN creature_template_model ctm ON ctm.CreatureID = c.id AND ctm.Idx = 0 ' +
      'LEFT JOIN creature_addon ca ON ca.guid = c.guid ' +
      'LEFT JOIN creature_template_addon cta ON cta.entry = c.id ' +
      `WHERE ${area('c')} LIMIT ${SPAWN_LOAD_LIMIT}`;

    const gameobjects =
      "SELECT g.guid, g.id AS entry, IFNULL(gt.name, '') AS name, g.map, g.position_x AS x, g.position_y AS y, g.position_z AS z, g.orientation AS o, " +
      '0 AS pathId, 0 AS pathFromTemplate, g.rotation0, g.rotation1, g.rotation2, g.rotation3, ' +
      'IFNULL(gt.displayId, 0) AS displayId, IFNULL(gt.size, 1) AS scale ' +
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
        'SELECT id AS pathId, point, position_x AS x, position_y AS y, position_z AS z, delay FROM waypoint_data ' +
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
  }));
}
