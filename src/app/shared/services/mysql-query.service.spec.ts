import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { instance } from 'ts-mockito';

import { MysqlQueryService } from './mysql-query.service';
import { MysqlService } from './mysql.service';
import { MockedMysqlService } from '../testing/mocks';
import { MaxRow, QueryForm, TableRow } from '../types/general';
import { ConfigService } from './config.service';
import { SmartScripts } from '@keira-types/smart-scripts.type';

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

interface MockTwoKeysComplexRow extends TableRow {
  pk11: number;
  pk12: number;
  pk2: number;
  name: string;
  attribute1: number;
  attribute2: number;
}

describe('MysqlQueryService', () => {
  let service: MysqlQueryService;
  let configService: ConfigService;

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: MysqlService, useValue: instance(MockedMysqlService) }],
    }),
  );

  beforeEach(() => {
    configService = TestBed.inject(ConfigService);
    service = TestBed.inject(MysqlQueryService);
  });

  it('query() should call mysqlService.dbQuery() and output query and results if debug mode is enabled', () => {
    const logSpy = spyOn(console, 'log');
    configService.debugMode = true;
    const querySpy = spyOn(TestBed.inject(MysqlService), 'dbQuery').and.returnValue(of({ id: 'mock value' } as TableRow));
    const myQuery = 'SELECT azerothcore FROM projects;';

    service.query(myQuery).subscribe(() => {
      expect(logSpy).toHaveBeenCalledTimes(2);
    });

    expect(querySpy).toHaveBeenCalledWith(myQuery, undefined);
  });

  it('query() should call mysqlService.dbQuery() and not output anything if debug mode is disabled', () => {
    const logSpy = spyOn(console, 'log');
    configService.debugMode = false;
    const querySpy = spyOn(TestBed.inject(MysqlService), 'dbQuery').and.returnValue(of(null));
    const myQuery = 'SELECT azerothcore FROM projects;';

    service.query(myQuery).subscribe(() => {
      expect(logSpy).toHaveBeenCalledTimes(0);
    });

    expect(querySpy).toHaveBeenCalledWith(myQuery, undefined);
  });

  describe('getSearchQuery()', () => {
    const table = 'my_keira3';

    it('should properly work when using fields', () => {
      const queryForm: QueryForm<any> = {
        fields: {
          myField1: 'myValue1',
          myField2: 'myValue2',
        },
      };

      expect(service.getSearchQuery(table, queryForm)).toEqual(
        'SELECT * ' + "FROM `my_keira3` WHERE (`myField1` LIKE '%myValue1%') AND (`myField2` LIKE '%myValue2%')",
      );
    });

    it('should properly work when using fields that contain special characters', () => {
      const queryForm: QueryForm<any> = {
        fields: {
          myField1: `The People's Militia`,
          myField2: `Mi illumino d'immenso`,
        },
      };

      expect(service.getSearchQuery(table, queryForm)).toEqual(
        'SELECT * ' +
          "FROM `my_keira3` WHERE (`myField1` LIKE '%The People\\'s Militia%') " +
          "AND (`myField2` LIKE '%Mi illumino d\\'immenso%')",
      );
    });

    it('should properly work when using fields and limit', () => {
      const queryForm: QueryForm<any> = {
        fields: {
          myField1: 'myValue1',
          myField2: 'myValue2',
        },
        limit: 20,
      };

      expect(service.getSearchQuery(table, queryForm)).toEqual(
        'SELECT * ' + "FROM `my_keira3` WHERE (`myField1` LIKE '%myValue1%') AND (`myField2` LIKE '%myValue2%') LIMIT 20",
      );
    });

    it('should properly work when using limit only', () => {
      const queryForm: QueryForm<any> = {
        fields: {
          param: null,
        },
        limit: 20,
      };

      expect(service.getSearchQuery(table, queryForm)).toEqual('SELECT * ' + 'FROM `my_keira3` LIMIT 20');
    });

    it('should properly work when using fields, limit, selectFields and groupField', () => {
      const queryForm: QueryForm<any> = {
        fields: {
          myField1: 'myValue1',
          myField2: 'myValue2',
        },
        limit: 20,
      };

      const selectFields = ['sel1', 'sel2'];
      const groupFields = ['sel1', 'sel2', 'sel3'];

      expect(service.getSearchQuery(table, queryForm, selectFields, groupFields)).toEqual(
        'SELECT `sel1`, `sel2` ' +
          "FROM `my_keira3` WHERE (`myField1` LIKE '%myValue1%') AND (`myField2` LIKE '%myValue2%') " +
          'GROUP BY sel1, sel2, sel3 LIMIT 20',
      );
    });
  });

  it(
    'selectAll() should correctly work',
    waitForAsync(() => {
      const data: TableRow[] = [{ key: 'value' }];
      const querySpy = spyOn(service, 'query').and.returnValue(of(data));

      service.selectAll('my_ac', 'param', 'value').subscribe((res) => {
        expect(res).toEqual(data);
      });

      expect(querySpy).toHaveBeenCalledWith('SELECT * ' + 'FROM `my_ac` WHERE (param = value)');
    }),
  );

  it(
    'selectAllMultipleKeys() should correctly work',
    waitForAsync(() => {
      const data: TableRow[] = [{ key: 'value' }];
      const querySpy = spyOn(service, 'query').and.returnValue(of(data));
      const row: TableRow = { k1: 1, k2: 2 };

      service.selectAllMultipleKeys('my_ac', row).subscribe((res) => {
        expect(res).toEqual(data);
      });

      expect(querySpy).toHaveBeenCalledWith('SELECT * ' + 'FROM `my_ac` WHERE (k1 = 1) AND (k2 = 2)');
    }),
  );

  it(
    'getMaxId() should correctly work',
    waitForAsync(() => {
      const data: MaxRow[] = [{ max: 123 }];
      const querySpy = spyOn(service, 'query').and.returnValue(of());

      service.getMaxId('my_ac', 'param').subscribe((res) => {
        expect(res).toEqual(data);
      });

      expect(querySpy).toHaveBeenCalledWith('SELECT MAX(param) AS max ' + 'FROM my_ac;');
    }),
  );

  it(
    'getTimedActionlists() should correctly work',
    waitForAsync(() => {
      const id = 1234;
      const data: SmartScripts[] = [{ entryorguid: 1111 } as SmartScripts];
      const querySpy = spyOn(service, 'query').and.returnValue(of(data));

      service.getTimedActionlists(id).subscribe((res) => {
        expect(res).toEqual(data);
      });

      expect(querySpy).toHaveBeenCalledWith(
        `SELECT * FROM smart_scripts WHERE source_type = 9 AND entryorguid >= ${id * 100} AND entryorguid < ${id * 100 + 100}`,
      );
    }),
  );

  describe('Query builders', () => {
    const tableName = 'my_table';

    describe('getUpdateQuery', () => {
      const primaryKey = 'entry';
      const currentRow: MockRow = { entry: 1234, name: 'Shin', subname: 'AC-Dev', attribute1: 25, attribute2: 4 };

      it('should return empty string when there are no differences', () => {
        expect(service.getUpdateQuery(tableName, primaryKey, currentRow, currentRow)).toEqual('');
      });

      it('should correctly generate queries', () => {
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
        expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, null, [])).toEqual('');
        expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, [], null)).toEqual('');
      });

      it('should return empty string if currentRows or newRows are null', () => {
        expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, [], [])).toEqual('');
      });

      it('should correctly work when there are no changes', () => {
        expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, myRows, myRows)).toEqual('');
      });

      describe('using both keys', () => {
        it('should correctly work when all rows are deleted', () => {
          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, myRows, [])).toEqual(
            'DELETE FROM `my_table` WHERE `pk1` = 1234;\n',
          );
        });

        it('should correctly work when adding new rows to an empty set', () => {
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
          const newRows = myRows.map((x) => Object.assign({}, x));
          // edit two existing rows
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
          const newRows = myRows.map((x) => Object.assign({}, x));
          // add two new rows
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
          const newRows = [{ ...myRows[0] }, { ...myRows[2] }]; // delete second row

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryKey1, primaryKey2, myRows, newRows)).toEqual(
            'DELETE' + ' FROM `my_table` WHERE (`pk1` = 1234) AND (`pk2` IN (2));\n',
          );
        });

        it('should correctly work when removing, editing and adding rows all together', () => {
          const newRows = [{ ...myRows[0] }, { ...myRows[2] }]; // delete second row
          newRows[1].name = 'Kalhac2'; // edit row
          newRows.push({ pk1: 1234, pk2: 4, name: 'Yehonal', attribute1: 99, attribute2: 0 }); // add a new row

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

      describe('using only the secondary key', () => {
        it('should correctly work when all rows are deleted', () => {
          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, null, primaryKey2, myRows, [])).toEqual(
            'DELETE FROM `my_table` WHERE (`pk2` IN (1, 2, 3));\n',
          );
        });

        it('should correctly work when adding new rows to an empty set', () => {
          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, null, primaryKey2, [], myRows)).toEqual(
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
          const newRows = myRows.map((x) => Object.assign({}, x));
          // edit two existing rows
          newRows[1].name = 'Helias2';
          newRows[2].name = 'Kalhac2';

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, null, primaryKey2, myRows, newRows)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk2` IN (2, 3));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 2, 'Helias2', 12, 4),\n" +
              "(1234, 3, 'Kalhac2', 12, 4);\n",
          );
        });

        it('should correctly work when adding rows', () => {
          const newRows = myRows.map((x) => Object.assign({}, x));
          // add two new rows
          newRows.push({ pk1: 1234, pk2: 4, name: 'Yehonal', attribute1: 99, attribute2: 0 });
          newRows.push({ pk1: 1234, pk2: 5, name: 'Barbz', attribute1: 68, attribute2: 1 });

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, null, primaryKey2, myRows, newRows)).toEqual(
            'DELETE' +
              ' FROM `my_table` WHERE (`pk2` IN (4, 5));\n' +
              'INSERT' +
              ' INTO `my_table` (`pk1`, `pk2`, `name`, `attribute1`, `attribute2`) VALUES\n' +
              "(1234, 4, 'Yehonal', 99, 0),\n" +
              "(1234, 5, 'Barbz', 68, 1);\n",
          );
        });

        it('should correctly work when removing rows', () => {
          const newRows = [{ ...myRows[0] }, { ...myRows[2] }]; // delete second row

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, null, primaryKey2, myRows, newRows)).toEqual(
            'DELETE' + ' FROM `my_table` WHERE (`pk2` IN (2));\n',
          );
        });

        it('should correctly work when removing, editing and adding rows all together', () => {
          const newRows = [{ ...myRows[0] }, { ...myRows[2] }]; // delete second row
          newRows[1].name = 'Kalhac2'; // edit row
          newRows.push({ pk1: 1234, pk2: 4, name: 'Yehonal', attribute1: 99, attribute2: 0 }); // add a new row

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, null, primaryKey2, myRows, newRows)).toEqual(
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
          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryComplexKey1, primaryKey2, myComplexRows, [])).toEqual(
            'DELETE FROM `my_table` WHERE (`pk11` = 1234) AND (`pk12` = 5678)',
          );
        });

        it('should correctly work when adding new rows to an empty set', () => {
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
          const newRows = myComplexRows.map((x) => Object.assign({}, x));
          // edit two existing rows
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
          const newRows = myComplexRows.map((x) => Object.assign({}, x));
          // add two new rows
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
          const newRows = [{ ...myComplexRows[0] }, { ...myComplexRows[2] }]; // delete second row

          expect(service.getDiffDeleteInsertTwoKeysQuery(tableName, primaryComplexKey1, primaryKey2, myComplexRows, newRows)).toEqual(
            'DELETE' + ' FROM `my_table` WHERE (`pk11` = 1234) AND (`pk12` = 5678) AND (`pk2` IN (2));\n',
          );
        });

        it('should correctly work when removing, editing and adding rows all together', () => {
          const newRows = [{ ...myComplexRows[0] }, { ...myComplexRows[2] }]; // delete second row
          newRows[1].name = 'Kalhac2'; // edit row
          newRows.push({ pk11: 1234, pk12: 5678, pk2: 4, name: 'Yehonal', attribute1: 99, attribute2: 0 }); // add a new row

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
        expect(service.getDiffDeleteInsertOneKeyQuery(tableName, primaryKey, null, [])).toEqual('');
        expect(service.getDiffDeleteInsertOneKeyQuery(tableName, primaryKey, [], null)).toEqual('');
      });

      it('should correctly work when all rows are deleted', () => {
        expect(service.getDiffDeleteInsertOneKeyQuery(tableName, primaryKey, myRows, [])).toEqual(
          'DELETE FROM `my_table` WHERE (`entry` IN (1, 2, 3));\n',
        );
      });

      it('should correctly work when there are no changes', () => {
        expect(service.getDiffDeleteInsertOneKeyQuery(tableName, primaryKey, myRows, myRows)).toEqual('');
      });

      it('should correctly work when adding new rows to an empty set', () => {
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
        const newRows = myRows.map((x) => Object.assign({}, x));
        // edit two existing rows
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
        const newRows = myRows.map((x) => Object.assign({}, x));
        // add two new rows
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
        const newRows = [{ ...myRows[0] }, { ...myRows[2] }]; // delete second row

        expect(service.getDiffDeleteInsertOneKeyQuery(tableName, primaryKey, myRows, newRows)).toEqual(
          'DELETE' + ' FROM `my_table` WHERE (`entry` IN (2));\n',
        );
      });

      it('should correctly work when removing, editing and adding rows all together', () => {
        const newRows = [{ ...myRows[0] }, { ...myRows[2] }]; // delete second row
        newRows[1].name = 'Kalhac2'; // edit row
        newRows.push({ entry: 4, name: 'Yehonal', subname: 'AC-Dev', attribute1: 99, attribute2: 0 }); // add a new row

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
        expect(service.getFullDeleteInsertQuery(tableName, [], primaryKey)).toEqual('');
        expect(service.getFullDeleteInsertQuery(tableName, null, primaryKey)).toEqual('');
      });

      describe('using only the primary key', () => {
        it('should correctly work when adding a group of rows', () => {
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
          query: 'UPDATE `my_table` SET `k1` = 11 WHERE (`k1` = 1) AND (`k2` = 2)',
        },
        {
          id: 3,
          currentRow: { k1: 1, k2: 2, k3: 3, n1: 1 },
          newRow: { k1: 1, k2: 2, k3: 3, n1: 11 },
          keys: ['k1', 'k2', 'k3'],
          query: 'UPDATE `my_table` SET `n1` = 11 WHERE (`k1` = 1) AND (`k2` = 2) AND (`k3` = 3)',
        },
        {
          id: 4,
          currentRow: { k1: 1, k2: 2, k3: 3, n1: 1 },
          newRow: { k1: 1, k2: 2, k3: 33, n1: 11 },
          keys: ['k1', 'k2', 'k3'],
          query: 'UPDATE `my_table` SET `k3` = 33, `n1` = 11 WHERE (`k1` = 1) AND (`k2` = 2) AND (`k3` = 3)',
        },
      ]) {
        it(`should correctly generate the query [${id}]`, () => {
          expect(service.getUpdateMultipleKeysQuery(tableName, currentRow, newRow, keys)).toEqual(query);
        });
      }
    });

    describe('getDeleteMultipleKeysQuery', () => {
      for (const { id, row, keys, query } of [
        { id: 0, row: {}, keys: [], query: 'DELETE FROM `my_table`' },
        { id: 1, row: { k1: 1 }, keys: ['k1'], query: 'DELETE FROM `my_table` WHERE (`k1` = 1)' },
        {
          id: 2,
          row: { k1: 1, k2: 2 },
          keys: ['k1', 'k2'],
          query: 'DELETE FROM `my_table` WHERE (`k1` = 1) AND (`k2` = 2)',
        },
        {
          id: 3,
          row: { k1: 1, k2: 2, k3: 3 },
          keys: ['k1', 'k2', 'k3'],
          query: 'DELETE FROM `my_table` WHERE (`k1` = 1) AND (`k2` = 2) AND (`k3` = 3)',
        },
      ]) {
        it(`should correctly generate the query [${id}]`, () => {
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
          expect(service.getFullDeleteInsertMultipleKeysQuery(tableName, currentRow, newRow, keys)).toEqual(query);
        });
      }
    });
  });

  describe('queryValue()', () => {
    it(
      'should correctly work',
      waitForAsync(async () => {
        const value = 'mock result value';
        spyOn(service, 'query').and.returnValue(of([{ v: value }]));
        const query = 'SELECT something AS v FROM my_table WHERE index = 123';

        expect(await service.queryValueToPromise(query)).toEqual(value);
        expect(service.query).toHaveBeenCalledTimes(1);
        expect(service.query).toHaveBeenCalledWith(query);
      }),
    );

    it(
      'should be safe in case of no results',
      waitForAsync(async () => {
        spyOn(service, 'query').and.returnValue(of([]));
        const query = 'SELECT something AS v FROM my_table WHERE index = 123';

        expect(await service.queryValueToPromise(query)).toEqual(null);
        expect(service.query).toHaveBeenCalledTimes(1);
        expect(service.query).toHaveBeenCalledWith(query);
      }),
    );
  });

  describe('get helpers', () => {
    const result = 'mock result';
    const resultToObs = of(result);
    const resultToPromise = resultToObs.toPromise();
    const id = '123';
    const guid = id;

    beforeEach(() => {
      spyOn(service, 'queryValue').and.returnValue(resultToObs);
      spyOn(service, 'queryValueToPromise').and.returnValue(resultToPromise);
    });

    it(
      'clearCache',
      waitForAsync(async () => {
        expect(await service.getCreatureNameById(id)).toEqual(result);
        expect(await service.getCreatureNameById(id)).toEqual(result);
        expect(service.queryValue).toHaveBeenCalledTimes(1);
        service.clearCache();
        expect(await service.getCreatureNameById(id)).toEqual(result);
        expect(service.queryValue).toHaveBeenCalledTimes(2);
      }),
    );

    for (const test of [
      { name: 'getCreatureNameById', query: `SELECT name AS v FROM creature_template WHERE entry = ${id}` },
      {
        name: 'getCreatureNameByGuid',
        query: `SELECT name AS v FROM creature_template AS ct INNER JOIN creature AS c ON ct.entry = c.id1 WHERE c.guid = ${guid}`,
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
    ]) {
      it(
        test.name,
        waitForAsync(async () => {
          expect(await service[test.name](id)).toEqual(result);
          expect(await service[test.name](id)).toEqual(result); // check cache
          expect(service.queryValue).toHaveBeenCalledTimes(1); // check cache
          expect(service.queryValue).toHaveBeenCalledWith(test.query);
          expect(Object.keys(service['cache']).length).toBe(1);
          expect(Object.keys(service['cache'])[0]).toBe(test.name);
        }),
      );
    }

    it('getDisplayIdByItemId (case non-null)', () => {
      service.getDisplayIdByItemId(id).subscribe((res) => {
        expect(res).toEqual(result);
      });
      expect(service.queryValue).toHaveBeenCalledWith(`SELECT displayid AS v FROM item_template WHERE entry = ${id}`);
      expect(Object.keys(service['cache']).length).toBe(1);
      expect(Object.keys(service['cache'])[0]).toBe('getDisplayIdByItemId');
    });

    it('getDisplayIdByItemId (case null)', () => {
      service.getDisplayIdByItemId(null).subscribe((res) => {
        expect(res).toEqual(null);
      });
      expect(service.queryValue).toHaveBeenCalledTimes(0);
    });

    it('getQuestTitleByCriteria (case 1)', () => {
      expect(service.getQuestTitleByCriteria(null, 2, 3, 4, 5)).toEqual(resultToPromise);
      expect(service.queryValueToPromise).toHaveBeenCalledWith(
        'SELECT `LogTitle` AS "v" FROM `quest_template` WHERE (RequiredNpcOrGo2 = 2) AND (RequiredNpcOrGo3 = 3) AND (RequiredNpcOrGo4 = 4) AND (RequiredSpellCast1 = 5)',
      );
    });

    it('getQuestTitleByCriteria (case 2)', () => {
      expect(service.getQuestTitleByCriteria(1, null, null, null)).toEqual(resultToPromise);
      expect(service.queryValueToPromise).toHaveBeenCalledWith(
        'SELECT `LogTitle` AS "v" FROM `quest_template` WHERE (RequiredNpcOrGo1 = 1)',
      );
    });

    it(
      'getNextQuestById',
      waitForAsync(async () => {
        expect(await service.getNextQuestById(id)).toEqual(result);
        expect(await service.getNextQuestById(id)).toEqual(result); // check cache
        expect(service.queryValue).toHaveBeenCalledTimes(1); // check cache
        expect(service.queryValue).toHaveBeenCalledWith(`SELECT NextQuestID AS v FROM quest_template_addon WHERE id = ${id}`);
        expect(Object.keys(service['cache']).length).toBe(1);
        expect(Object.keys(service['cache'])[0]).toBe('getNextQuest2');
      }),
    );

    it(
      'getNextQuestById (usingPrev)',
      waitForAsync(async () => {
        expect(await service.getNextQuestById(id, true)).toEqual(result);
        expect(await service.getNextQuestById(id, true)).toEqual(result); // check cache
        expect(service.queryValue).toHaveBeenCalledTimes(1); // check cache
        expect(service.queryValue).toHaveBeenCalledWith(`SELECT id AS v FROM quest_template_addon WHERE PrevQuestID = ${id}`);
        expect(Object.keys(service['cache']).length).toBe(1);
        expect(Object.keys(service['cache'])[0]).toBe('getNextQuest1');
      }),
    );

    it(
      'getReputationRewardByFaction (usingPrev)',
      waitForAsync(async () => {
        spyOn(service, 'query').and.returnValue(of([]));
        expect(await service.getReputationRewardByFaction(id)).toEqual([]);
        expect(await service.getReputationRewardByFaction(id)).toEqual([]); // check cache
        expect(service.query).toHaveBeenCalledTimes(1); // check cache
        expect(service.query).toHaveBeenCalledWith(`SELECT * FROM reputation_reward_rate WHERE faction = ${id}`);
        expect(Object.keys(service['cache']).length).toBe(1);
        expect(Object.keys(service['cache'])[0]).toBe('getReputationRewardByFaction');
      }),
    );
  });
});
