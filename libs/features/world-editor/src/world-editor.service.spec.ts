import { TestBed } from '@angular/core/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { of } from 'rxjs';
import { WorldEditorService } from './world-editor.service';

describe('WorldEditorService', () => {
  const setup = () => {
    const queryService = {
      query: vi.fn(),
      getMaxId: vi.fn(),
      getCreatureNameById: vi.fn().mockResolvedValue('Marshal McBride'),
      getGameObjectNameById: vi.fn().mockResolvedValue('Mailbox'),
    };
    TestBed.configureTestingModule({ providers: [{ provide: MysqlQueryService, useValue: queryService }] });
    return { service: TestBed.inject(WorldEditorService), queryService };
  };

  it('loads creatures and gameobjects in the area around the camera', async () => {
    const { service, queryService } = setup();
    queryService.query.mockImplementation((sql: string) =>
      of(
        sql.includes('FROM creature c')
          ? [
              {
                guid: '1',
                entry: 197,
                name: 'Marshal',
                map: 0,
                x: 1,
                y: 2,
                z: 3,
                o: 0.5,
                pathId: 10,
                pathFromTemplate: 0,
                speedWalk: '1',
                speedRun: '1.14',
                boundingRadius: '0.306',
                combatReach: '1.5',
              },
              {
                guid: '9',
                entry: 197,
                name: 'Marshal',
                map: 0,
                x: 1,
                y: 2,
                z: 3,
                o: 0.5,
                pathId: 70,
                pathFromTemplate: 1,
                movementType: '1',
                wanderDistance: '5',
                phaseMask: '2',
                eventEntry: '12',
                isTrigger: '1',
                speedWalk: 1,
                speedRun: 1,
                aiName: 'SmartAI',
                scriptName: 'npc_marshal',
                lootId: '197',
                pickpocketLoot: '5',
                skinLoot: '0',
              },
            ]
          : [
              {
                guid: 2,
                entry: 3,
                name: null,
                map: 0,
                x: 4,
                y: 5,
                z: 6,
                o: 0,
                pathId: 0,
                pathFromTemplate: 0,
                rotation0: 0.1,
                rotation1: 0,
                rotation2: 0,
                rotation3: 0.99,
                displayId: '45',
                scale: '1.5',
                skinLoot: '3',
              },
            ],
      ),
    );

    const spawns = await service.loadSpawns(0, { x: -8913.4567, y: -137, z: 80 }, 100);

    expect(spawns).toEqual([
      {
        type: 'creature',
        guid: 1,
        entry: 197,
        name: 'Marshal',
        map: 0,
        x: 1,
        y: 2,
        z: 3,
        o: 0.5,
        pathId: 10,
        displayId: 0,
        scale: 1,
        phaseMask: 1,
        speedWalk: 1,
        speedRun: 1.14,
        boundingRadius: 0.306,
        combatReach: 1.5,
      },
      {
        type: 'creature',
        guid: 9,
        entry: 197,
        name: 'Marshal',
        map: 0,
        x: 1,
        y: 2,
        z: 3,
        o: 0.5,
        pathId: 70,
        pathFromTemplate: true,
        displayId: 0,
        scale: 1,
        wanderDistance: 5,
        event: 12,
        trigger: true,
        phaseMask: 2,
        speedWalk: 1,
        speedRun: 1,
        aiName: 'SmartAI',
        scriptName: 'npc_marshal',
        loot: { loot: 197, pickpocketing: 5 },
      },
      {
        type: 'gameobject',
        guid: 2,
        entry: 3,
        name: '',
        map: 0,
        x: 4,
        y: 5,
        z: 6,
        o: 0,
        pathId: 0,
        rotation: [0.1, 0, 0, 0.99],
        displayId: 45,
        scale: 1.5,
        phaseMask: 1,
        loot: { skinning: 3 },
      },
    ]);
    expect(queryService.query.mock.calls[1][0]).toContain('IF(gt.type IN (3, 25), IFNULL(gt.Data1, 0), 0) AS lootId');
    const creatureSql = queryService.query.mock.calls[0][0] as string;
    expect(creatureSql).toContain('c.map = 0 AND c.position_x BETWEEN -9013.46 AND -8813.46 AND c.position_y BETWEEN -237 AND -37');
    expect(creatureSql).toContain('LEFT JOIN creature_addon ca ON ca.guid = c.guid');
    expect(creatureSql).toContain('IF(ca.guid IS NOT NULL, ca.path_id, IFNULL(cta.path_id, 0)) AS pathId');
    expect(queryService.query.mock.calls[1][0]).toContain('g.rotation0, g.rotation1, g.rotation2, g.rotation3');
    expect(creatureSql).toContain('LIMIT 3000');
    expect(creatureSql).toContain('LEFT JOIN creature_template_model ctm ON ctm.CreatureID = c.id AND ctm.Idx = 0');
    expect(creatureSql).toContain('c.wander_distance AS wanderDistance, c.MovementType AS movementType');
    expect(queryService.query.mock.calls[1][0]).toContain('IFNULL(gt.displayId, 0) AS displayId, IFNULL(gt.size, 1) AS scale');
    expect(creatureSql).toContain('FROM game_event_creature e WHERE e.guid = c.guid AND e.eventEntry > 0');
    expect(creatureSql).toContain("(IFNULL(ct.flags_extra, 0) & 128) <> 0 OR (ct.name LIKE '%Trigger%'");
    expect(queryService.query.mock.calls[1][0]).toContain('FROM game_event_gameobject e WHERE e.guid = g.guid');
  });

  it('loads every spawn of a pool', async () => {
    const { service, queryService } = setup();
    queryService.query.mockReturnValueOnce(
      of([
        { type: 'creature', guid: '1', entry: '197', name: 'Marshal', map: '0', x: '1', y: '2', z: '3' },
        { type: 'gameobject', guid: '2', entry: '3', name: null, map: '0', x: '4', y: '5', z: '6' },
      ]),
    );
    expect(await service.loadPoolMembers(7.9)).toEqual([
      { type: 'creature', guid: 1, entry: 197, name: 'Marshal', map: 0, x: 1, y: 2, z: 3 },
      { type: 'gameobject', guid: 2, entry: 3, name: '', map: 0, x: 4, y: 5, z: 6 },
    ]);
    const sql = queryService.query.mock.calls[0][0] as string;
    expect(sql).toContain('FROM pool_creature p JOIN creature s ON s.guid = p.guid');
    expect(sql).toContain('WHERE p.pool_entry = 7 UNION ALL');
    queryService.query.mockReturnValueOnce(of(undefined));
    expect(await service.loadPoolMembers(1)).toEqual([]);
  });

  it('loads the quests that creatures and gameobjects start or end', async () => {
    const { service, queryService } = setup();
    expect(await service.loadQuests([])).toEqual([]);
    expect(queryService.query).not.toHaveBeenCalled();
    queryService.query.mockReturnValueOnce(
      of([
        { type: 'creature', entry: '197', quest: '54', role: 'starter', title: 'Report to Goldshire' },
        { type: 'gameobject', entry: '3', quest: '60', role: 'ender', title: null },
      ]),
    );
    expect(
      await service.loadQuests([
        { type: 'creature', entry: 197 },
        { type: 'creature', entry: 197 },
        { type: 'gameobject', entry: 3 },
      ]),
    ).toEqual([
      { type: 'creature', entry: 197, quest: 54, role: 'starts', title: 'Report to Goldshire' },
      { type: 'gameobject', entry: 3, quest: 60, role: 'ends', title: '' },
    ]);
    const sql = queryService.query.mock.calls[0][0] as string;
    expect(sql).toContain('FROM creature_queststarter q LEFT JOIN quest_template qt ON qt.ID = q.quest WHERE q.id IN (197)');
    expect(sql).toContain('FROM gameobject_questender q');
    expect(sql.split('UNION ALL')).toHaveLength(4);
    queryService.query.mockReturnValueOnce(of(undefined));
    expect(await service.loadQuests([{ type: 'creature', entry: 1 }])).toEqual([]);
    expect((queryService.query.mock.calls[1][0] as string).split('UNION ALL')).toHaveLength(2);
  });

  it('describes what the database does with area triggers', async () => {
    const { service, queryService } = setup();
    expect((await service.loadAreaTriggerInfo([])).size).toBe(0);
    expect(queryService.query).not.toHaveBeenCalled();
    queryService.query.mockReturnValueOnce(
      of([
        { id: '45', text: 'Teleport: Scarlet Monastery (map 189)' },
        { id: '45', text: 'Script: at_scarlet' },
        { id: '71', text: "Inn: Lion's Pride Inn" },
      ]),
    );
    const info = await service.loadAreaTriggerInfo([45, 71, 45]);
    expect(info.get(45)).toEqual(['Teleport: Scarlet Monastery (map 189)', 'Script: at_scarlet']);
    expect(info.get(71)).toEqual(["Inn: Lion's Pride Inn"]);
    const sql = queryService.query.mock.calls[0][0] as string;
    expect(sql).toContain('FROM areatrigger_teleport WHERE ID IN (45, 71)');
    expect(sql).toContain('FROM areatrigger_involvedrelation WHERE id IN (45, 71)');
    queryService.query.mockReturnValueOnce(of(undefined));
    expect((await service.loadAreaTriggerInfo([1])).size).toBe(0);
  });

  it('loads the descriptions of game events', async () => {
    const { service, queryService } = setup();
    expect((await service.loadEventNames([0, -3])).size).toBe(0);
    expect(queryService.query).not.toHaveBeenCalled();
    queryService.query.mockReturnValueOnce(
      of([
        { eventEntry: '12', description: "Hallow's End" },
        { eventEntry: '1', description: null },
      ]),
    );
    const names = await service.loadEventNames([12, 1, 12]);
    expect([...names]).toEqual([
      [12, "Hallow's End"],
      [1, ''],
    ]);
    expect(queryService.query).toHaveBeenLastCalledWith('SELECT eventEntry, description FROM game_event WHERE eventEntry IN (12, 1)');
    queryService.query.mockReturnValueOnce(of(undefined));
    expect((await service.loadEventNames([5])).size).toBe(0);
  });

  it('treats missing results as empty', async () => {
    const { service, queryService } = setup();
    queryService.query.mockReturnValue(of(undefined));
    expect(await service.loadSpawns(1, { x: 0, y: 0, z: 0 })).toEqual([]);
    expect(await service.loadWaypoints([1])).toEqual([]);
    expect(await service.searchTele('x')).toEqual([]);
  });

  it('loads the waypoints of the given paths', async () => {
    const { service, queryService } = setup();
    expect(await service.loadWaypoints([])).toEqual([]);
    expect(queryService.query).not.toHaveBeenCalled();

    queryService.query.mockReturnValue(
      of([
        { pathId: '10', point: '1', x: '1.5', y: 2, z: 3, delay: '1000', moveType: '1', action: '50', actionChance: '40' },
        { pathId: '10', point: '2', x: 1, y: 2, z: 3, delay: 0 },
      ]),
    );
    expect(await service.loadWaypoints([10, 10, 20])).toEqual([
      { pathId: 10, point: 1, x: 1.5, y: 2, z: 3, delay: 1000, moveType: 1, action: 50, actionChance: 40 },
      { pathId: 10, point: 2, x: 1, y: 2, z: 3, delay: 0, moveType: 0, action: 0, actionChance: 100 },
    ]);
    expect(queryService.query.mock.calls[0][0]).toContain('WHERE id IN (10, 20) ORDER BY pathId, point');
    expect(queryService.query.mock.calls[0][0]).toContain('move_type AS moveType, action, action_chance AS actionChance');
    expect(queryService.query.mock.calls[0][0]).not.toContain('FROM waypoints');

    // SmartAI paths (negative ids) come from `waypoints`
    queryService.query.mockReturnValueOnce(
      of([{ pathId: '-500', point: '1', x: 1, y: 2, z: 3, delay: 0, moveType: 0, action: 0, actionChance: 100, orientation: '1.5' }]),
    );
    expect(await service.loadWaypoints([-500, 10])).toEqual([
      { pathId: -500, point: 1, x: 1, y: 2, z: 3, delay: 0, moveType: 0, action: 0, actionChance: 100, orientation: 1.5 },
    ]);
    expect(queryService.query.mock.calls[1][0]).toContain(
      'UNION ALL SELECT -entry AS pathId, pointid AS point, position_x AS x, position_y AS y, position_z AS z, delay',
    );
    expect(queryService.query.mock.calls[1][0]).toContain('FROM waypoints WHERE entry IN (500) ORDER BY pathId, point');
    queryService.query.mockReturnValueOnce(of([]));
    await service.loadWaypoints([-7]);
    expect(queryService.query.mock.calls[2][0]).not.toContain('waypoint_data');
  });

  it('finds the SmartAI paths the scripts of creatures start, by entry and by guid', async () => {
    const { service, queryService } = setup();
    expect((await service.loadSaiPaths([])).size).toBe(0);
    queryService.query.mockReturnValueOnce(
      of([
        { entryorguid: '197', actionType: '53', p1: '0', p2: '500', p3: '0', p4: '0', p5: '0', p6: '0' },
        { entryorguid: '197', actionType: '53', p1: '1', p2: '500', p3: '0', p4: '0', p5: '0', p6: '0' },
        { entryorguid: '-9', actionType: '113', p1: '600', p2: '601', p3: '0', p4: '0', p5: '0', p6: '0' },
      ]),
    );
    const paths = await service.loadSaiPaths([{ entry: 197, guid: 9 }]);
    expect(paths.get(197)).toEqual([-500]);
    expect(paths.get(-9)).toEqual([-600, -601]);
    expect(queryService.query.mock.calls[0][0]).toContain('action_type IN (53, 113) AND entryorguid IN (197, -9)');
    queryService.query.mockReturnValueOnce(of(undefined));
    expect((await service.loadSaiPaths([{ entry: 1, guid: 2 }])).size).toBe(0);
  });

  it('loads the scripts run at waypoints', async () => {
    const { service, queryService } = setup();
    expect((await service.loadWaypointScripts([0, 0])).size).toBe(0);
    expect(queryService.query).not.toHaveBeenCalled();
    queryService.query.mockReturnValueOnce(
      of([
        { id: '50', delay: '0', command: '0' },
        { id: '50', delay: '2', command: '1' },
        { id: '60', delay: 0, command: 15 },
      ]),
    );
    const scripts = await service.loadWaypointScripts([50, 60, 50]);
    expect(scripts.get(50)).toEqual([
      { id: 50, delay: 0, command: 0 },
      { id: 50, delay: 2, command: 1 },
    ]);
    expect(scripts.get(60)).toHaveLength(1);
    expect(queryService.query).toHaveBeenLastCalledWith(
      'SELECT id, delay, command FROM waypoint_scripts WHERE id IN (50, 60) ORDER BY id, delay',
    );
    queryService.query.mockReturnValueOnce(of(undefined));
    expect((await service.loadWaypointScripts([1])).size).toBe(0);
  });

  it('loads the SmartAI waypoint reactions of creatures, by entry and by guid', async () => {
    const { service, queryService } = setup();
    expect(await service.loadWaypointSai([])).toEqual([]);
    queryService.query.mockReturnValueOnce(
      of([
        { entryorguid: '-9', eventType: '108', point: '3', pathId: '0', actionType: '1', comment: null },
        { entryorguid: '197', eventType: '40', point: '2', pathId: '500', actionType: '1', comment: 'say' },
        { entryorguid: '197', eventType: '40', point: '0', pathId: '0', actionType: '1', comment: 'any' },
      ]),
    );
    expect(await service.loadWaypointSai([{ entry: 197, guid: 9 }])).toEqual([
      { entryorguid: -9, point: 3, pathId: 0, actionType: 1, comment: '' },
      { entryorguid: 197, point: 2, escort: true, pathId: -500, actionType: 1, comment: 'say' },
      { entryorguid: 197, point: 0, escort: true, pathId: 0, actionType: 1, comment: 'any' },
    ]);
    expect(queryService.query.mock.calls[0][0]).toContain('event_type IN (108, 40) AND entryorguid IN (197, -9)');
    queryService.query.mockReturnValueOnce(of(undefined));
    expect(await service.loadWaypointSai([{ entry: 1, guid: 2 }])).toEqual([]);
  });

  it('loads the formations and pools of spawns', async () => {
    const { service, queryService } = setup();
    expect(await service.loadFormations([])).toEqual([]);
    expect(await service.loadPools([])).toEqual([]);
    queryService.query
      .mockReturnValueOnce(of([{ leader: '1', member: '2', dist: '3', angle: '90', groupAI: '512' }]))
      .mockReturnValueOnce(of(undefined));
    expect(await service.loadFormations([1, 1.5, 2])).toEqual([{ leader: 1, member: 2, dist: 3, angle: 90, groupAI: 512 }]);
    expect(queryService.query.mock.calls[0][0]).toContain('WHERE leaderGUID IN (1, 2) OR memberGUID IN (1, 2)');
    expect(await service.loadFormations([3])).toEqual([]);

    queryService.query
      .mockReturnValueOnce(of([{ type: 'gameobject', guid: '4', pool: '7', chance: '0', maxLimit: '1', description: null }]))
      .mockReturnValueOnce(of(undefined));
    expect(
      await service.loadPools([
        { type: 'creature', guid: 1 },
        { type: 'gameobject', guid: 4 },
      ]),
    ).toEqual([{ type: 'gameobject', guid: 4, pool: 7, chance: 0, maxLimit: 1, description: '' }]);
    const sql = queryService.query.mock.calls[2][0] as string;
    expect(sql).toContain('FROM pool_creature p LEFT JOIN pool_template t ON t.entry = p.pool_entry WHERE p.guid IN (1)');
    expect(sql).toContain('UNION ALL');
    expect(sql).toContain('FROM pool_gameobject p');
    expect(await service.loadPools([{ type: 'creature', guid: 1 }])).toEqual([]);
  });

  it('loads the graveyards of a map and where area triggers teleport to', async () => {
    const { service, queryService } = setup();
    expect(await service.loadTeleports([])).toEqual([]);
    queryService.query
      .mockReturnValueOnce(of([{ id: '1', x: '1', y: '2', z: '3', comment: 'Goldshire' }]))
      .mockReturnValueOnce(of(undefined))
      .mockReturnValueOnce(of([{ id: '45', name: 'Deadmines', map: '36', x: '1', y: '2', z: '3' }]))
      .mockReturnValueOnce(of(undefined));
    expect(await service.loadGraveyards(0)).toEqual([{ id: 1, x: 1, y: 2, z: 3, comment: 'Goldshire' }]);
    expect(queryService.query.mock.calls[0][0]).toContain('FROM game_graveyard WHERE Map = 0');
    expect(await service.loadGraveyards(1)).toEqual([]);
    expect(await service.loadTeleports([45, 45])).toEqual([{ id: 45, name: 'Deadmines', map: 36, x: 1, y: 2, z: 3 }]);
    expect(queryService.query.mock.calls[2][0]).toContain('FROM areatrigger_teleport WHERE ID IN (45)');
    expect(await service.loadTeleports([46])).toEqual([]);
  });

  it("loads a spawn's columns for the properties panel", async () => {
    const { service, queryService } = setup();
    queryService.query.mockReturnValueOnce(of([{ spawntimesecs: '300', state: '1' }])).mockReturnValueOnce(of(undefined));
    expect(await service.loadSpawnFields('gameobject', 5.5)).toEqual({
      spawntimesecs: 300,
      phaseMask: 0,
      spawnMask: 0,
      state: 1,
      animprogress: 0,
    });
    expect(queryService.query.mock.calls[0][0]).toBe(
      'SELECT `spawntimesecs`, `phaseMask`, `spawnMask`, `state`, `animprogress` FROM gameobject WHERE guid = 5',
    );
    expect((await service.loadSpawnFields('creature', 7))['MovementType']).toBe(0);
  });

  it('finds spawns of a map by GUID, entry or name', async () => {
    const { service, queryService } = setup();
    expect(await service.searchSpawns(0, '  ')).toEqual([]);
    queryService.query
      .mockReturnValueOnce(of([{ type: 'creature', guid: '7', entry: '197', name: 'Marshal', x: '1', y: '2', z: '3', o: '0.5' }]))
      .mockReturnValueOnce(of(undefined));
    expect(await service.searchSpawns(0, '197')).toEqual([
      { type: 'creature', guid: 7, entry: 197, name: 'Marshal', map: 0, x: 1, y: 2, z: 3, o: 0.5, pathId: 0 },
    ]);
    expect(queryService.query.mock.calls[0][0]).toContain('(c.guid = 197 OR c.id = 197)');
    expect(queryService.query.mock.calls[0][1]).toEqual([]);
    expect(await service.searchSpawns(1, 'Marshal')).toEqual([]);
    queryService.query.mockReturnValueOnce(of([{ type: 'gameobject', guid: '8', entry: '1', name: null, x: '1', y: '2', z: '3', o: '0' }]));
    expect((await service.searchSpawns(0, 'x'))[0].name).toBe('');
    expect(queryService.query.mock.calls[1][0]).toContain('ct.name LIKE ?');
    expect(queryService.query.mock.calls[1][1]).toEqual(['%Marshal%', '%Marshal%']);
    expect(queryService.query.mock.calls[2][1]).toEqual(['%x%', '%x%']);
  });

  it('finds the creature entries of script names', async () => {
    const { service, queryService } = setup();
    expect(await service.loadScriptEntries([])).toEqual(new Map());
    queryService.query
      .mockReturnValueOnce(
        of([
          { entry: '16028', scriptName: 'boss_patchwerk' },
          { entry: '29324', scriptName: 'boss_patchwerk' },
          { entry: '15931', scriptName: 'boss_grobbulus' },
        ]),
      )
      .mockReturnValueOnce(of(undefined));
    expect(await service.loadScriptEntries(['boss_patchwerk', 'boss_grobbulus', 'boss_patchwerk'])).toEqual(
      new Map([
        ['boss_patchwerk', [16028, 29324]],
        ['boss_grobbulus', [15931]],
      ]),
    );
    expect(queryService.query).toHaveBeenLastCalledWith(
      'SELECT entry, ScriptName AS scriptName FROM creature_template WHERE ScriptName IN (?, ?)',
      ['boss_patchwerk', 'boss_grobbulus'],
    );
    expect(await service.loadScriptEntries(['x'])).toEqual(new Map());
  });

  it('reads the highest guid', async () => {
    const { service, queryService } = setup();
    queryService.getMaxId.mockReturnValueOnce(of([{ max: 5300678 }])).mockReturnValueOnce(of([]));
    expect(await service.getMaxGuid('creature')).toBe(5300678);
    expect(queryService.getMaxId).toHaveBeenCalledWith('creature', 'guid');
    expect(await service.getMaxGuid('gameobject')).toBe(0);
    expect(queryService.getMaxId).toHaveBeenCalledWith('gameobject', 'guid');
  });

  it('resolves entry names', async () => {
    const { service } = setup();
    expect(await service.getEntryName('creature', 197)).toBe('Marshal McBride');
    expect(await service.getEntryName('gameobject', 1)).toBe('Mailbox');
  });

  it('resolves the display of an entry', async () => {
    const { service, queryService } = setup();
    queryService.query.mockReturnValueOnce(of([{ displayId: '30', scale: '0.5' }]));
    expect(await service.getEntryDisplay('creature', 197.9)).toEqual({ displayId: 30, scale: 0.5 });
    expect(queryService.query).toHaveBeenLastCalledWith(
      'SELECT CreatureDisplayID AS displayId, DisplayScale AS scale FROM creature_template_model WHERE CreatureID = 197 AND Idx = 0',
    );
    queryService.query.mockReturnValueOnce(of([]));
    expect(await service.getEntryDisplay('gameobject', 5)).toEqual({ displayId: 0, scale: 1 });
    expect(queryService.query).toHaveBeenLastCalledWith('SELECT displayId, size AS scale FROM gameobject_template WHERE entry = 5');
    queryService.query.mockReturnValueOnce(of(undefined));
    expect(await service.getEntryDisplay('gameobject', 5)).toEqual({ displayId: 0, scale: 1 });
  });

  it('searches game_tele with a bound parameter', async () => {
    const { service, queryService } = setup();
    queryService.query.mockReturnValue(of([{ id: 1, name: 'Northshire', map: 0, x: 1, y: 2, z: 3 }]));
    expect(await service.searchTele("Northshire'")).toEqual([{ id: 1, name: 'Northshire', map: 0, x: 1, y: 2, z: 3 }]);
    expect(queryService.query).toHaveBeenCalledWith(expect.stringContaining('WHERE name LIKE ?'), ["%Northshire'%"]);
  });

  it('executes SQL', async () => {
    const { service, queryService } = setup();
    queryService.query.mockReturnValue(of([]));
    await service.execute('DELETE FROM creature WHERE guid = 1;');
    expect(queryService.query).toHaveBeenCalledWith('DELETE FROM creature WHERE guid = 1;');
  });

  it('picks guid * 10 for a new path when free, otherwise the highest path id + 1', async () => {
    const { service, queryService } = setup();
    queryService.query.mockReturnValueOnce(of([{ used: 0, max: 900 }]));
    expect(await service.getFreePathId(12)).toBe(120);
    expect(queryService.query.mock.calls[0][0]).toContain('WHERE id = 120');

    queryService.query.mockReturnValueOnce(of([{ used: 3, max: 900 }]));
    expect(await service.getFreePathId(12)).toBe(901);

    queryService.query.mockReturnValueOnce(of([{ used: 0, max: 900 }]));
    expect(await service.getFreePathId(12, [120, 950])).toBe(951);

    queryService.query.mockReturnValueOnce(of(undefined));
    expect(await service.getFreePathId(12)).toBe(120);
    queryService.query.mockReturnValueOnce(of([]));
    expect(await service.getFreePathId(12, [120])).toBe(121);
  });
});
