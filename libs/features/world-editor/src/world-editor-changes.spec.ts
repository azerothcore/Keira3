import { gameobjectRotation, rotateGameobject, WorldEditorChanges } from './world-editor-changes';
import { SpawnRecord, WaypointRecord } from './world-editor.model';

const creature = (guid: number, extra: Partial<SpawnRecord> = {}): SpawnRecord => ({
  type: 'creature',
  guid,
  entry: 197,
  name: 'Marshal McBride',
  map: 0,
  x: 1,
  y: 2,
  z: 3,
  o: 0,
  pathId: 0,
  ...extra,
});
const gameobject = (guid: number, extra: Partial<SpawnRecord> = {}): SpawnRecord => ({
  ...creature(guid),
  type: 'gameobject',
  name: '',
  ...extra,
});
const waypoint = (pathId: number, point: number, extra: Partial<WaypointRecord> = {}): WaypointRecord => ({
  pathId,
  point,
  x: 10,
  y: 20,
  z: 30,
  delay: 0,
  ...extra,
});

describe('gameobjectRotation', () => {
  it('builds a yaw-only quaternion', () => {
    expect(gameobjectRotation(0)).toEqual({ rotation0: 0, rotation1: 0, rotation2: 0, rotation3: 1 });
    expect(gameobjectRotation(Math.PI)).toEqual({ rotation0: 0, rotation1: 0, rotation2: 1, rotation3: 0 });
  });
});

describe('rotateGameobject', () => {
  it('applies the yaw change on top of the stored rotation, keeping the tilt', () => {
    // tilted 0.2 rad around x, then turned a quarter around z
    const tilted: [number, number, number, number] = [Math.sin(0.1), 0, 0, Math.cos(0.1)];
    const turned = rotateGameobject(tilted, 0, Math.PI / 2);
    const s = Math.sin(Math.PI / 4);
    const c = Math.cos(Math.PI / 4);
    expect(turned.rotation0).toBeCloseTo(c * Math.sin(0.1), 4);
    expect(turned.rotation1).toBeCloseTo(s * Math.sin(0.1), 4);
    expect(turned.rotation2).toBeCloseTo(s * Math.cos(0.1), 4);
    expect(turned.rotation3).toBeCloseTo(c * Math.cos(0.1), 4);
  });

  it('starts from the orientation when no rotation is stored', () => {
    expect(rotateGameobject([0, 0, 0, 0], 1, 2)).toEqual(gameobjectRotation(2));
    expect(rotateGameobject(undefined, 0, Math.PI)).toEqual(gameobjectRotation(Math.PI));
  });
});

