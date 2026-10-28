import { inject, Service } from '@angular/core';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { WorldBounds, WorldPosition } from '@keira/shared/wow-data';
import { firstValueFrom } from 'rxjs';
import {
  FormationMember,
  SPAWN_FIELDS,
  Graveyard,
  Teleport,
  isSaiPath,
  AreaPath,
  PlaceTemplate,
  GAMEOBJECT_CHEST,
  GAMEOBJECT_FISHING_HOLE,
  GAMEOBJECT_TRANSPORT,
  PoolMember,
  PoolSpawn,
  preferredPathId,
  saiPathEntry,
  saiPathId,
  SPAWN_LOAD_LIMIT,
  SPAWN_LOAD_RADIUS,
  Quaternion,
  SpawnRecord,
  SpawnRow,
  SpawnQuest,
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
/** SMART_EVENT_ESCORT_REACHED: a creature on a SmartAI path (`waypoints`) reached a point. */
const SAI_EVENT_ESCORT_REACHED = 40;
/** SMART_ACTION_ESCORT_START (path id in param 2) and SMART_ACTION_START_CLOSEST_WAYPOINT (path ids in params 1–6). */
const SAI_ACTION_ESCORT_START = 53;
const SAI_ACTION_START_CLOSEST_WAYPOINT = 113;
/** Spawn search results, at most, per type. */
const SEARCH_LIMIT = 50;
/** CREATURE_FLAG_EXTRA_TRIGGER: an invisible creature used by scripts. */
const FLAG_EXTRA_TRIGGER = 128;
/** Names of helper spawns players never see. */
const helperName = (column: string): string => `(${column} LIKE '%Trigger%' OR ${column} LIKE '%Bunny%' OR ${column} LIKE '%DND%')`;
/** The event a spawn belongs to; a negative eventEntry means it is removed during the event, so it isn't an event spawn. */
const eventOf = (table: string, guid: string): string =>
  `IFNULL((SELECT MAX(e.eventEntry) FROM ${table} e WHERE e.guid = ${guid} AND e.eventEntry > 0), 0) AS eventEntry`;

/** Database access of the world editor (reads only; writes go through the generated SQL). */
@Service()
export class WorldEditorService {
  private readonly queryService = inject(MysqlQueryService);

  /** Creatures and gameobjects of `map` in a square of `radius` yards around `center`. */
  /** Spawns around `center`, and also everywhere in `region` when given (Load the whole zone, an area of the world map). */
  async loadSpawns(map: number, center: WorldPosition, radius = SPAWN_LOAD_RADIUS, region?: WorldBounds): Promise<SpawnRecord[]> {
    const [minX, maxX] = [Math.min(center.x - radius, region?.minX ?? Infinity), Math.max(center.x + radius, region?.maxX ?? -Infinity)];
    const [minY, maxY] = [Math.min(center.y - radius, region?.minY ?? Infinity), Math.max(center.y + radius, region?.maxY ?? -Infinity)];
    const area = (alias: string): string =>
      `${alias}.map = ${map}` +
      ` AND ${alias}.position_x BETWEEN ${num(minX)} AND ${num(maxX)}` +
      ` AND ${alias}.position_y BETWEEN ${num(minY)} AND ${num(maxY)}`;

    const creatures =
      "SELECT c.guid, c.id AS entry, IFNULL(ct.name, '') AS name, c.map, c.position_x AS x, c.position_y AS y, c.position_z AS z, c.orientation AS o, " +
      // Like Creature::GetCreatureAddon: an addon row (even with path_id 0) wins over the template addon as a whole.
      'IF(ca.guid IS NOT NULL, ca.path_id, IFNULL(cta.path_id, 0)) AS pathId, ' +
      '(ca.guid IS NULL AND IFNULL(cta.path_id, 0) <> 0) AS pathFromTemplate, ' +
      '0 AS rotation0, 0 AS rotation1, 0 AS rotation2, 0 AS rotation3, ' +
      // the first template model, as the server picks when it has a single one
      'IFNULL(ctm.CreatureDisplayID, 0) AS displayId, IFNULL(ctm.DisplayScale, 1) AS scale, ' +
      'c.wander_distance AS wanderDistance, c.MovementType AS movementType, c.phaseMask, c.spawnMask, ' +
      'IFNULL(ct.speed_walk, 1) AS speedWalk, IFNULL(ct.speed_run, 1) AS speedRun, ' +
      'IFNULL(cmi.BoundingRadius, 0) AS boundingRadius, IFNULL(cmi.CombatReach, 0) AS combatReach, ' +
      `${eventOf('game_event_creature', 'c.guid')}, ` +
      `((IFNULL(ct.flags_extra, 0) & ${FLAG_EXTRA_TRIGGER}) <> 0 OR ${helperName('ct.name')}) AS isTrigger, ` +
      "IFNULL(ct.AIName, '') AS aiName, IFNULL(ct.ScriptName, '') AS scriptName, " +
      'IFNULL(ct.lootid, 0) AS lootId, IFNULL(ct.pickpocketloot, 0) AS pickpocketLoot, IFNULL(ct.skinloot, 0) AS skinLoot, ' +
      'IFNULL(ct.faction, 0) AS faction ' +
      'FROM creature c ' +
      'LEFT JOIN creature_template ct ON ct.entry = c.id ' +
      'LEFT JOIN creature_template_model ctm ON ctm.CreatureID = c.id AND ctm.Idx = 0 ' +
      'LEFT JOIN creature_model_info cmi ON cmi.DisplayID = ctm.CreatureDisplayID ' +
      'LEFT JOIN creature_addon ca ON ca.guid = c.guid ' +
      'LEFT JOIN creature_template_addon cta ON cta.entry = c.id ' +
      `WHERE ${area('c')} LIMIT ${SPAWN_LOAD_LIMIT}`;

    const gameobjects =
      "SELECT g.guid, g.id AS entry, IFNULL(gt.name, '') AS name, g.map, g.position_x AS x, g.position_y AS y, g.position_z AS z, g.orientation AS o, " +
      '0 AS pathId, 0 AS pathFromTemplate, g.rotation0, g.rotation1, g.rotation2, g.rotation3, ' +
      'IFNULL(gt.displayId, 0) AS displayId, IFNULL(gt.size, 1) AS scale, 0 AS wanderDistance, 0 AS movementType, g.phaseMask, g.spawnMask, ' +
      `${eventOf('game_event_gameobject', 'g.guid')}, IFNULL(${helperName('gt.name')}, 0) AS isTrigger, ` +
      "IFNULL(gt.AIName, '') AS aiName, IFNULL(gt.ScriptName, '') AS scriptName, " +
      // chests (3) and fishing holes (25) keep their loot id in Data1
      `IF(gt.type IN (${GAMEOBJECT_CHEST}, ${GAMEOBJECT_FISHING_HOLE}), IFNULL(gt.Data1, 0), 0) AS lootId, 0 AS pickpocketLoot, 0 AS skinLoot, ` +
      'IFNULL(gta.faction, 0) AS faction ' +
      'FROM gameobject g ' +
      'LEFT JOIN gameobject_template gt ON gt.entry = g.id ' +
      'LEFT JOIN gameobject_template_addon gta ON gta.entry = g.id ' +
      `WHERE ${area('g')} LIMIT ${SPAWN_LOAD_LIMIT}`;

    const [creatureRows, gameobjectRows] = await Promise.all([
      firstValueFrom(this.queryService.query<SpawnRow>(creatures)),
      firstValueFrom(this.queryService.query<SpawnRow>(gameobjects)),
    ]);
    return [...toSpawns('creature', creatureRows), ...toSpawns('gameobject', gameobjectRows)];
  }

  /**
   * Every path with a point in the area besides the given ones (View > Every path in the area): `waypoint_data` paths
   * nothing loaded walks (left out when a creature on another map walks them), SmartAI `waypoints` and the escort
   * scripts' `script_waypoint` paths of creatures spawned on this map. Each table is skipped when it can't be read.
   */
  async loadAreaPaths(
    map: number,
    center: WorldPosition,
    known: number[],
    radius = SPAWN_LOAD_RADIUS,
    region?: WorldBounds,
  ): Promise<AreaPath[]> {
    const [minX, maxX] = [Math.min(center.x - radius, region?.minX ?? Infinity), Math.max(center.x + radius, region?.maxX ?? -Infinity)];
    const [minY, maxY] = [Math.min(center.y - radius, region?.minY ?? Infinity), Math.max(center.y + radius, region?.maxY ?? -Infinity)];
    const inside = (x: string, y: string): string =>
      `${x} BETWEEN ${num(minX)} AND ${num(maxX)} AND ${y} BETWEEN ${num(minY)} AND ${num(maxY)}`;
    const id = Math.trunc(map);
    const data = known.filter((pathId) => !isSaiPath(pathId)).map(Math.trunc);
    const sai = known.filter(isSaiPath).map((pathId) => Math.trunc(saiPathEntry(pathId)));
    const notIn = (column: string, ids: number[]) => (ids.length ? ` AND ${column} NOT IN (${ids.join(', ')})` : '');
    const queries: [AreaPath['source'], string][] = [
      [
        'data',
        'SELECT id, point, position_x AS x, position_y AS y, position_z AS z, delay FROM waypoint_data w WHERE id IN ' +
          `(SELECT id FROM (SELECT DISTINCT id FROM waypoint_data WHERE ${inside('position_x', 'position_y')}${notIn('id', data)}) t) ` +
          `AND NOT EXISTS (SELECT 1 FROM creature_addon ca JOIN creature c ON c.guid = ca.guid WHERE ca.path_id = w.id AND c.map <> ${id}) ` +
          'ORDER BY id, point',
      ],
      [
        'sai',
        'SELECT entry AS id, pointid AS point, position_x AS x, position_y AS y, position_z AS z, delay FROM waypoints w WHERE entry IN ' +
          `(SELECT entry FROM (SELECT DISTINCT entry FROM waypoints WHERE ${inside('position_x', 'position_y')}${notIn('entry', sai)}) t) ` +
          `AND NOT EXISTS (SELECT 1 FROM creature c WHERE c.id = w.entry AND c.map <> ${id}) ORDER BY entry, pointid`,
      ],
      [
        'script',
        'SELECT entry AS id, pointid AS point, location_x AS x, location_y AS y, location_z AS z, waittime AS delay FROM script_waypoint s ' +
          `WHERE EXISTS (SELECT 1 FROM creature c WHERE c.id = s.entry AND c.map = ${id}) AND entry IN ` +
          `(SELECT entry FROM (SELECT DISTINCT entry FROM script_waypoint WHERE ${inside('location_x', 'location_y')}) t) ORDER BY entry, pointid`,
      ],
    ];
    const results = await Promise.all(
      queries.map(([source, sql]) =>
        firstValueFrom(this.queryService.query<TableRow>(sql))
          .then((rows) => ({ source, rows: rows ?? [] }))
          .catch(() => ({ source, rows: [] as TableRow[] })),
      ),
    );
    const paths: AreaPath[] = [];
    for (const { source, rows } of results) {
      for (const row of rows) {
        const pathId = Number(row['id']);
        let path = paths.find((p) => p.source === source && p.id === pathId);
        if (!path) {
          path = { source, id: pathId, points: [] };
          paths.push(path);
        }
        path.points.push({
          point: Number(row['point']),
          x: Number(row['x']),
          y: Number(row['y']),
          z: Number(row['z']),
          delay: Number(row['delay']),
        });
      }
    }
    return paths;
  }

  /** Points of the given paths: `waypoint_data` ones, and SmartAI ones (negative ids, from `waypoints`). */
  async loadWaypoints(pathIds: number[]): Promise<WaypointRecord[]> {
    const data = [...new Set(pathIds.filter((id) => !isSaiPath(id)))];
    const sai = [...new Set(pathIds.filter(isSaiPath).map(saiPathEntry))];
    const parts = [
      ...(data.length
        ? [
            'SELECT id AS pathId, point, position_x AS x, position_y AS y, position_z AS z, delay, ' +
              `move_type AS moveType, action, action_chance AS actionChance, orientation FROM waypoint_data WHERE id IN (${data.join(', ')})`,
          ]
        : []),
      ...(sai.length
        ? [
            'SELECT -entry AS pathId, pointid AS point, position_x AS x, position_y AS y, position_z AS z, delay, ' +
              `0 AS moveType, 0 AS action, 100 AS actionChance, orientation FROM waypoints WHERE entry IN (${sai.join(', ')})`,
          ]
        : []),
    ];
    if (parts.length === 0) {
      return [];
    }
    const rows = await firstValueFrom(this.queryService.query<WaypointRow>(`${parts.join(' UNION ALL ')} ORDER BY pathId, point`));
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
      ...(row['orientation'] != null ? { orientation: Number(row['orientation']) } : {}),
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

  /**
   * SmartAI paths the scripts of the given creatures start (escort start, start closest waypoint), as `saiPathId`s by
   * `entryorguid` (entry, or −guid).
   */
  async loadSaiPaths(creatures: { entry: number; guid: number }[]): Promise<Map<number, number[]>> {
    const ids = [...new Set(creatures.flatMap((c) => [Math.trunc(c.entry), -Math.trunc(c.guid)]))];
    const paths = new Map<number, number[]>();
    if (ids.length === 0) {
      return paths;
    }
    const rows = await firstValueFrom(
      this.queryService.query<TableRow>(
        'SELECT entryorguid, action_type AS actionType, action_param1 AS p1, action_param2 AS p2, action_param3 AS p3, ' +
          'action_param4 AS p4, action_param5 AS p5, action_param6 AS p6 FROM smart_scripts ' +
          `WHERE source_type = 0 AND action_type IN (${SAI_ACTION_ESCORT_START}, ${SAI_ACTION_START_CLOSEST_WAYPOINT}) AND entryorguid IN (${ids.join(', ')})`,
      ),
    );
    for (const row of rows ?? []) {
      const params = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].map((p) => Number(row[p]));
      const entries = Number(row['actionType']) === SAI_ACTION_ESCORT_START ? [params[1]] : params;
      const owner = Number(row['entryorguid']);
      const list = paths.get(owner) ?? [];
      entries.filter((entry) => entry > 0 && !list.includes(saiPathId(entry))).forEach((entry) => list.push(saiPathId(entry)));
      paths.set(owner, list);
    }
    return paths;
  }

  /**
   * SmartAI "waypoint reached" rows of the given creatures, by entry and by guid: on `waypoint_data` paths (event 108)
   * and on SmartAI paths (event 40, path ids given as `saiPathId`s).
   */
  async loadWaypointSai(creatures: { entry: number; guid: number }[]): Promise<WaypointSaiRow[]> {
    const ids = [...new Set(creatures.flatMap((c) => [Math.trunc(c.entry), -Math.trunc(c.guid)]))];
    if (ids.length === 0) {
      return [];
    }
    const rows = await firstValueFrom(
      this.queryService.query<TableRow>(
        'SELECT entryorguid, event_type AS eventType, event_param1 AS point, event_param2 AS pathId, action_type AS actionType, comment FROM smart_scripts ' +
          `WHERE source_type = 0 AND event_type IN (${SAI_EVENT_WAYPOINT_DATA_REACHED}, ${SAI_EVENT_ESCORT_REACHED}) AND entryorguid IN (${ids.join(', ')})`,
      ),
    );
    return (rows ?? []).map((row) => ({
      entryorguid: Number(row['entryorguid']),
      point: Number(row['point']),
      // 0 means any path; SmartAI paths are negative here
      ...(Number(row['eventType']) === SAI_EVENT_ESCORT_REACHED
        ? { escort: true, pathId: saiPathId(Number(row['pathId'])) || 0 }
        : { pathId: Number(row['pathId']) }),
      actionType: Number(row['actionType']),
      comment: String(row['comment'] ?? ''),
    }));
  }

  /** The columns of a spawn the properties panel edits (see `SPAWN_FIELDS`), as stored. */
  async loadSpawnFields(type: SpawnType, guid: number): Promise<Record<string, number>> {
    const columns = SPAWN_FIELDS[type].map((field) => field.column);
    const [row] =
      (await firstValueFrom(
        this.queryService.query<TableRow>(
          `SELECT ${columns.map((c) => `\`${c}\``).join(', ')} FROM ${type} WHERE guid = ${Math.trunc(guid)}`,
        ),
      )) ?? [];
    return Object.fromEntries(columns.map((column) => [column, Number(row?.[column] ?? 0)]));
  }

  /** Creature entries by `ScriptName`, for the given script names. */
  async loadScriptEntries(scriptNames: string[]): Promise<Map<string, number[]>> {
    const names = [...new Set(scriptNames)];
    const entries = new Map<string, number[]>();
    if (names.length === 0) {
      return entries;
    }
    const rows = await firstValueFrom(
      this.queryService.query<TableRow>(
        `SELECT entry, ScriptName AS scriptName FROM creature_template WHERE ScriptName IN (${names.map(() => '?').join(', ')})`,
        names,
      ),
    );
    for (const row of rows ?? []) {
      const name = String(row['scriptName']);
      entries.set(name, [...(entries.get(name) ?? []), Number(row['entry'])]);
    }
    return entries;
  }

  /**
   * Spawns of a map by GUID, entry or name (creatures and gameobjects, at most `SEARCH_LIMIT` of each): a number looks
   * for that GUID or entry, text for names containing it.
   */
  async searchSpawns(map: number, text: string): Promise<SpawnRecord[]> {
    const query = text.trim();
    if (!query) {
      return [];
    }
    const number = /^\d+$/.test(query) ? Number(query) : undefined;
    const match = (alias: string, name: string) =>
      number !== undefined ? `(${alias}.guid = ${number} OR ${alias}.id = ${number})` : `${name} LIKE ?`;
    const sql =
      `(SELECT 'creature' AS type, c.guid, c.id AS entry, IFNULL(ct.name, '') AS name, c.position_x AS x, c.position_y AS y, c.position_z AS z, c.orientation AS o ` +
      `FROM creature c LEFT JOIN creature_template ct ON ct.entry = c.id WHERE c.map = ${Math.trunc(map)} AND ${match('c', 'ct.name')} LIMIT ${SEARCH_LIMIT}) ` +
      `UNION ALL (SELECT 'gameobject', g.guid, g.id, IFNULL(gt.name, ''), g.position_x, g.position_y, g.position_z, g.orientation ` +
      `FROM gameobject g LEFT JOIN gameobject_template gt ON gt.entry = g.id WHERE g.map = ${Math.trunc(map)} AND ${match('g', 'gt.name')} LIMIT ${SEARCH_LIMIT})`;
    const rows = await firstValueFrom(this.queryService.query<TableRow>(sql, number === undefined ? [`%${query}%`, `%${query}%`] : []));
    return (rows ?? []).map((row) => ({
      type: row['type'] as SpawnType,
      guid: Number(row['guid']),
      entry: Number(row['entry']),
      name: String(row['name'] ?? ''),
      map,
      x: Number(row['x']),
      y: Number(row['y']),
      z: Number(row['z']),
      o: Number(row['o']),
      pathId: 0,
    }));
  }

  /** Graveyards (`game_graveyard`) of a map. */
  async loadGraveyards(map: number): Promise<Graveyard[]> {
    const rows = await firstValueFrom(
      this.queryService.query<TableRow>(
        "SELECT g.ID AS id, g.x, g.y, g.z, IFNULL(g.Comment, '') AS comment, " +
          '(SELECT GROUP_CONCAT(DISTINCT z.Faction) FROM graveyard_zone z WHERE z.ID = g.ID) AS factions ' +
          `FROM game_graveyard g WHERE g.Map = ${Math.trunc(map)}`,
      ),
    );
    return (rows ?? []).map((row) => {
      const factions = row['factions'] ? String(row['factions']).split(',').map(Number) : [];
      return {
        id: Number(row['id']),
        x: Number(row['x']),
        y: Number(row['y']),
        z: Number(row['z']),
        comment: String(row['comment']),
        ...(factions.length
          ? {
              sides: {
                alliance: factions.some((f) => f === 0 || f === TEAM_ALLIANCE),
                horde: factions.some((f) => f === 0 || f === TEAM_HORDE),
              },
            }
          : {}),
      };
    });
  }

  /** Where the given area triggers teleport to (`areatrigger_teleport`). */
  async loadTeleports(ids: number[]): Promise<Teleport[]> {
    const unique = [...new Set(ids.map(Math.trunc))];
    if (unique.length === 0) {
      return [];
    }
    const rows = await firstValueFrom(
      this.queryService.query<TableRow>(
        "SELECT ID AS id, IFNULL(Name, '') AS name, target_map AS map, target_position_x AS x, target_position_y AS y, target_position_z AS z " +
          `FROM areatrigger_teleport WHERE ID IN (${unique.join(', ')})`,
      ),
    );
    return (rows ?? []).map((row) => ({
      id: Number(row['id']),
      name: String(row['name']),
      map: Number(row['map']),
      x: Number(row['x']),
      y: Number(row['y']),
      z: Number(row['z']),
    }));
  }

  /**
   * A known good place to arrive on a map: where its instance entrance teleports to (`areatrigger_teleport`), else its
   * first teleport location (`game_tele`); undefined without either.
   */
  async loadLandingSpot(map: number): Promise<WorldPosition | undefined> {
    const id = Math.trunc(map);
    const rows = await firstValueFrom(
      this.queryService.query<TableRow>(
        '(SELECT target_position_x AS x, target_position_y AS y, target_position_z AS z, 0 AS source ' +
          `FROM areatrigger_teleport WHERE target_map = ${id} ORDER BY ID LIMIT 1) UNION ALL ` +
          `(SELECT position_x, position_y, position_z, 1 FROM game_tele WHERE map = ${id} ORDER BY id LIMIT 1) ORDER BY source LIMIT 1`,
      ),
    );
    const [row] = rows ?? [];
    return row && { x: Number(row['x']), y: Number(row['y']), z: Number(row['z']) };
  }

  /** Formation rows (`creature_formations`) the given creatures lead or are members of. */
  async loadFormations(guids: number[]): Promise<FormationMember[]> {
    const unique = [...new Set(guids.map(Math.trunc))];
    if (unique.length === 0) {
      return [];
    }
    const list = unique.join(', ');
    const rows = await firstValueFrom(
      this.queryService.query<TableRow>(
        'SELECT leaderGUID AS leader, memberGUID AS member, dist, angle, groupAI FROM creature_formations ' +
          `WHERE leaderGUID IN (${list}) OR memberGUID IN (${list})`,
      ),
    );
    return (rows ?? []).map((row) => ({
      leader: Number(row['leader']),
      member: Number(row['member']),
      dist: Number(row['dist']),
      angle: Number(row['angle']),
      groupAI: Number(row['groupAI']),
    }));
  }

  /** The pools (`pool_creature` / `pool_gameobject` with their `pool_template`) the given spawns belong to. */
  async loadPools(spawns: { type: SpawnType; guid: number }[]): Promise<PoolMember[]> {
    const parts: string[] = [];
    for (const type of ['creature', 'gameobject'] as SpawnType[]) {
      const guids = [...new Set(spawns.filter((s) => s.type === type).map((s) => Math.trunc(s.guid)))];
      if (guids.length) {
        parts.push(
          `SELECT '${type}' AS type, p.guid, p.pool_entry AS pool, p.chance, IFNULL(t.max_limit, 0) AS maxLimit, ` +
            `IFNULL(t.description, IFNULL(p.description, '')) AS description FROM pool_${type} p ` +
            `LEFT JOIN pool_template t ON t.entry = p.pool_entry WHERE p.guid IN (${guids.join(', ')})`,
        );
      }
    }
    if (parts.length === 0) {
      return [];
    }
    const rows = await firstValueFrom(this.queryService.query<TableRow>(parts.join(' UNION ALL ')));
    return (rows ?? []).map((row) => ({
      type: row['type'] as SpawnType,
      guid: Number(row['guid']),
      pool: Number(row['pool']),
      chance: Number(row['chance']),
      maxLimit: Number(row['maxLimit']),
      description: String(row['description'] ?? ''),
    }));
  }

  /** The transports (gameobject type 15) whose own map is `map` (Data6): their ship is drawn at its middle. */
  async loadTransports(map: number): Promise<{ entry: number; name: string; displayId: number }[]> {
    if (map <= 0) {
      return [];
    }
    const rows = await firstValueFrom(
      this.queryService.query<TableRow>(
        `SELECT entry, IFNULL(name, '') AS name, displayId FROM gameobject_template WHERE type = ${GAMEOBJECT_TRANSPORT} AND Data6 = ${Math.trunc(map)}`,
      ),
    );
    return (rows ?? []).map((row) => ({ entry: Number(row['entry']), name: String(row['name']), displayId: Number(row['displayId']) }));
  }

  /** Every creature and gameobject of a pool (`pool_creature` / `pool_gameobject`), wherever it is. */
  async loadPoolMembers(pool: number): Promise<PoolSpawn[]> {
    const part = (type: SpawnType, table: string, template: string): string =>
      `SELECT '${type}' AS type, s.guid, s.id AS entry, IFNULL(t.name, '') AS name, s.map, ` +
      `s.position_x AS x, s.position_y AS y, s.position_z AS z FROM pool_${type} p ` +
      `JOIN ${table} s ON s.guid = p.guid LEFT JOIN ${template} t ON t.entry = s.id WHERE p.pool_entry = ${Math.trunc(pool)}`;
    const rows = await firstValueFrom(
      this.queryService.query<TableRow>(
        `${part('creature', 'creature', 'creature_template')} UNION ALL ${part('gameobject', 'gameobject', 'gameobject_template')} ` +
          'ORDER BY type, guid',
      ),
    );
    return (rows ?? []).map((row) => ({
      type: row['type'] as SpawnType,
      guid: Number(row['guid']),
      entry: Number(row['entry']),
      name: String(row['name'] ?? ''),
      map: Number(row['map']),
      x: Number(row['x']),
      y: Number(row['y']),
      z: Number(row['z']),
    }));
  }

  /** Quests the given creatures and gameobjects start or end (by entry), with their titles. */
  async loadQuests(entries: { type: SpawnType; entry: number }[]): Promise<SpawnQuest[]> {
    const ids = (type: SpawnType): number[] => [...new Set(entries.filter((e) => e.type === type).map((e) => Math.trunc(e.entry)))];
    const parts: string[] = [];
    for (const type of ['creature', 'gameobject'] as SpawnType[]) {
      const list = ids(type);
      for (const role of ['starter', 'ender']) {
        if (list.length) {
          parts.push(
            `SELECT '${type}' AS type, q.id AS entry, q.quest, '${role}' AS role, IFNULL(qt.LogTitle, '') AS title ` +
              `FROM ${type}_quest${role} q LEFT JOIN quest_template qt ON qt.ID = q.quest WHERE q.id IN (${list.join(', ')})`,
          );
        }
      }
    }
    if (parts.length === 0) {
      return [];
    }
    const rows = await firstValueFrom(this.queryService.query<TableRow>(`${parts.join(' UNION ALL ')} ORDER BY quest`));
    return (rows ?? []).map((row) => ({
      type: row['type'] as SpawnType,
      entry: Number(row['entry']),
      quest: Number(row['quest']),
      role: row['role'] === 'ender' ? 'ends' : 'starts',
      title: String(row['title'] ?? ''),
    }));
  }

  /** What the database does with area triggers (teleport, inn, script, quest objective), as text lines by id. */
  async loadAreaTriggerInfo(ids: number[]): Promise<Map<number, string[]>> {
    const unique = [...new Set(ids.map(Math.trunc))];
    const info = new Map<number, string[]>();
    if (unique.length === 0) {
      return info;
    }
    const list = unique.join(', ');
    const rows = await firstValueFrom(
      this.queryService.query<TableRow>(
        `SELECT ID AS id, CONCAT('Teleport: ', Name, ' (map ', target_map, ')') AS text FROM areatrigger_teleport WHERE ID IN (${list}) ` +
          `UNION ALL SELECT id, CONCAT('Inn: ', name) FROM areatrigger_tavern WHERE id IN (${list}) ` +
          `UNION ALL SELECT entry, CONCAT('Script: ', ScriptName) FROM areatrigger_scripts WHERE entry IN (${list}) ` +
          `UNION ALL SELECT id, CONCAT('Quest: ', quest) FROM areatrigger_involvedrelation WHERE id IN (${list})`,
      ),
    );
    for (const row of rows ?? []) {
      const id = Number(row['id']);
      info.set(id, [...(info.get(id) ?? []), String(row['text'])]);
    }
    return info;
  }

  /** Descriptions of game events, by id. */
  async loadEventNames(ids: number[]): Promise<Map<number, string>> {
    const unique = [...new Set(ids.map(Math.trunc).filter((id) => id > 0))];
    const names = new Map<number, string>();
    if (unique.length === 0) {
      return names;
    }
    const rows = await firstValueFrom(
      this.queryService.query<TableRow>(`SELECT eventEntry, description FROM game_event WHERE eventEntry IN (${unique.join(', ')})`),
    );
    for (const row of rows ?? []) {
      names.set(Number(row['eventEntry']), String(row['description'] ?? ''));
    }
    return names;
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

  /** Templates to place, by entry or name (an entry typed comes first), with their model (display id and scale). */
  async searchTemplates(type: SpawnType, text: string): Promise<PlaceTemplate[]> {
    const entry = /^\d+$/.test(text.trim()) ? Number(text.trim()) : -1;
    const sql =
      type === 'creature'
        ? "SELECT ct.entry, IFNULL(ct.name, '') AS name, IFNULL(ctm.CreatureDisplayID, 0) AS displayId, IFNULL(ctm.DisplayScale, 1) AS scale " +
          'FROM creature_template ct LEFT JOIN creature_template_model ctm ON ctm.CreatureID = ct.entry AND ctm.Idx = 0 ' +
          'WHERE ct.entry = ? OR ct.name LIKE ? ORDER BY ct.entry = ? DESC, ct.name LIMIT 30'
        : "SELECT entry, IFNULL(name, '') AS name, displayId, size AS scale FROM gameobject_template " +
          'WHERE entry = ? OR name LIKE ? ORDER BY entry = ? DESC, name LIMIT 30';
    const rows = await firstValueFrom(this.queryService.query<TableRow>(sql, [String(entry), `%${text.trim()}%`, String(entry)]));
    return (rows ?? []).map((row) => ({
      entry: Number(row['entry']),
      name: String(row['name']),
      displayId: Number(row['displayId'] ?? 0),
      scale: Number(row['scale'] ?? 1),
    }));
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
    ...(Number(row.eventEntry) > 0 ? { event: Number(row.eventEntry) } : {}),
    ...(Number(row.isTrigger) ? { trigger: true } : {}),
    ...(type === 'creature' ? { speedWalk: Number(row.speedWalk), speedRun: Number(row.speedRun) } : {}),
    ...(Number(row['boundingRadius']) > 0
      ? { boundingRadius: Number(row['boundingRadius']), combatReach: Number(row['combatReach']) }
      : {}),
    phaseMask: Number(row.phaseMask ?? 1),
    // (in which difficulties it's spawned: only kept when not just the first)
    ...(Number(row['spawnMask'] ?? 1) !== 1 ? { spawnMask: Number(row['spawnMask']) } : {}),
    ...(Number(row['faction']) > 0 ? { faction: Number(row['faction']) } : {}),
    ...(row['aiName'] ? { aiName: String(row['aiName']) } : {}),
    ...(row['scriptName'] ? { scriptName: String(row['scriptName']) } : {}),
    ...lootOf(row),
  }));
}

/** The loot tables a spawn uses (only those set). */
/** graveyard_zone.Faction of each side. */
const TEAM_ALLIANCE = 469;
const TEAM_HORDE = 67;

function lootOf(row: SpawnRow): Pick<SpawnRecord, 'loot'> {
  const loot = {
    ...(Number(row['lootId']) > 0 ? { loot: Number(row['lootId']) } : {}),
    ...(Number(row['pickpocketLoot']) > 0 ? { pickpocketing: Number(row['pickpocketLoot']) } : {}),
    ...(Number(row['skinLoot']) > 0 ? { skinning: Number(row['skinLoot']) } : {}),
  };
  return Object.keys(loot).length ? { loot } : {};
}
