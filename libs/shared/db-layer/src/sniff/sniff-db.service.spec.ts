import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { MysqlService } from '../mysql.service';
import { MysqlQueryService } from '../query/mysql-query.service';
import { DEFAULT_SNIFF_DB, SNIFF_DB_KEY, SniffDbService } from './sniff-db.service';

describe('SniffDbService', () => {
  const setup = (stored?: string) => {
    localStorage.clear();
    if (stored !== undefined) {
      localStorage.setItem(SNIFF_DB_KEY, stored);
    }
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: MysqlService, useValue: instance(mock(MysqlService)) }],
    });
    const query = vi.spyOn(TestBed.inject(MysqlQueryService), 'query');
    return { service: TestBed.inject(SniffDbService), query };
  };

  afterEach(() => localStorage.clear());

  it('keeps its database name, acore_wpp_keira by default, refusing odd names', () => {
    expect(setup().service.database()).toBe(DEFAULT_SNIFF_DB);
    TestBed.resetTestingModule();
    expect(setup('bad name').service.database()).toBe(DEFAULT_SNIFF_DB);
    TestBed.resetTestingModule();
    const { service } = setup('my_sniffs');
    expect(service.database()).toBe('my_sniffs');
    expect(service.setDatabase('a;b')).toBe(false);
    expect(service.setDatabase('other')).toBe(true);
    expect(localStorage.getItem(SNIFF_DB_KEY)).toBe('other');
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    expect(service.setDatabase('third')).toBe(true);
    setItem.mockRestore();
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    TestBed.resetTestingModule();
    expect(setup().service.database()).toBe(DEFAULT_SNIFF_DB);
    getItem.mockRestore();
  });

  it('creates the database and tells what it holds', async () => {
    const { service, query } = setup();
    query.mockImplementation(((sql: string) => {
      if (sql.includes('SCHEMATA')) {
        return of([{ SCHEMA_NAME: 'acore_wpp_keira' }]);
      }
      if (sql.includes('information_schema.TABLES')) {
        return of([
          { name: 'creature', count: '5' },
          { name: 'gameobject', count: null },
        ]);
      }
      if (sql.includes('FROM `acore_wpp_keira`.`keira_sniff_file`')) {
        return of([{ id: '1', name: 'a.sql', size: '10' }]);
      }
      return of(undefined);
    }) as never);

    await service.create();
    expect(query.mock.calls[0][0]).toBe('CREATE DATABASE IF NOT EXISTS `acore_wpp_keira` CHARACTER SET utf8mb4');
    expect(query.mock.calls[1][0]).toContain('CREATE TABLE IF NOT EXISTS `acore_wpp_keira`.`keira_sniff_file`');
    expect(await service.exists()).toBe(true);
    expect(await service.tables()).toEqual([
      { name: 'creature', rows: 5 },
      { name: 'gameobject', rows: 0 },
    ]);
    expect(await service.files()).toEqual([{ id: 1, name: 'a.sql', size: 10 }]);
  });

  it('loads a sniff file into its own database only, creating and widening tables, skipping what is not an INSERT', async () => {
    const { service, query } = setup();
    query.mockImplementation(((sql: string, values?: string[]) => {
      if (sql.startsWith('SELECT id FROM') && values?.[0] === 'loaded.sql') {
        return of([{ id: 4 }]);
      }
      if (sql.startsWith('SELECT id FROM')) {
        return query.mock.calls.filter(([s]) => String(s).startsWith('INSERT INTO `acore_wpp_keira`.`keira_sniff_file`')).length
          ? of([{ id: 7 }])
          : of([]);
      }
      if (sql.includes('information_schema.COLUMNS')) {
        return of([
          { name: 'guid', type: 'bigint' },
          { name: 'id', type: 'bigint' },
          { name: 'keira_file', type: 'int' },
        ]);
      }
      return of(undefined);
    }) as never);
    const progress = vi.fn();

    const text = [
      'DELETE FROM `creature` WHERE `id` = 6;',
      'INSERT INTO `creature` (`guid`, `id`) VALUES (1, 6), (2, 6);',
      'INSERT INTO `creature` (`guid`, `id`, `map`) VALUES (3, 7, 0);',
      'INSERT INTO `gameobject` (`guid`, `id`) VALUES (1, (SELECT 1));',
      'INSERT INTO `creature` (`guid`, `id`) VALUES (4, 8.5);',
    ].join('\n');
    // read in pieces
    const chunks = (async function* () {
      yield text.slice(0, 50);
      yield await Promise.resolve(text.slice(50));
    })();
    const result = await service.importSql('a.sql', text.length, chunks, progress);

    expect(result).toEqual({ file: 'a.sql', rows: 4, tables: ['creature'], skipped: 2 });
    const sql = query.mock.calls.map(([s]) => String(s));
    expect(sql).toContain(`INSERT INTO \`acore_wpp_keira\`.\`keira_sniff_file\` (name, size) VALUES ('a.sql', ${text.length})`);
    expect(sql.filter((s) => s.startsWith('CREATE TABLE IF NOT EXISTS `acore_wpp_keira`.`creature`')).length).toBe(1);
    expect(sql).toContain('ALTER TABLE `acore_wpp_keira`.`creature` ADD COLUMN `map` BIGINT NULL');
    // a decimal in a whole number column widens it
    expect(sql).toContain('ALTER TABLE `acore_wpp_keira`.`creature` MODIFY COLUMN `id` DOUBLE NULL');
    expect(sql).toContain('INSERT INTO `acore_wpp_keira`.`creature` (`guid`, `id`, `keira_file`) VALUES\n(1, 6, 7),\n(2, 6, 7)');
    expect(sql.some((s) => /^(DELETE|INSERT INTO `creature`|INSERT INTO `gameobject`)/.test(s))).toBe(false);
    expect(progress).toHaveBeenCalledWith(50, text.length);
    expect(progress).toHaveBeenLastCalledWith(text.length, text.length);

    expect(await service.importSql('loaded.sql', 1, [text])).toEqual({
      file: 'loaded.sql',
      rows: 0,
      tables: [],
      skipped: 0,
      alreadyLoaded: true,
    });
    expect((await service.importSql('b.sql', 1, [''])).rows).toBe(0);
  });

  it('takes a file out again when it fails partway, so it can be loaded once fixed', async () => {
    const { service, query } = setup();
    query.mockImplementation(((sql: string) => {
      if (sql.startsWith('SELECT id FROM')) {
        return of([{ id: 7 }].filter(() => query.mock.calls.some(([s]) => String(s).startsWith('INSERT INTO `acore_wpp_keira`.`keira_sniff_file`'))));
      }
      if (sql.includes('information_schema.COLUMNS') && sql.includes('COLUMN_NAME = ?')) {
        return of([{ name: 'creature' }]);
      }
      if (sql.startsWith('INSERT INTO `acore_wpp_keira`.`creature`')) {
        return throwError(() => new Error('Out of range value'));
      }
      return of([]);
    }) as never);
    await expect(service.importSql('a.sql', 1, ['INSERT INTO `creature` (`guid`) VALUES (1)'])).rejects.toThrow('Out of range value');
    const sql = query.mock.calls.map(([s]) => String(s));
    expect(sql).toContain('DELETE FROM `acore_wpp_keira`.`creature` WHERE `keira_file` = 7');
    expect(sql).toContain('DELETE FROM `acore_wpp_keira`.`keira_sniff_file` WHERE id = 7');
  });

  it("forgets a file's rows in every table", async () => {
    const { service, query } = setup();
    query.mockImplementation(((sql: string) =>
      sql.includes('information_schema.COLUMNS') ? of([{ name: 'creature' }, { name: 'gameobject' }]) : of(undefined)) as never);
    await service.removeFile(3);
    const sql = query.mock.calls.map(([s]) => String(s));
    expect(sql).toContain('DELETE FROM `acore_wpp_keira`.`creature` WHERE `keira_file` = 3');
    expect(sql).toContain('DELETE FROM `acore_wpp_keira`.`gameobject` WHERE `keira_file` = 3');
    expect(sql).toContain('DELETE FROM `acore_wpp_keira`.`keira_sniff_file` WHERE id = 3');
  });

  it('reads the spawns the sniffs saw around a place, nothing when it cannot', async () => {
    const { service, query } = setup();
    query.mockImplementation(((sql: string) =>
      sql.includes('`creature`')
        ? of([{ id: '6', map: '0', x: '1', y: '2', z: '3', o: null, wander: '5', movement: '1', file: '2' }])
        : throwError(() => new Error('no table'))) as never);

    expect(await service.spawnsNear(0, 10, 20, 100)).toEqual([
      { type: 'creature', entry: 6, map: 0, x: 1, y: 2, z: 3, o: 0, wanderDistance: 5, movementType: 1, file: 2 },
    ]);
    const sql = query.mock.calls.map(([s]) => String(s));
    expect(sql[0]).toContain('FROM `acore_wpp_keira`.`creature` WHERE map = 0 AND position_x BETWEEN -90 AND 110');
    // the gameobjects with their rotations, then without them
    expect(sql[1]).toContain('0 AS wander, 0 AS movement, rotation0 AS r0');
    expect(sql[2]).toContain('0 AS movement, keira_file AS file FROM `acore_wpp_keira`.`gameobject`');

    query.mockReturnValue(
      of([{ id: '9', map: '0', x: '1', y: '2', z: '3', o: '1', wander: null, movement: null, r0: '0.1', r3: '0.9', file: '1' }]) as never,
    );
    expect((await service.spawnsNear(0, 0, 0, 1))[1]).toEqual(
      expect.objectContaining({ type: 'gameobject', entry: 9, o: 1, wanderDistance: 0, movementType: 0, rotation: [0.1, 0, 0, 0.9] }),
    );
    query.mockReturnValue(of(undefined) as never);
    expect(await service.spawnsNear(0, 0, 0, 1)).toEqual([]);
  });
});
