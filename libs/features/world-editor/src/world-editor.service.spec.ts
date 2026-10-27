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
              { guid: '1', entry: 197, name: 'Marshal', map: 0, x: 1, y: 2, z: 3, o: 0.5, pathId: 10, pathFromTemplate: 0 },
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
              },
            ],
      ),
    );

    const spawns = await service.loadSpawns(0, { x: -8913.4567, y: -137, z: 80 }, 100);

    expect(spawns).toEqual([
      { type: 'creature', guid: 1, entry: 197, name: 'Marshal', map: 0, x: 1, y: 2, z: 3, o: 0.5, pathId: 10, displayId: 0, scale: 1 },
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
      },
    ]);
    const creatureSql = queryService.query.mock.calls[0][0] as string;
    expect(creatureSql).toContain('c.map = 0 AND c.position_x BETWEEN -9013.46 AND -8813.46 AND c.position_y BETWEEN -237 AND -37');
    expect(creatureSql).toContain('LEFT JOIN creature_addon ca ON ca.guid = c.guid');
    expect(creatureSql).toContain('IF(ca.guid IS NOT NULL, ca.path_id, IFNULL(cta.path_id, 0)) AS pathId');
    expect(queryService.query.mock.calls[1][0]).toContain('g.rotation0, g.rotation1, g.rotation2, g.rotation3');
    expect(creatureSql).toContain('LIMIT 3000');
    expect(creatureSql).toContain('LEFT JOIN creature_template_model ctm ON ctm.CreatureID = c.id AND ctm.Idx = 0');
    expect(creatureSql).toContain('c.wander_distance AS wanderDistance, c.MovementType AS movementType');
    expect(queryService.query.mock.calls[1][0]).toContain('IFNULL(gt.displayId, 0) AS displayId, IFNULL(gt.size, 1) AS scale');
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
    expect(queryService.query.mock.calls[0][0]).toContain('WHERE id IN (10, 20) ORDER BY id, point');
    expect(queryService.query.mock.calls[0][0]).toContain('move_type AS moveType, action, action_chance AS actionChance');
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
    queryService.query.mockReturnValueOnce(of([{ entryorguid: '-9', point: '3', pathId: '0', actionType: '1', comment: null }]));
    expect(await service.loadWaypointSai([{ entry: 197, guid: 9 }])).toEqual([
      { entryorguid: -9, point: 3, pathId: 0, actionType: 1, comment: '' },
    ]);
    expect(queryService.query.mock.calls[0][0]).toContain('event_type = 108 AND entryorguid IN (197, -9)');
    queryService.query.mockReturnValueOnce(of(undefined));
    expect(await service.loadWaypointSai([{ entry: 1, guid: 2 }])).toEqual([]);
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
