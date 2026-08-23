import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SmartScripts } from '@keira/shared/acore-world-model';
import { ConfigService } from '@keira/shared/common-services';
import { MaxRow, TableRow } from '@keira/shared/constants';
import { lastValueFrom, of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { MysqlService } from '../mysql.service';
import { MysqlQueryService } from './mysql-query.service';

interface MockRow extends TableRow {
  entry: number;
  name: string;
  subname: string;
  attribute1: number;
  attribute2: number;
}

interface MockTwoKeysRow extends TableRow {
  pk1: number;
  pk2: number;
  name: string;
  attribute1: number;
  attribute2: number;
}

// Mirrors creature_text: `pk2` groups several rows that are told apart by `pk3`.
interface MockThreeKeysRow extends TableRow {
  pk1: number;
  pk2: number;
  pk3: number;
  name: string;
}

interface MockTwoKeysComplexRow extends TableRow {
  pk11: number;
  pk12: number;
  pk2: number;
  name: string;
  attribute1: number;
  attribute2: number;
}

describe('MysqlQueryService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlService, useValue: instance(mock(MysqlService)) },
      ],
    }),
  );

  function setup() {
    const configService = TestBed.inject(ConfigService);
    const service = TestBed.inject(MysqlQueryService);
    return { service, configService };
  }

  it('query() should call mysqlService.dbQuery() and output query and results if debug mode is enabled', () => {
    const { service, configService } = setup();
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    configService.debugMode.set(true);
    const querySpy = vi.spyOn(TestBed.inject(MysqlService), 'dbQuery').mockReturnValue(of({ id: 'mock value' } as TableRow));
    const myQuery = 'SELECT azerothcore FROM projects;';

    service.query(myQuery).subscribe(() => {
      expect(infoSpy).toHaveBeenCalledTimes(2);
    });

    expect(querySpy).toHaveBeenCalledWith(myQuery, undefined);
  });

  it('query() should call mysqlService.dbQuery() and not output anything if debug mode is disabled', () => {
    const { service, configService } = setup();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    configService.debugMode.set(false);
    const querySpy = vi.spyOn(TestBed.inject(MysqlService), 'dbQuery').mockReturnValue(of(undefined as any));
    const myQuery = 'SELECT azerothcore FROM projects;';

    service.query(myQuery).subscribe(() => {
      expect(logSpy).toHaveBeenCalledTimes(0);
    });

    expect(querySpy).toHaveBeenCalledWith(myQuery, undefined);
  });

  it('selectAll() should correctly work', () => {
    const { service } = setup();
    const data: TableRow[] = [{ key: 'value' }];
    const querySpy = vi.spyOn(service, 'query').mockReturnValue(of(data));

    service.selectAll('my_ac', 'param', 'value').subscribe((res) => {
      expect(res).toEqual(data);
    });

    expect(querySpy).toHaveBeenCalledWith('SELECT * ' + 'FROM `my_ac` WHERE (param = value)');
  });

  it('selectAllMultipleKeys() should correctly work', () => {
    const { service } = setup();
    const data: TableRow[] = [{ key: 'value' }];
    const querySpy = vi.spyOn(service, 'query').mockReturnValue(of(data));
    const row: TableRow = { k1: 1, k2: 2 };

    service.selectAllMultipleKeys('my_ac', row).subscribe((res) => {
      expect(res).toEqual(data);
    });

    expect(querySpy).toHaveBeenCalledWith('SELECT * ' + 'FROM `my_ac` WHERE (k1 = 1) AND (k2 = 2)');
  });

  it('getMaxId() should correctly work', () => {
    const { service } = setup();
    const data: MaxRow[] = [{ max: 123 }];
    const querySpy = vi.spyOn(service, 'query').mockReturnValue(of());

    service.getMaxId('my_ac', 'param').subscribe((res) => {
      expect(res).toEqual(data);
    });

    expect(querySpy).toHaveBeenCalledWith('SELECT MAX(param) AS max ' + 'FROM my_ac;');
  });

  it('getTimedActionlists() should correctly work', () => {
    const { service } = setup();
    const id = 1234;
    const data: SmartScripts[] = [{ entryorguid: 1111 } as SmartScripts];
    const querySpy = vi.spyOn(service, 'query').mockReturnValue(of(data));

    service.getTimedActionlists(id).subscribe((res) => {
      expect(res).toEqual(data);
    });

    expect(querySpy).toHaveBeenCalledWith(
      `SELECT * FROM smart_scripts WHERE source_type = 9 AND entryorguid >= ${id * 100} AND entryorguid < ${id * 100 + 100}`,
    );
  });

  it('getCreatureSpawnsByEntry() should correctly work', () => {
    const { service } = setup();
    const data = [{ mapId: 0, x: 1, y: 2, orientation: 0, guid: 5 }];
    const querySpy = vi.spyOn(service, 'query').mockReturnValue(of(data));

    service.getCreatureSpawnsByEntry(123).then((res) => {
      expect(res).toEqual(data);
    });

    expect(querySpy).toHaveBeenCalledWith(
      'SELECT map AS mapId, position_x AS x, position_y AS y, orientation, guid FROM creature WHERE id = 123',
    );
  });

  it('getGameObjectSpawnsByEntry() should correctly work', () => {
    const { service } = setup();
    const data = [{ mapId: 0, x: 1, y: 2, orientation: 0, guid: 5 }];
    const querySpy = vi.spyOn(service, 'query').mockReturnValue(of(data));

    service.getGameObjectSpawnsByEntry(123).then((res) => {
      expect(res).toEqual(data);
    });

    expect(querySpy).toHaveBeenCalledWith(
      'SELECT map AS mapId, position_x AS x, position_y AS y, rotation0 AS orientation, guid FROM gameobject WHERE id = 123',
    );
  });

  it('getCreaturesDroppingItem() should correctly work', () => {
    const { service } = setup();
    const data = [{ entry: 456 }];
    const querySpy = vi.spyOn(service, 'query').mockReturnValue(of(data));

    service.getCreaturesDroppingItem(789).then((res) => {
      expect(res).toEqual(data);
    });

    expect(querySpy).toHaveBeenCalledWith(
      `SELECT DISTINCT ct.entry AS entry FROM creature_template AS ct
       INNER JOIN creature_loot_template AS clt ON clt.Entry = ct.lootid
       WHERE ct.lootid > 0 AND clt.Item = 789 LIMIT 2`,
    );
  });

  it('getGameObjectsDroppingItem() should correctly work', () => {
    const { service } = setup();
    const data = [{ entry: 456 }];
    const querySpy = vi.spyOn(service, 'query').mockReturnValue(of(data));

    service.getGameObjectsDroppingItem(789).then((res) => {
      expect(res).toEqual(data);
    });

    expect(querySpy).toHaveBeenCalledWith(
      `SELECT DISTINCT gt.entry AS entry FROM gameobject_template AS gt
       INNER JOIN gameobject_loot_template AS glt ON glt.Entry = gt.Data1
       WHERE gt.Data1 > 0 AND glt.Item = 789 LIMIT 2`,
    );
  });

  describe('getQuestChainRelations()', () => {
    it('should match a quest by id, by either sign of PrevQuestID, and by breadcrumb', () => {
      const { service } = setup();
      const querySpy = vi.spyOn(service, 'query').mockReturnValue(of([]));

      service.getQuestChainRelations([1, 2]);

      expect(querySpy).toHaveBeenCalledWith(
        `SELECT ID, PrevQuestID, NextQuestID, ExclusiveGroup, BreadcrumbForQuestId
       FROM quest_template_addon WHERE ID IN (1,2) OR PrevQuestID IN (1,2,-1,-2) OR NextQuestID IN (1,2) OR BreadcrumbForQuestId IN (1,2)`,
      );
    });

    it('should add the exclusive group condition only when groups are given', () => {
      const { service } = setup();
      const querySpy = vi.spyOn(service, 'query').mockReturnValue(of([]));

      service.getQuestChainRelations([1], [77]);

      expect(querySpy.mock.calls[0][0]).toContain('OR ExclusiveGroup IN (77)');
    });

    it('should render an empty id list as NULL so the query stays valid', () => {
      const { service } = setup();
      const querySpy = vi.spyOn(service, 'query').mockReturnValue(of([]));

      service.getQuestChainRelations([], [5]);

      expect(querySpy.mock.calls[0][0]).toContain('ID IN (NULL)');
    });

    it('should drop values that are not numbers', () => {
      const { service } = setup();
      const querySpy = vi.spyOn(service, 'query').mockReturnValue(of([]));

      service.getQuestChainRelations([1, 'oops' as unknown as number]);

      expect(querySpy.mock.calls[0][0]).toContain('ID IN (1)');
    });

    it('should cache by id and group list', async () => {
      const { service } = setup();
      vi.spyOn(service, 'query').mockReturnValue(of([]));

      expect(await service.getQuestChainRelations([1])).toEqual([]);
      expect(await service.getQuestChainRelations([1])).toEqual([]);
      expect(service.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('getQuestConditionPrerequisites()', () => {
    it('should match quest prerequisites in both directions, ignoring negated and non-quest conditions', async () => {
      const { service } = setup();
      const data = [{ SourceEntry: 13139, ElseGroup: 0, ConditionValue1: 13125 }];
      const querySpy = vi.spyOn(service, 'query').mockReturnValue(of(data));

      expect(await service.getQuestConditionPrerequisites([13139])).toEqual(data);
      expect(querySpy).toHaveBeenCalledWith(
        `SELECT SourceEntry, ElseGroup, ConditionValue1 FROM conditions
       WHERE SourceTypeOrReferenceId = 19
       AND ConditionTypeOrReference IN (8,9,28)
       AND NegativeCondition = 0 AND ConditionValue1 > 0
       AND (SourceEntry IN (13139) OR ConditionValue1 IN (13139))`,
      );
    });

    it('should render an empty id list as NULL so the query stays valid', () => {
      const { service } = setup();
      const querySpy = vi.spyOn(service, 'query').mockReturnValue(of([]));

      service.getQuestConditionPrerequisites([]);

      expect(querySpy.mock.calls[0][0]).toContain('SourceEntry IN (NULL)');
    });
  });

  it('getQuestConditionCounts() should count only quest-availability conditions', async () => {
    const { service } = setup();
    const data = [{ SourceEntry: 13117, conditionCount: 2 }];
    const querySpy = vi.spyOn(service, 'query').mockReturnValue(of(data));

    expect(await service.getQuestConditionCounts([13117, 13119])).toEqual(data);
    expect(querySpy).toHaveBeenCalledWith(
      `SELECT SourceEntry, COUNT(*) AS conditionCount FROM conditions
       WHERE SourceTypeOrReferenceId = 19 AND SourceEntry IN (13117,13119) GROUP BY SourceEntry`,
    );
  });

  it('getSmartEventConditionCounts() should scope to the script and its source type', async () => {
    const { service } = setup();
    const data = [{ SourceGroup: 3, conditionCount: 1 }];
    const querySpy = vi.spyOn(service, 'query').mockReturnValue(of(data));

    expect(await service.getSmartEventConditionCounts(-141234, 0)).toEqual(data);
    expect(querySpy).toHaveBeenCalledWith(
      `SELECT SourceGroup, COUNT(*) AS conditionCount FROM conditions
       WHERE SourceTypeOrReferenceId = 22 AND SourceEntry = -141234 AND SourceId = 0
       GROUP BY SourceGroup`,
    );
  });

  it('getQuestTitlesByIds() should correctly work', async () => {
    const { service } = setup();
    const data = [{ ID: 1, LogTitle: 'Quest 1' }];
    const querySpy = vi.spyOn(service, 'query').mockReturnValue(of(data));

    expect(await service.getQuestTitlesByIds([1, 2])).toEqual(data);
    expect(querySpy).toHaveBeenCalledWith('SELECT ID, LogTitle FROM quest_template WHERE ID IN (1,2)');
  });

  it('getQuestRelationEntries() should correctly work', () => {
    const { service } = setup();
    const data = [{ id: 123 }];
    const querySpy = vi.spyOn(service, 'query').mockReturnValue(of(data));

    service.getQuestRelationEntries('creature_queststarter', 456).then((res) => {
      expect(res).toEqual(data);
    });

    expect(querySpy).toHaveBeenCalledWith('SELECT id FROM creature_queststarter WHERE quest = 456');
  });

  it('getTables() should correctly work', () => {
    const { service } = setup();
    const data: TableRow[] = [{ Tables_in_acore_world: 'creature_template' }];
    const querySpy = vi.spyOn(service, 'query').mockReturnValue(of(data));

    service.getTables().subscribe((res) => {
      expect(res).toEqual(data);
    });

    expect(querySpy).toHaveBeenCalledWith('SHOW TABLES');
  });

  it('getColumns() should correctly work', () => {
    const { service } = setup();
    const data: TableRow[] = [{ Field: 'entry' }];
    const querySpy = vi.spyOn(service, 'query').mockReturnValue(of(data));

    service.getColumns('creature_template').subscribe((res) => {
      expect(res).toEqual(data);
    });

    expect(querySpy).toHaveBeenCalledWith('SHOW COLUMNS FROM `creature_template`');
  });

  describe('getBroadcastTextSearchQuery()', () => {
    it('should match the text against both gendered wordings', () => {
      const { service } = setup();

      expect(service.getBroadcastTextSearchQuery('hello', 50)).toBe(
        "SELECT * FROM `broadcast_text` WHERE (`MaleText` LIKE '%hello%' OR `FemaleText` LIKE '%hello%') LIMIT 50",
      );
    });

    it('should escape the searched text', () => {
      const { service } = setup();

      expect(service.getBroadcastTextSearchQuery("it's", 50)).toBe(
        "SELECT * FROM `broadcast_text` WHERE (`MaleText` LIKE '%it\\'s%' OR `FemaleText` LIKE '%it\\'s%') LIMIT 50",
      );
    });

    it('should keep a question mark intact', () => {
      const { service } = setup();

      // squel reads a bare `?` in a raw condition as a placeholder, and NPC dialogue is full of them.
      expect(service.getBroadcastTextSearchQuery('Who dares?', 50)).toBe(
        "SELECT * FROM `broadcast_text` WHERE (`MaleText` LIKE '%Who dares?%' OR `FemaleText` LIKE '%Who dares?%') LIMIT 50",
      );
    });

    it('should leave the result unlimited when no limit is given', () => {
      const { service } = setup();

      expect(service.getBroadcastTextSearchQuery('hello', undefined)).toBe(
        "SELECT * FROM `broadcast_text` WHERE (`MaleText` LIKE '%hello%' OR `FemaleText` LIKE '%hello%')",
      );
    });
  });

  it('getBroadcastTextAdjacentQuery() should span the ids on both sides of the given one', () => {
    const { service } = setup();

    expect(service.getBroadcastTextAdjacentQuery(25, 5)).toBe(
      'SELECT * FROM `broadcast_text` WHERE (`ID` BETWEEN 20 AND 30) ORDER BY ID ASC',
    );
  });

  describe('Query builders', () => {
    const tableName = 'my_table';

    describe('getUpdateQuery', () => {
      const primaryKey = 'entry';
      const currentRow: MockRow = { entry: 1234, name: 'Shin', subname: 'AC-Dev', attribute1: 25, attribute2: 4 };

      it('should return empty string when there are no differences', () => {
        const { service } = setup();
        expect(service.getUpdateQuery(tableName, primaryKey, currentRow, currentRow)).toEqual('');
      });

      it('should correctly generate queries', () => {
        const { service } = setup();
        for (const { newRow, expectedQuery } of [
          {
            newRow: { entry: 1234, name: 'Helias', subname: 'AC-Dev', attribute1: 25, attribute2: 4 },
            expectedQuery: "UPDATE `my_table` SET `name` = 'Helias' WHERE (`entry` = 1234);",
          },
          {
            newRow: { entry: 1234, name: 'Shin', subname: 'AC-Web-Dev', attribute1: 25, attribute2: 14 },
            expectedQuery: "UPDATE `my_table` SET `subname` = 'AC-Web-Dev', `attribute2` = 14 WHERE (`entry` = 1234);",
          },
          {
            newRow: { entry: 1234, name: 'Helias', subname: 'AC-Web-Dev', attribute1: 25, attribute2: 14 },
            expectedQuery: "UPDATE `my_table` SET `name` = 'Helias', `subname` = 'AC-Web-Dev', `attribute2` = 14 WHERE (`entry` = 1234);",
          },
        ]) {
          expect(service.getUpdateQuery(tableName, primaryKey, currentRow, newRow)).toEqual(expectedQuery);
        }
      });
    });

    describe('getDiffDeleteInsertTwoKeysQuery', () => {
      const primaryKey1 = 'pk1';
      const primaryKey2 = 'pk2';

      const myRows: MockTwoKeysRow[] = [
        { pk1: 1234, pk2: 1, name: 'Shin', attribute1: 28, attribute2: 4 },
        { pk1: 1234, pk2: 2, name: 'Helias', attribute1: 12, attribute2: 4 },
        { pk1: 1234, pk2: 3, name: 'Kalhac', attribute1: 12, attribute2: 4 },
      ];

      it('should return empty string if currentRows or newRows are null', () => {
        const { service } = setup();
        expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, undefined, [])).toEqual('');
        expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, [], undefined)).toEqual('');
      });

      it('should return empty string if currentRows or newRows are null', () => {
        const { service } = setup();
        expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, [], [])).toEqual('');
      });

      it('should correctly work when there are no changes', () => {
        const { service } = setup();
        expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, myRows, myRows)).toEqual('');
      });

      describe('using both keys', () => {
        it('should correctly work when all rows are deleted', () => {
          const { service } = setup();
          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, myRows, [])).toEqual(
            'DELETE FROM `my_table` WHERE `pk1` = 1234;\n',
          );
        });

        it('should correctly work when adding new rows to an empty set', () => {
          const { service } = setup();
          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, [], myRows)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk1` = 1234) AND (`pk2` IN (1, 2, 3));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 1, 'Shin', 28, 4),\n" +
              "(1234, 2, 'Helias', 12, 4),\n" +
              "(1234, 3, 'Kalhac', 12, 4);\n",
          );
        });

        it('should correctly work when editing rows', () => {
          const { service } = setup();
          const newRows = myRows.map((x) => Object.assign({}, x));
          newRows[1].name = 'Helias2';
          newRows[2].name = 'Kalhac2';

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, myRows, newRows)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk1` = 1234) AND (`pk2` IN (2, 3));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 2, 'Helias2', 12, 4),\n" +
              "(1234, 3, 'Kalhac2', 12, 4);\n",
          );
        });

        it('should correctly work when adding rows', () => {
          const { service } = setup();
          const newRows = myRows.map((x) => Object.assign({}, x));
          newRows.push({ pk1: 1234, pk2: 4, name: 'Yehonal', attribute1: 99, attribute2: 0 });
          newRows.push({ pk1: 1234, pk2: 5, name: 'Barbz', attribute1: 68, attribute2: 1 });

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, myRows, newRows)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk1` = 1234) AND (`pk2` IN (4, 5));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 4, 'Yehonal', 99, 0),\n" +
              "(1234, 5, 'Barbz', 68, 1);\n",
          );
        });

        it('should correctly work when removing rows', () => {
          const { service } = setup();
          const newRows = [{ ...myRows[0] }, { ...myRows[2] }];

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, myRows, newRows)).toEqual(
            'DELETE' + ' FROM `my_table` WHERE (`pk1` = 1234) AND (`pk2` IN (2));\n',
          );
        });

        it('should correctly work when removing, editing and adding rows all together', () => {
          const { service } = setup();
          const newRows = [{ ...myRows[0] }, { ...myRows[2] }];
          newRows[1].name = 'Kalhac2';
          newRows.push({ pk1: 1234, pk2: 4, name: 'Yehonal', attribute1: 99, attribute2: 0 });

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, myRows, newRows)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk1` = 1234) AND (`pk2` IN (2, 3, 4));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 3, 'Kalhac2', 12, 4),\n" +
              "(1234, 4, 'Yehonal', 99, 0);\n",
          );
        });
      });

      describe('using an extra id field (the secondary key groups several rows)', () => {
        const primaryKey3 = 'pk3';

        // Two groups of two rows each.
        const groupedRows: MockThreeKeysRow[] = [
          { pk1: 1234, pk2: 0, pk3: 0, name: 'g0v0' },
          { pk1: 1234, pk2: 0, pk3: 1, name: 'g0v1' },
          { pk1: 1234, pk2: 1, pk3: 0, name: 'g1v0' },
          { pk1: 1234, pk2: 1, pk3: 1, name: 'g1v1' },
        ];

        it('should not report a change when nothing changed', () => {
          const { service } = setup();
          expect(
            service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, groupedRows, groupedRows, primaryKey3),
          ).toEqual('');
        });

        it('should rewrite the whole group when one of its rows is edited', () => {
          const { service } = setup();
          const newRows = groupedRows.map((row) => ({ ...row }));
          newRows[1].name = 'EDITED';

          // Only group 0 is listed, once, and both of its rows come back - not just the edited one.
          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, groupedRows, newRows, primaryKey3)).toEqual(
            'DELETE FROM `my_table` WHERE (`pk1` = 1234) AND (`pk2` IN (0));\n' +
              'INSERT INTO `my_table` (`pk1`, `pk2`, `pk3`, `name`) VALUES\n' +
              "(1234, 0, 0, 'g0v0'),\n" +
              "(1234, 0, 1, 'EDITED');\n",
          );
        });

        it('should leave the other groups alone', () => {
          const { service } = setup();
          const newRows = groupedRows.map((row) => ({ ...row }));
          newRows[3].name = 'EDITED';

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, groupedRows, newRows, primaryKey3)).toEqual(
            'DELETE FROM `my_table` WHERE (`pk1` = 1234) AND (`pk2` IN (1));\n' +
              'INSERT INTO `my_table` (`pk1`, `pk2`, `pk3`, `name`) VALUES\n' +
              "(1234, 1, 0, 'g1v0'),\n" +
              "(1234, 1, 1, 'EDITED');\n",
          );
        });

        it('should keep the surviving rows when one row of a group is deleted', () => {
          const { service } = setup();
          const newRows = [groupedRows[0], groupedRows[2], groupedRows[3]].map((row) => ({ ...row }));

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, groupedRows, newRows, primaryKey3)).toEqual(
            'DELETE FROM `my_table` WHERE (`pk1` = 1234) AND (`pk2` IN (0));\n' +
              'INSERT INTO `my_table` (`pk1`, `pk2`, `pk3`, `name`) VALUES\n' +
              "(1234, 0, 0, 'g0v0');\n",
          );
        });

        it('should only emit a DELETE when a whole group is removed', () => {
          const { service } = setup();
          const newRows = [groupedRows[2], groupedRows[3]].map((row) => ({ ...row }));

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, groupedRows, newRows, primaryKey3)).toEqual(
            'DELETE FROM `my_table` WHERE (`pk1` = 1234) AND (`pk2` IN (0));\n',
          );
        });

        it('should rewrite the group when a row is added to it', () => {
          const { service } = setup();
          const newRows = groupedRows.map((row) => ({ ...row }));
          newRows.push({ pk1: 1234, pk2: 0, pk3: 2, name: 'g0v2' });

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, groupedRows, newRows, primaryKey3)).toEqual(
            'DELETE FROM `my_table` WHERE (`pk1` = 1234) AND (`pk2` IN (0));\n' +
              'INSERT INTO `my_table` (`pk1`, `pk2`, `pk3`, `name`) VALUES\n' +
              "(1234, 0, 0, 'g0v0'),\n" +
              "(1234, 0, 1, 'g0v1'),\n" +
              "(1234, 0, 2, 'g0v2');\n",
          );
        });

        it('should handle an edit, a deletion and an addition across groups at once', () => {
          const { service } = setup();
          // group 0: row pk3=1 deleted; group 1: row pk3=0 edited and a new pk3=2 added.
          const newRows: MockThreeKeysRow[] = [
            { ...groupedRows[0] },
            { ...groupedRows[2], name: 'EDITED' },
            { ...groupedRows[3] },
            { pk1: 1234, pk2: 1, pk3: 2, name: 'g1v2' },
          ];

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, groupedRows, newRows, primaryKey3)).toEqual(
            'DELETE FROM `my_table` WHERE (`pk1` = 1234) AND (`pk2` IN (0, 1));\n' +
              'INSERT INTO `my_table` (`pk1`, `pk2`, `pk3`, `name`) VALUES\n' +
              "(1234, 0, 0, 'g0v0'),\n" +
              "(1234, 1, 0, 'EDITED'),\n" +
              "(1234, 1, 1, 'g1v1'),\n" +
              "(1234, 1, 2, 'g1v2');\n",
          );
        });

        it('should tell apart rows that share a secondary key but differ by the extra key', () => {
          const { service } = setup();
          // Same pk2, different pk3: without the extra key these would be matched against each other.
          const currentRows: MockThreeKeysRow[] = [{ pk1: 1234, pk2: 0, pk3: 0, name: 'first' }];
          const newRows: MockThreeKeysRow[] = [{ pk1: 1234, pk2: 0, pk3: 1, name: 'first' }];

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, currentRows, newRows, primaryKey3)).toEqual(
            'DELETE FROM `my_table` WHERE (`pk1` = 1234) AND (`pk2` IN (0));\n' +
              'INSERT INTO `my_table` (`pk1`, `pk2`, `pk3`, `name`) VALUES\n' +
              "(1234, 0, 1, 'first');\n",
          );
        });
      });

      describe('using only the secondary key', () => {
        it('should correctly work when all rows are deleted', () => {
          const { service } = setup();
          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, undefined, primaryKey2, myRows, [])).toEqual(
            'DELETE FROM `my_table` WHERE (`pk2` IN (1, 2, 3));\n',
          );
        });

        it('should correctly work when adding new rows to an empty set', () => {
          const { service } = setup();
          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, undefined, primaryKey2, [], myRows)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk2` IN (1, 2, 3));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 1, 'Shin', 28, 4),\n" +
              "(1234, 2, 'Helias', 12, 4),\n" +
              "(1234, 3, 'Kalhac', 12, 4);\n",
          );
        });

        it('should correctly work when editing rows', () => {
          const { service } = setup();
          const newRows = myRows.map((x) => Object.assign({}, x));
          newRows[1].name = 'Helias2';
          newRows[2].name = 'Kalhac2';

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, undefined, primaryKey2, myRows, newRows)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk2` IN (2, 3));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 2, 'Helias2', 12, 4),\n" +
              "(1234, 3, 'Kalhac2', 12, 4);\n",
          );
        });

        it('should correctly work when adding rows', () => {
          const { service } = setup();
          const newRows = myRows.map((x) => Object.assign({}, x));
          newRows.push({ pk1: 1234, pk2: 4, name: 'Yehonal', attribute1: 99, attribute2: 0 });
          newRows.push({ pk1: 1234, pk2: 5, name: 'Barbz', attribute1: 68, attribute2: 1 });

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, undefined, primaryKey2, myRows, newRows)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk2` IN (4, 5));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 4, 'Yehonal', 99, 0),\n" +
              "(1234, 5, 'Barbz', 68, 1);\n",
          );
        });

        it('should correctly work when removing rows', () => {
          const { service } = setup();
          const newRows = [{ ...myRows[0] }, { ...myRows[2] }];

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, undefined, primaryKey2, myRows, newRows)).toEqual(
            'DELETE' + ' FROM `my_table` WHERE (`pk2` IN (2));\n',
          );
        });

        it('should correctly work when removing, editing and adding rows all together', () => {
          const { service } = setup();
          const newRows = [{ ...myRows[0] }, { ...myRows[2] }];
          newRows[1].name = 'Kalhac2';
          newRows.push({ pk1: 1234, pk2: 4, name: 'Yehonal', attribute1: 99, attribute2: 0 });

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, undefined, primaryKey2, myRows, newRows)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk2` IN (2, 3, 4));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 3, 'Kalhac2', 12, 4),\n" +
              "(1234, 4, 'Yehonal', 99, 0);\n",
          );
        });
      });

      describe('using both keys and having primaryKey1 as complex', () => {
        const primaryComplexKey1 = ['pk11', 'pk12'];
        const myComplexRows: MockTwoKeysComplexRow[] = [
          { pk11: 1234, pk12: 5678, pk2: 1, name: 'Shin', attribute1: 28, attribute2: 4 },
          { pk11: 1234, pk12: 5678, pk2: 2, name: 'Helias', attribute1: 12, attribute2: 4 },
          { pk11: 1234, pk12: 5678, pk2: 3, name: 'Kalhac', attribute1: 12, attribute2: 4 },
        ];

        it('should correctly work when all rows are deleted', () => {
          const { service } = setup();
          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryComplexKey1, primaryKey2, myComplexRows, [])).toEqual(
            'DELETE FROM `my_table` WHERE (`pk11` = 1234) AND (`pk12` = 5678)',
          );
        });

        it('should correctly work when adding new rows to an empty set', () => {
          const { service } = setup();
          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryComplexKey1, primaryKey2, [], myComplexRows)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk11` = 1234) AND (`pk12` = 5678) AND (`pk2` IN (1, 2, 3));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk11`, `pk12`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 5678, 1, 'Shin', 28, 4),\n" +
              "(1234, 5678, 2, 'Helias', 12, 4),\n" +
              "(1234, 5678, 3, 'Kalhac', 12, 4);\n",
          );
        });

        it('should correctly work when editing rows', () => {
          const { service } = setup();
          const newRows = myComplexRows.map((x) => Object.assign({}, x));
          newRows[1].name = 'Helias2';
          newRows[2].name = 'Kalhac2';

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryComplexKey1, primaryKey2, myComplexRows, newRows)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk11` = 1234) AND (`pk12` = 5678) AND (`pk2` IN (2, 3));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk11`, `pk12`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 5678, 2, 'Helias2', 12, 4),\n" +
              "(1234, 5678, 3, 'Kalhac2', 12, 4);\n",
          );
        });

        it('should correctly work when adding rows', () => {
          const { service } = setup();
          const newRows = myComplexRows.map((x) => Object.assign({}, x));
          newRows.push({ pk11: 1234, pk12: 5678, pk2: 4, name: 'Yehonal', attribute1: 99, attribute2: 0 });
          newRows.push({ pk11: 1234, pk12: 5678, pk2: 5, name: 'Barbz', attribute1: 68, attribute2: 1 });

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryComplexKey1, primaryKey2, myComplexRows, newRows)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk11` = 1234) AND (`pk12` = 5678) AND (`pk2` IN (4, 5));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk11`, `pk12`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 5678, 4, 'Yehonal', 99, 0),\n" +
              "(1234, 5678, 5, 'Barbz', 68, 1);\n",
          );
        });

        it('should correctly work when removing rows', () => {
          const { service } = setup();
          const newRows = [{ ...myComplexRows[0] }, { ...myComplexRows[2] }];

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryComplexKey1, primaryKey2, myComplexRows, newRows)).toEqual(
            'DELETE' + ' FROM `my_table` WHERE (`pk11` = 1234) AND (`pk12` = 5678) AND (`pk2` IN (2));\n',
          );
        });

        it('should correctly work when removing, editing and adding rows all together', () => {
          const { service } = setup();
          const newRows = [{ ...myComplexRows[0] }, { ...myComplexRows[2] }];
          newRows[1].name = 'Kalhac2';
          newRows.push({ pk11: 1234, pk12: 5678, pk2: 4, name: 'Yehonal', attribute1: 99, attribute2: 0 });

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryComplexKey1, primaryKey2, myComplexRows, newRows)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk11` = 1234) AND (`pk12` = 5678) AND (`pk2` IN (2, 3, 4));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk11`, `pk12`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 5678, 3, 'Kalhac2', 12, 4),\n" +
              "(1234, 5678, 4, 'Yehonal', 99, 0);\n",
          );
        });
      });
    });

    describe('getDiffDeleteInsertOneKeyQuery', () => {
      const primaryKey = 'entry';

      const myRows: MockRow[] = [
        { entry: 1, name: 'Shin', subname: 'AC-Dev', attribute1: 28, attribute2: 4 },
        { entry: 2, name: 'Helias', subname: 'AC-Dev', attribute1: 12, attribute2: 4 },
        { entry: 3, name: 'Kalhac', subname: 'AC-Dev', attribute1: 12, attribute2: 4 },
      ];

      it('should return empty string if currentRows or newRows are null', () => {
        const { service } = setup();
        expect(service.getDiffDeleteInsertOneKeyQuery(tableName, primaryKey, undefined, [])).toEqual('');
        expect(service.getDiffDeleteInsertOneKeyQuery(tableName, primaryKey, [], undefined)).toEqual('');
      });

      it('should correctly work when all rows are deleted', () => {
        const { service } = setup();
        expect(service.getDiffDeleteInsertOneKeyQuery(tableName, primaryKey, myRows, [])).toEqual(
          'DELETE FROM `my_table` WHERE (`entry` IN (1, 2, 3));\n',
        );
      });

      it('should correctly work when there are no changes', () => {
        const { service } = setup();
        expect(service.getDiffDeleteInsertOneKeyQuery(tableName, primaryKey, myRows, myRows)).toEqual('');
      });

      it('should correctly work when adding new rows to an empty set', () => {
        const { service } = setup();
        expect(service.getDiffDeleteInsertOneKeyQuery(tableName, primaryKey, [], myRows)).toEqual(
          'DELETE' +
            ' FROM `my_table` WHERE (`entry` IN (1, 2, 3));\n' +
            'INSERT' +
            ' INTO `my_table` (`entry`, `name`, `subname`, `attribute1`, `attribute2`) VALUES\n' +
            "(1, 'Shin', 'AC-Dev', 28, 4),\n" +
            "(2, 'Helias', 'AC-Dev', 12, 4),\n" +
            "(3, 'Kalhac', 'AC-Dev', 12, 4);\n",
        );
      });

      it('should correctly work when editing rows', () => {
        const { service } = setup();
        const newRows = myRows.map((x) => Object.assign({}, x));
        newRows[1].name = 'Helias2';
        newRows[2].name = 'Kalhac2';

        expect(service.getDiffDeleteInsertOneKeyQuery(tableName, primaryKey, myRows, newRows)).toEqual(
          'DELETE' +
            ' FROM `my_table` WHERE (`entry` IN (2, 3));\n' +
            'INSERT' +
            ' INTO `my_table` (`entry`, `name`, `subname`, `attribute1`, `attribute2`) VALUES\n' +
            "(2, 'Helias2', 'AC-Dev', 12, 4),\n" +
            "(3, 'Kalhac2', 'AC-Dev', 12, 4);\n",
        );
      });

      it('should correctly work when adding rows', () => {
        const { service } = setup();
        const newRows = myRows.map((x) => Object.assign({}, x));
        newRows.push({ entry: 4, name: 'Yehonal', subname: 'AC-Dev', attribute1: 99, attribute2: 0 });
        newRows.push({ entry: 5, name: 'Barbz', subname: 'AC-Dev', attribute1: 68, attribute2: 1 });

        expect(service.getDiffDeleteInsertOneKeyQuery(tableName, primaryKey, myRows, newRows)).toEqual(
          'DELETE' +
            ' FROM `my_table` WHERE (`entry` IN (4, 5));\n' +
            'INSERT' +
            ' INTO `my_table` (`entry`, `name`, `subname`, `attribute1`, `attribute2`) VALUES\n' +
            "(4, 'Yehonal', 'AC-Dev', 99, 0),\n" +
            "(5, 'Barbz', 'AC-Dev', 68, 1);\n",
        );
      });

      it('should correctly work when removing rows', () => {
        const { service } = setup();
        const newRows = [{ ...myRows[0] }, { ...myRows[2] }];

        expect(service.getDiffDeleteInsertOneKeyQuery(tableName, primaryKey, myRows, newRows)).toEqual(
          'DELETE' + ' FROM `my_table` WHERE (`entry` IN (2));\n',
        );
      });

      it('should correctly work when removing, editing and adding rows all together', () => {
        const { service } = setup();
        const newRows = [{ ...myRows[0] }, { ...myRows[2] }];
        newRows[1].name = 'Kalhac2';
        newRows.push({ entry: 4, name: 'Yehonal', subname: 'AC-Dev', attribute1: 99, attribute2: 0 });

        expect(service.getDiffDeleteInsertOneKeyQuery(tableName, primaryKey, myRows, newRows)).toEqual(
          'DELETE' +
            ' FROM `my_table` WHERE (`entry` IN (2, 3, 4));\n' +
            'INSERT' +
            ' INTO `my_table` (`entry`, `name`, `subname`, `attribute1`, `attribute2`) VALUES\n' +
            "(3, 'Kalhac2', 'AC-Dev', 12, 4),\n" +
            "(4, 'Yehonal', 'AC-Dev', 99, 0);\n",
        );
      });
    });

    describe('getFullDeleteInsertQuery', () => {
      const primaryKey = 'pk1';

      it('it should return empty string if the array of rows is empty or null', () => {
        const { service } = setup();
        expect(service.getFullDeleteInsertQuery(tableName, [], primaryKey)).toEqual('');
        expect(service.getFullDeleteInsertQuery(tableName, undefined, primaryKey)).toEqual('');
      });

      describe('using only the primary key', () => {
        it('should correctly work when adding a group of rows', () => {
          const { service } = setup();
          const rows: MockTwoKeysRow[] = [
            { pk1: 1234, pk2: 1, name: 'Shin', attribute1: 28, attribute2: 4 },
            { pk1: 1234, pk2: 2, name: 'Helias', attribute1: 12, attribute2: 4 },
            { pk1: 1234, pk2: 3, name: 'Kalhac', attribute1: 12, attribute2: 4 },
          ];

          expect(service.getFullDeleteInsertQuery(tableName, rows, primaryKey)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk1` = 1234);\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 1, 'Shin', 28, 4),\n" +
              "(1234, 2, 'Helias', 12, 4),\n" +
              "(1234, 3, 'Kalhac', 12, 4);\n",
          );
        });

        it('should correctly work when adding a single row', () => {
          const { service } = setup();
          const rows: MockTwoKeysRow[] = [{ pk1: 1234, pk2: 1, name: 'Shin', attribute1: 28, attribute2: 4 }];

          expect(service.getFullDeleteInsertQuery(tableName, rows, primaryKey)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk1` = 1234);\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 1, 'Shin', 28, 4);\n",
          );
        });
      });

      describe('using both keys [non-grouped]', () => {
        const primaryKey2 = 'pk2';

        it('should correctly work when adding a group of rows', () => {
          const { service } = setup();
          const rows: MockTwoKeysRow[] = [
            { pk1: 1234, pk2: 1, name: 'Shin', attribute1: 28, attribute2: 4 },
            { pk1: 1234, pk2: 2, name: 'Helias', attribute1: 12, attribute2: 4 },
            { pk1: 1234, pk2: 3, name: 'Kalhac', attribute1: 12, attribute2: 4 },
          ];

          expect(service.getFullDeleteInsertQuery(tableName, rows, primaryKey, primaryKey2)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk1` = 1234 AND `pk2` IN (1, 2, 3));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 1, 'Shin', 28, 4),\n" +
              "(1234, 2, 'Helias', 12, 4),\n" +
              "(1234, 3, 'Kalhac', 12, 4);\n",
          );
        });

        it('should correctly work when adding a single row', () => {
          const { service } = setup();
          const rows: MockTwoKeysRow[] = [{ pk1: 1234, pk2: 1, name: 'Shin', attribute1: 28, attribute2: 4 }];

          expect(service.getFullDeleteInsertQuery(tableName, rows, primaryKey, primaryKey2)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk1` = 1234 AND `pk2` IN (1));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 1, 'Shin', 28, 4);\n",
          );
        });
      });

      describe('using both keys [grouped]', () => {
        const primaryKey2 = 'pk2';

        it('should correctly work when adding a group of rows', () => {
          const { service } = setup();
          const rows: MockTwoKeysRow[] = [
            { pk1: 1234, pk2: 1, name: 'Shin', attribute1: 28, attribute2: 4 },
            { pk1: 1234, pk2: 1, name: 'Helias', attribute1: 12, attribute2: 4 },
            { pk1: 1234, pk2: 1, name: 'Kalhac', attribute1: 12, attribute2: 4 },
          ];

          expect(service.getFullDeleteInsertQuery(tableName, rows, primaryKey, primaryKey2, true)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk1` = 1234 AND `pk2` = 1);\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 1, 'Shin', 28, 4),\n" +
              "(1234, 1, 'Helias', 12, 4),\n" +
              "(1234, 1, 'Kalhac', 12, 4);\n",
          );
        });

        it('should correctly work when adding a single row', () => {
          const { service } = setup();
          const rows: MockTwoKeysRow[] = [{ pk1: 1234, pk2: 1, name: 'Shin', attribute1: 28, attribute2: 4 }];

          expect(service.getFullDeleteInsertQuery(tableName, rows, primaryKey, primaryKey2, true)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk1` = 1234 AND `pk2` = 1);\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 1, 'Shin', 28, 4);\n",
          );
        });
      });

      describe('using only the secondary key', () => {
        const primaryKey2 = 'pk2';

        it('should correctly work when adding a group of rows', () => {
          const { service } = setup();
          const rows: MockTwoKeysRow[] = [
            { pk1: 1234, pk2: 1, name: 'Shin', attribute1: 28, attribute2: 4 },
            { pk1: 1234, pk2: 2, name: 'Helias', attribute1: 12, attribute2: 4 },
            { pk1: 1234, pk2: 3, name: 'Kalhac', attribute1: 12, attribute2: 4 },
          ];

          expect(service.getFullDeleteInsertQuery(tableName, rows, null, primaryKey2)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk2` IN (1, 2, 3));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 1, 'Shin', 28, 4),\n" +
              "(1234, 2, 'Helias', 12, 4),\n" +
              "(1234, 3, 'Kalhac', 12, 4);\n",
          );
        });

        it('should correctly work when adding a single row', () => {
          const { service } = setup();
          const rows: MockTwoKeysRow[] = [{ pk1: 1234, pk2: 1, name: 'Shin', attribute1: 28, attribute2: 4 }];

          expect(service.getFullDeleteInsertQuery(tableName, rows, null, primaryKey2)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk2` IN (1));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 1, 'Shin', 28, 4);\n",
          );
        });
      });

      describe('using no keys', () => {
        it('should correctly work when adding a group of rows', () => {
          const { service } = setup();
          const rows: MockTwoKeysRow[] = [
            { pk1: 1234, pk2: 1, name: 'Shin', attribute1: 28, attribute2: 4 },
            { pk1: 1234, pk2: 2, name: 'Helias', attribute1: 12, attribute2: 4 },
            { pk1: 1234, pk2: 3, name: 'Kalhac', attribute1: 12, attribute2: 4 },
          ];

          expect(service.getFullDeleteInsertQuery(tableName, rows)).toEqual(
            'DELETE' +
              ' FROM `my_table`;\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 1, 'Shin', 28, 4),\n" +
              "(1234, 2, 'Helias', 12, 4),\n" +
              "(1234, 3, 'Kalhac', 12, 4);\n",
          );
        });

        it('should correctly work when adding a single row', () => {
          const { service } = setup();
          const rows: MockTwoKeysRow[] = [{ pk1: 1234, pk2: 1, name: 'Shin', attribute1: 28, attribute2: 4 }];

          expect(service.getFullDeleteInsertQuery(tableName, rows)).toEqual(
            'DELETE' +
              ' FROM `my_table`;\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 1, 'Shin', 28, 4);\n",
          );
        });
      });
    });

    describe('getUpdateMultipleKeysQuery', () => {
      for (const { id, currentRow, newRow, keys, query } of [
        { id: 0, currentRow: {}, newRow: {}, keys: [], query: '' },
        { id: 1, currentRow: { k1: 1 }, newRow: { k1: 1 }, keys: ['k1'], query: '' },
        {
          id: 2,
          currentRow: { k1: 1, k2: 2 },
          newRow: { k1: 11, k2: 2 },
          keys: ['k1', 'k2'],
          query: 'UPDATE `my_table` SET `k1` = 11 WHERE (`k1` = 1) AND (`k2` = 2);',
        },
        {
          id: 3,
          currentRow: { k1: 1, k2: 2, k3: 3, n1: 1 },
          newRow: { k1: 1, k2: 2, k3: 3, n1: 11 },
          keys: ['k1', 'k2', 'k3'],
          query: 'UPDATE `my_table` SET `n1` = 11 WHERE (`k1` = 1) AND (`k2` = 2) AND (`k3` = 3);',
        },
        {
          id: 4,
          currentRow: { k1: 1, k2: 2, k3: 3, n1: 1 },
          newRow: { k1: 1, k2: 2, k3: 33, n1: 11 },
          keys: ['k1', 'k2', 'k3'],
          query: 'UPDATE `my_table` SET `k3` = 33, `n1` = 11 WHERE (`k1` = 1) AND (`k2` = 2) AND (`k3` = 3);',
        },
      ]) {
        it(`should correctly generate the query [${id}]`, () => {
          const { service } = setup();
          expect(service.getUpdateMultipleKeysQuery(tableName, currentRow, newRow, keys)).toEqual(query);
        });
      }
    });

    describe('getDeleteMultipleKeysQuery', () => {
      for (const { id, row, keys, query } of [
        { id: 0, row: {}, keys: [], query: 'DELETE FROM `my_table`;' },
        { id: 1, row: { k1: 1 }, keys: ['k1'], query: 'DELETE FROM `my_table` WHERE (`k1` = 1);' },
        {
          id: 2,
          row: { k1: 1, k2: 2 },
          keys: ['k1', 'k2'],
          query: 'DELETE FROM `my_table` WHERE (`k1` = 1) AND (`k2` = 2);',
        },
        {
          id: 3,
          row: { k1: 1, k2: 2, k3: 3 },
          keys: ['k1', 'k2', 'k3'],
          query: 'DELETE FROM `my_table` WHERE (`k1` = 1) AND (`k2` = 2) AND (`k3` = 3);',
        },
      ]) {
        it(`should correctly generate the query [${id}]`, () => {
          const { service } = setup();
          expect(service.getDeleteMultipleKeysQuery(tableName, row, keys)).toEqual(query);
        });
      }
    });

    describe('getFullDeleteInsertMultipleKeysQuery', () => {
      for (const { id, currentRow, newRow, keys, query } of [
        {
          id: 1,
          currentRow: { k1: 1, n1: 33 },
          newRow: { k1: 1, n1: 22 },
          keys: ['k1'],
          query: 'DELETE FROM `my_table` WHERE (`k1` = 1);\n' + 'INSERT INTO `my_table` (`k1`, `n1`) VALUES\n' + '(1, 22);\n',
        },
        {
          id: 2,
          currentRow: { k1: 1, n1: 33 },
          newRow: { k1: 2, n1: 22 },
          keys: ['k1'],
          query: 'DELETE FROM `my_table` WHERE (`k1` = 1);\n' + 'INSERT INTO `my_table` (`k1`, `n1`) VALUES\n' + '(2, 22);\n',
        },
      ]) {
        it(`should correctly generate the query [${id}]`, () => {
          const { service } = setup();
          expect(service.getFullDeleteInsertMultipleKeysQuery(tableName, currentRow, newRow, keys)).toEqual(query);
        });
      }
    });
  });

  describe('get helpers', () => {
    const result = 'mock result';
    const resultToObs = of(result);
    const resultToPromise = lastValueFrom(resultToObs);
    const id = '123';
    const guid = id;

    function setupHelpers() {
      const { service } = setup();
      vi.spyOn(service, 'queryValue').mockReturnValue(resultToObs);
      vi.spyOn(service, 'queryValueToPromise').mockReturnValue(resultToPromise);
      return { service };
    }

    it('clearCache', async () => {
      const { service } = setupHelpers();
      expect(await service.getCreatureNameById(id)).toEqual(result);
      expect(await service.getCreatureNameById(id)).toEqual(result);
      expect(service.queryValue).toHaveBeenCalledTimes(1);
      service.clearCache();
      expect(await service.getCreatureNameById(id)).toEqual(result);
      expect(service.queryValue).toHaveBeenCalledTimes(2);
    });

    const cases: { name: keyof MysqlQueryService; query: string }[] = [
      { name: 'getCreatureNameById', query: `SELECT name AS v FROM creature_template WHERE entry = ${id}` },
      {
        name: 'getCreatureNameByGuid',
        query: `SELECT name AS v FROM creature_template AS ct INNER JOIN creature AS c ON ct.entry = c.id WHERE c.guid = ${guid}`,
      },
      { name: 'getGameObjectNameById', query: `SELECT name AS v FROM gameobject_template WHERE entry = ${id}` },
      {
        name: 'getGameObjectNameByGuid',
        query: `SELECT name AS v FROM gameobject_template AS gt INNER JOIN gameobject AS g ON gt.entry = g.id WHERE g.guid = ${guid}`,
      },
      { name: 'getQuestTitleById', query: `SELECT LogTitle AS v FROM quest_template WHERE ID = ${id}` },
      { name: 'getItemNameById', query: `SELECT name AS v FROM item_template WHERE entry = ${id}` },
      { name: 'getPrevQuestById', query: `SELECT PrevQuestID AS v FROM quest_template_addon WHERE id = ${id}` },
      { name: 'getItemByStartQuest', query: `SELECT entry AS v FROM item_template WHERE startquest = ${id}` },
      { name: 'getItemNameByStartQuest', query: `SELECT name AS v FROM item_template WHERE startquest = ${id}` },
      { name: 'getText0ById', query: `SELECT text0_0 AS v FROM npc_text WHERE ID = ${id}` },
      { name: 'getText1ById', query: `SELECT text0_1 AS v FROM npc_text WHERE ID = ${id}` },
      { name: 'getCreatureDisplayIdById', query: `SELECT CreatureDisplayID AS v FROM creature_template_model WHERE CreatureID=${id}` },
      { name: 'getGameobjectDisplayIdById', query: `SELECT displayId AS v FROM gameobject_template WHERE entry=${id}` },
    ];

    for (const test of cases) {
      it(test.name, async () => {
        const { service } = setupHelpers();
        expect(await (service[test.name] as (arg: any) => Promise<string>)(id)).toEqual(result);
        expect(await (service[test.name] as (arg: any) => Promise<string>)(id)).toEqual(result);
        expect(service.queryValue).toHaveBeenCalledTimes(1);
        expect(service.queryValue).toHaveBeenCalledWith(test.query);
        expect(service['cache'].size).toBe(1);
      });
    }

    it('getDisplayIdByItemId (case non-null)', () => {
      const { service } = setupHelpers();
      service.getDisplayIdByItemId(id).subscribe((res) => {
        expect(res).toEqual(result);
      });
      expect(service.queryValue).toHaveBeenCalledWith(`SELECT displayid AS v FROM item_template WHERE entry = ${id}`);
      expect(service['cache'].size).toBe(1);
    });

    it('getDisplayIdByItemId (case null)', () => {
      const { service } = setupHelpers();
      service.getDisplayIdByItemId(undefined).subscribe((res) => {
        expect(res).toEqual(undefined);
      });
      expect(service.queryValue).toHaveBeenCalledTimes(0);
    });

    it('getQuestTitleByCriteria (case 1)', () => {
      const { service } = setupHelpers();
      expect(service.getQuestTitleByCriteria(null, 2, 3, 4, 5)).toEqual(resultToPromise);
      expect(service.queryValueToPromise).toHaveBeenCalledWith(
        'SELECT `LogTitle` AS "v" FROM `quest_template` WHERE (RequiredNpcOrGo2 = 2) AND (RequiredNpcOrGo3 = 3) AND (RequiredNpcOrGo4 = 4) AND (RequiredSpellCast1 = 5)',
      );
    });

    it('getQuestTitleByCriteria (case 2)', () => {
      const { service } = setupHelpers();
      expect(service.getQuestTitleByCriteria(1, null, null, null)).toEqual(resultToPromise);
      expect(service.queryValueToPromise).toHaveBeenCalledWith(
        'SELECT `LogTitle` AS "v" FROM `quest_template` WHERE (RequiredNpcOrGo1 = 1)',
      );
    });

    it('getNextQuestById', async () => {
      const { service } = setupHelpers();
      expect(await service.getNextQuestById(id)).toEqual(result);
      expect(await service.getNextQuestById(id)).toEqual(result);
      expect(service.queryValue).toHaveBeenCalledTimes(1);
      expect(service.queryValue).toHaveBeenCalledWith(`SELECT NextQuestID AS v FROM quest_template_addon WHERE id = ${id}`);
      expect(service['cache'].size).toBe(1);
    });

    it('getNextQuestById (usingPrev)', async () => {
      const { service } = setupHelpers();
      expect(await service.getNextQuestById(id, true)).toEqual(result);
      expect(await service.getNextQuestById(id, true)).toEqual(result);
      expect(service.queryValue).toHaveBeenCalledTimes(1);
      expect(service.queryValue).toHaveBeenCalledWith(`SELECT id AS v FROM quest_template_addon WHERE PrevQuestID = ${id}`);
      expect(service['cache'].size).toBe(1);
    });

    it('getReputationRewardByFaction (usingPrev)', async () => {
      const { service } = setupHelpers();
      vi.spyOn(service, 'query').mockReturnValue(of([]));
      expect(await service.getReputationRewardByFaction(id)).toEqual([]);
      expect(await service.getReputationRewardByFaction(id)).toEqual([]);
      expect(service.query).toHaveBeenCalledTimes(1);
      expect(service.query).toHaveBeenCalledWith(`SELECT * FROM reputation_reward_rate WHERE faction = ${id}`);
      expect(service['cache'].size).toBe(1);
    });
  });
});
