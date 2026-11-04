import {
  addColumnsSql,
  columnType,
  createTableSql,
  insertSql,
  isSniffDatabaseName,
  isSqlLiteral,
  parseInsert,
  splitSqlStatements,
} from './sniff-sql';

describe('sniff SQL', () => {
  it('splits statements at semicolons outside quotes and comments', () => {
    const text = [
      '# TrinityCore - WowPacketParser',
      '-- a comment; with a semicolon',
      "DELETE FROM `t` WHERE `a` = 'x;y';",
      '/* block; comment */',
      'INSERT INTO `t` (`a`, `b`) VALUES',
      "(1, 'it''s; \\'fine\\''),",
      '(2, "dq;")  ;',
      ' ;',
      'SELECT `odd;name` FROM t;',
      "INSERT INTO `t` (`a`) VALUES ('unclosed",
    ].join('\n');
    expect(splitSqlStatements(text)).toEqual([
      "DELETE FROM `t` WHERE `a` = 'x;y'",
      "INSERT INTO `t` (`a`, `b`) VALUES\n(1, 'it''s; \\'fine\\''),\n(2, \"dq;\")",
      'SELECT `odd;name` FROM t',
      "INSERT INTO `t` (`a`) VALUES ('unclosed",
    ]);
    expect(splitSqlStatements('a -- end')).toEqual(['a']);
    expect(splitSqlStatements('a /* end')).toEqual(['a']);
  });

  it('reads an INSERT: its table, columns and rows', () => {
    expect(parseInsert("INSERT INTO `creature` (`guid`, `id`, `name`) VALUES\n(1, 6, 'Kob, (old)'),\n(2, 7, NULL)")).toEqual({
      table: 'creature',
      columns: ['guid', 'id', 'name'],
      rows: [
        ['1', '6', "'Kob, (old)'"],
        ['2', '7', 'NULL'],
      ],
    });
    expect(parseInsert('INSERT IGNORE INTO t (a) VALUES ("x")')?.rows).toEqual([['"x"']]);
    expect(parseInsert('DELETE FROM `creature`')).toBeUndefined();
  });

  it('types columns, and takes only plain values', () => {
    expect(['12', '-3', '1.5', '-.5', '2e3', '1.5E-2', "'x'", 'NULL'].map(columnType)).toEqual([
      'BIGINT',
      'BIGINT',
      'DOUBLE',
      'DOUBLE',
      'DOUBLE',
      'DOUBLE',
      'TEXT',
      'TEXT',
    ]);
    expect(["'a''b'", "'a\\'b'", '"q"', 'null', '-1.5e2', '.5'].every(isSqlLiteral)).toBe(true);
    expect(["'a'b'", '(SELECT 1)', '1); DROP TABLE x', 'abc', ''].some(isSqlLiteral)).toBe(false);
  });

  it('creates, widens and fills the tables in the sniff database, with the file of each row', () => {
    const insert = { table: 'creature', columns: ['guid', 'id', 'map', 'position_x', 'name'], rows: [['1', '6', '0', '1.5', "'Kob'"]] };
    expect(createTableSql('acore_wpp_keira', insert)).toBe(
      'CREATE TABLE IF NOT EXISTS `acore_wpp_keira`.`creature` (`guid` BIGINT NULL, `id` BIGINT NULL, `map` BIGINT NULL, ' +
        '`position_x` DOUBLE NULL, `name` TEXT NULL, `keira_file` INT NOT NULL, KEY `k_map` (`map`), KEY `k_id` (`id`))',
    );
    expect(createTableSql('db', { table: 'x', columns: ['a'], rows: [] })).toBe(
      'CREATE TABLE IF NOT EXISTS `db`.`x` (`a` TEXT NULL, `keira_file` INT NOT NULL)',
    );
    expect(addColumnsSql('db', insert, ['guid', 'id', 'map'])).toBe(
      'ALTER TABLE `db`.`creature` ADD COLUMN `position_x` DOUBLE NULL, ADD COLUMN `name` TEXT NULL',
    );
    expect(addColumnsSql('db', insert, insert.columns)).toBeUndefined();
    expect(addColumnsSql('db', { ...insert, rows: [] }, ['guid'])).toContain('`id` TEXT NULL');
    expect(insertSql('db', insert, 3)).toBe(
      "INSERT INTO `db`.`creature` (`guid`, `id`, `map`, `position_x`, `name`, `keira_file`) VALUES\n(1, 6, 0, 1.5, 'Kob', 3)",
    );
    expect(insertSql('db', { ...insert, rows: [['1', '6', '0', '1.5', '(SELECT 1)']] }, 3)).toBeUndefined();
    expect(insertSql('db', { ...insert, rows: [['1']] }, 3)).toBeUndefined();
    // WowPacketParser's world SQL numbers its guids from a variable
    expect(insertSql('db', { table: 't', columns: ['guid', 'g2'], rows: [['@CGUID+12', '@OGUID']] }, 1)).toContain('(12, 0, 1)');
  });

  it('takes database names of letters, digits and underscores', () => {
    expect(['acore_wpp_keira', 'x1'].every(isSniffDatabaseName)).toBe(true);
    expect(['', 'a-b', 'a`b', 'a b', 'x'.repeat(65)].some(isSniffDatabaseName)).toBe(false);
  });
});