describe('WorldEditorChanges', () => {
  it('takes snapshots of every change and comes back to them', () => {
    const changes = new WorldEditorChanges();
    const empty = changes.snapshot();
    changes.placeSpawn(creature(1));
    changes.moveSpawn(creature(2), { x: 11, y: 22, z: 33, o: 1 });
    changes.deleteSpawn(gameobject(3));
    changes.createPath(1, 10);
    changes.addWaypoint(waypoint(10, 1));
    changes.moveWaypoint(waypoint(20, 1), { x: 5, y: 6, z: 7 });
    changes.deleteWaypoint(waypoint(20, 2));
    const full = changes.snapshot();
    const sql = changes.toSql();

    changes.restore(empty);
    expect(changes.count).toBe(0);
    changes.restore(full);
    expect(changes.count).toBe(7);
    expect(changes.toSql()).toBe(sql);
    // snapshots are copies: changing the state later doesn't alter them
    changes.clear();
    changes.restore(full);
    expect(changes.toSql()).toBe(sql);
  });

  it('starts empty', () => {
    const changes = new WorldEditorChanges();
    expect(changes.count).toBe(0);
    expect(changes.toSql()).toBe('');
    expect(changes.describe()).toEqual([]);
  });

  describe('spawns', () => {
    it('inserts placed creatures with the default spawn values', () => {
      const changes = new WorldEditorChanges();
      changes.placeSpawn(creature(100, { x: -8913.123456, y: -137.5, z: 82.25, o: 1.5 }));
      expect(changes.isNewSpawn('creature:100')).toBe(true);
      expect(changes.count).toBe(1);
      expect(changes.describe()).toEqual(['Place creature 100 (Marshal McBride)']);
      expect(changes.toSql()).toBe(
        'DELETE FROM `creature` WHERE (`guid` = 100);\n' +
          'INSERT INTO `creature` (`guid`, `id`, `map`, `zoneId`, `areaId`, `spawnMask`, `phaseMask`, `equipment_id`, `position_x`, `position_y`, ' +
          '`position_z`, `orientation`, `spawntimesecs`, `wander_distance`, `currentwaypoint`, `curhealth`, `curmana`, `MovementType`, `npcflag`, ' +
          "`unit_flags`, `dynamicflags`, `ScriptName`, `Comment`, `VerifiedBuild`) VALUES (100, 197, 0, 0, 0, 1, 1, 0, -8913.1235, -137.5, 82.25, 1.5, 300, 0, 0, 1, 0, 0, 0, 0, 0, '', '', 0);",
      );
    });

    it('inserts placed gameobjects with their rotation', () => {
      const changes = new WorldEditorChanges();
      changes.placeSpawn(gameobject(5, { o: Math.PI }));
      expect(changes.describe()).toEqual(['Place gameobject 5']);
      expect(changes.toSql()).toContain('INSERT INTO `gameobject`');
      // orientation, rotation0..3, spawntimesecs, animprogress, state (GO_STATE_READY)
      expect(changes.toSql()).toContain('3.1416, 0, 0, 1, 0, 300, 0, 1,');
    });

    it('keeps the tilt of a copied gameobject, also when it is turned', () => {
      const changes = new WorldEditorChanges();
      const tilted = gameobject(5, { o: 0, rotation: [0.5, 0, 0, 0.8660254] });
      changes.placeSpawn(tilted);
      expect(changes.toSql()).toContain('0, 0.5, 0, 0, 0.8660254, 300');
      changes.moveSpawn(tilted, { x: 1, y: 2, z: 3, o: 0 });
      expect(changes.toSql()).toContain('0, 0.5, 0, 0, 0.8660254, 300');
      changes.moveSpawn(tilted, { x: 1, y: 2, z: 3, o: Math.PI });
      expect(changes.toSql()).not.toContain('0, 0.5, 0, 0, 0.8660254, 300');
      expect(changes.applyToSpawns([], 0)[0].rotation).toEqual([
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
      ]);
    });

    it('updates the insert when a new spawn is moved, and drops it when deleted', () => {
      const changes = new WorldEditorChanges();
      changes.placeSpawn(creature(100));
      changes.createPath(100, 1000);
      changes.moveSpawn(creature(100), { x: 7, y: 8, z: 9, o: 1 });
      expect(changes.applyToSpawns([], 0)).toEqual([creature(100, { x: 7, y: 8, z: 9, o: 1, pathId: 1000 })]);

      changes.deleteSpawn(creature(100));
      expect(changes.count).toBe(0);
    });

    it('only rewrites a moved gameobject rotation when its orientation changed', () => {
      const changes = new WorldEditorChanges();
      changes.moveSpawn(gameobject(5, { rotation: [0.1, 0, 0, 0.995] }), { x: 4, y: 5, z: 6, o: 0 });
      expect(changes.toSql()).toBe(
        'UPDATE `gameobject` SET `position_x` = 4, `position_y` = 5, `position_z` = 6, `orientation` = 0 WHERE (`guid` = 5);',
      );
    });

    it('updates moved spawns, keeping the original until moved back', () => {
      const changes = new WorldEditorChanges();
      changes.moveSpawn(gameobject(5), { x: 4, y: 5, z: 6, o: Math.PI });
      changes.moveSpawn(gameobject(5, { x: 4 }), { x: 4.5, y: 5, z: 6, o: Math.PI });
      expect(changes.describe()).toEqual(['Move gameobject 5']);
      expect(changes.toSql()).toBe(
        'UPDATE `gameobject` SET `position_x` = 4.5, `position_y` = 5, `position_z` = 6, `orientation` = 3.1416, `rotation0` = 0, `rotation1` = 0, `rotation2` = 1, `rotation3` = 0 WHERE (`guid` = 5);',
      );

      changes.moveSpawn(gameobject(5, { x: 4.5 }), { x: 1, y: 2, z: 3, o: 0 });
      expect(changes.count).toBe(0);
    });

    it('drops the waypoints queued for the new path of a deleted creature', () => {
      const changes = new WorldEditorChanges();
      changes.placeSpawn(creature(100));
      changes.createPath(100, 1000);
      changes.addWaypoint(waypoint(1000, 1));
      changes.addWaypoint(waypoint(80, 1));
      changes.deleteSpawn(creature(100));
      expect(changes.describe()).toEqual(['Add waypoint 80 #1']);
    });

    it('deletes spawns (and their related rows, like the server does) using the original data', () => {
      const changes = new WorldEditorChanges();
      changes.moveSpawn(creature(7), { x: 9, y: 9, z: 9, o: 0 });
      changes.createPath(7, 70);
      changes.deleteSpawn(creature(7, { x: 9 }));
      changes.deleteSpawn(gameobject(8));
      expect(changes.describe()).toEqual(['Delete creature 7 (Marshal McBride)', 'Delete gameobject 8']);
      expect(changes.toSql().split('\n')).toEqual([
        'DELETE FROM `creature` WHERE (`guid` = 7);',
        'DELETE FROM `creature_addon` WHERE (`guid` = 7);',
        'DELETE FROM `creature_multispawn` WHERE (`spawnId` = 7);',
        'DELETE FROM `game_event_creature` WHERE (`guid` = 7);',
        'DELETE FROM `game_event_model_equip` WHERE (`guid` = 7);',
        'DELETE FROM `gameobject` WHERE (`guid` = 8);',
        'DELETE FROM `gameobject_addon` WHERE (`guid` = 8);',
        'DELETE FROM `game_event_gameobject` WHERE (`guid` = 8);',
      ]);
    });

    it('applies pending edits to loaded spawns', () => {
      const changes = new WorldEditorChanges();
      changes.deleteSpawn(creature(1));
      changes.moveSpawn(creature(2), { x: 50, y: 60, z: 70, o: 1 });
      changes.createPath(3, 30);
      changes.placeSpawn(creature(4));
      changes.placeSpawn(creature(5, { map: 1 }));

      const loaded = [creature(1), creature(2), creature(3), creature(4, { name: 'stale' }), gameobject(6)];
      expect(changes.applyToSpawns(loaded, 0)).toEqual([
        creature(2, { x: 50, y: 60, z: 70, o: 1 }),
        creature(3, { pathId: 30 }),
        gameobject(6),
        creature(4),
      ]);
    });
  });

  describe('paths & waypoints', () => {
    it('creates paths for creatures', () => {
      const changes = new WorldEditorChanges();
      changes.createPath(7, 70);
      expect(changes.describe()).toEqual(['Create path 70 for creature 7']);
      expect(changes.toSql().split('\n')).toEqual([
        'INSERT INTO `creature_addon` (`guid`, `path_id`) VALUES (7, 70) ON DUPLICATE KEY UPDATE `path_id` = 70;',
        'UPDATE `creature` SET `MovementType` = 2 WHERE (`guid` = 7);',
      ]);
    });

    it('inserts added waypoints, and updates them when moved', () => {
      const changes = new WorldEditorChanges();
      changes.addWaypoint(waypoint(70, 1));
      changes.moveWaypoint(waypoint(70, 1), { x: 1, y: 2, z: 3 });
      expect(changes.describe()).toEqual(['Add waypoint 70 #1']);
      expect(changes.toSql()).toBe(
        'DELETE FROM `waypoint_data` WHERE (`id` = 70) AND (`point` = 1);\n' +
          'INSERT INTO `waypoint_data` (`id`, `point`, `position_x`, `position_y`, `position_z`, `delay`) VALUES (70, 1, 1, 2, 3, 0);',
      );
    });

    it('writes SmartAI path points to `waypoints` (entry, pointid)', () => {
      const changes = new WorldEditorChanges();
      const point = { pathId: -500, point: 1, x: 1, y: 2, z: 3, delay: 0 };
      changes.addWaypoint({ ...point, point: 2 });
      changes.moveWaypoint(point, { x: 4, y: 5, z: 6 });
      changes.deleteWaypoint({ ...point, point: 3 });
      expect(changes.describe()).toEqual(['Delete waypoint SmartAI 500 #3', 'Add waypoint SmartAI 500 #2', 'Move waypoint SmartAI 500 #1']);
      const sql = changes.toSql();
      expect(sql).toContain('DELETE FROM `waypoints` WHERE (`entry` = 500) AND (`pointid` = 3);');
      expect(sql).toContain(
        'INSERT INTO `waypoints` (`entry`, `pointid`, `position_x`, `position_y`, `position_z`, `delay`) VALUES (500, 2, 1, 2, 3, 0);',
      );
      expect(sql).toContain(
        'UPDATE `waypoints` SET `position_x` = 4, `position_y` = 5, `position_z` = 6 WHERE (`entry` = 500) AND (`pointid` = 1);',
      );
      expect(sql).not.toContain('waypoint_data');
    });

    it('updates moved waypoints until moved back', () => {
      const changes = new WorldEditorChanges();
      changes.moveWaypoint(waypoint(80, 2), { x: 9, y: 8, z: 7 });
      changes.moveWaypoint(waypoint(80, 2, { x: 9 }), { x: 9, y: 8, z: 6 });
      expect(changes.describe()).toEqual(['Move waypoint 80 #2']);
      expect(changes.toSql()).toBe(
        'UPDATE `waypoint_data` SET `position_x` = 9, `position_y` = 8, `position_z` = 6 WHERE (`id` = 80) AND (`point` = 2);',
      );

      changes.moveWaypoint(waypoint(80, 2), { x: 10, y: 20, z: 30 });
      expect(changes.count).toBe(0);
    });

    it('deletes waypoints, dropping new ones and using the original of moved ones', () => {
      const changes = new WorldEditorChanges();
      changes.addWaypoint(waypoint(70, 1));
      changes.deleteWaypoint(waypoint(70, 1));
      expect(changes.count).toBe(0);

      changes.moveWaypoint(waypoint(80, 3), { x: 1, y: 1, z: 1 });
      changes.deleteWaypoint(waypoint(80, 3, { x: 1 }));
      expect(changes.describe()).toEqual(['Delete waypoint 80 #3']);
      expect(changes.toSql()).toBe('DELETE FROM `waypoint_data` WHERE (`id` = 80) AND (`point` = 3);');
    });

    it('turns re-adding a deleted waypoint into a move', () => {
      const changes = new WorldEditorChanges();
      changes.deleteWaypoint(waypoint(80, 3));
      changes.addWaypoint(waypoint(80, 3, { x: 99 }));
      expect(changes.describe()).toEqual(['Move waypoint 80 #3']);
    });

    it('applies pending edits to loaded waypoints, sorted', () => {
      const changes = new WorldEditorChanges();
      changes.deleteWaypoint(waypoint(80, 1));
      changes.moveWaypoint(waypoint(80, 2), { x: 0, y: 0, z: 0 });
      changes.addWaypoint(waypoint(70, 5));
      changes.addWaypoint(waypoint(90, 1));
      const loaded = [waypoint(80, 3), waypoint(80, 1), waypoint(80, 2)];
      expect(changes.applyToWaypoints(loaded, [70, 80])).toEqual([waypoint(70, 5), waypoint(80, 2, { x: 0, y: 0, z: 0 }), waypoint(80, 3)]);
    });
  });

  it('orders statements: deletes, inserts, updates, paths, then waypoints', () => {
    const changes = new WorldEditorChanges();
    changes.addWaypoint(waypoint(70, 1));
    changes.createPath(9, 90);
    changes.moveSpawn(creature(2), { x: 0, y: 0, z: 0, o: 0 });
    changes.placeSpawn(creature(3));
    changes.deleteSpawn(creature(4));
    changes.deleteWaypoint(waypoint(80, 1));
    changes.moveWaypoint(waypoint(80, 2), { x: 0, y: 0, z: 0 });
    const kinds = changes
      .toSql()
      .split('\n')
      .map((line) => line.split(' ').slice(0, 3).join(' '));
    expect(kinds).toEqual([
      'DELETE FROM `creature`',
      'DELETE FROM `creature_addon`',
      'DELETE FROM `creature_multispawn`',
      'DELETE FROM `game_event_creature`',
      'DELETE FROM `game_event_model_equip`',
      'DELETE FROM `creature`',
      'INSERT INTO `creature`',
      'UPDATE `creature` SET',
      'INSERT INTO `creature_addon`',
      'UPDATE `creature` SET',
      'DELETE FROM `waypoint_data`',
      'DELETE FROM `waypoint_data`',
      'INSERT INTO `waypoint_data`',
      'UPDATE `waypoint_data` SET',
    ]);
    expect(changes.count).toBe(7);
    changes.clear();
    expect(changes.count).toBe(0);
  });
});
