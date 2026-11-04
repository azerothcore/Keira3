import {
  alterTableSql,
  columnType,
  columnTypes,
  createTableSql,
  insertSql,
  isSniffDatabaseName,
  isSqlLiteral,
  parseInsert,
  serverColumnType,
  SniffColumnType,
  splitSqlStatements,
  sqlValue,
  SqlStatementSplitter,
  unquote,
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
    expect(splitSqlStatements('a - b / c -')).toEqual(['a - b / c -']);
    expect(splitSqlStatements('a /* x */ b; c */ d')).toEqual(['a  b', 'c */ d']);

    const pieces = new SqlStatementSplitter();
    expect([...pieces.push('a '), ...pieces.push('-'), ...pieces.push(' b /'), ...pieces.push(' c'), ...pieces.finish()]).toEqual(['a - b / c']);
    // read in pieces, cut anywhere: the same statements
    const whole = splitSqlStatements(text + '\nSELECT 1 - 2 / 3; x /* y * / z */ w; q-');
    const all = text + '\nSELECT 1 - 2 / 3; x /* y * / z */ w; q-';
    for (let size = 1; size <= 7; size++) {
      const splitter = new SqlStatementSplitter();
      const statements: string[] = [];
      for (let i = 0; i < all.length; i += size) {
        statements.push(...splitter.push(all.slice(i, i + size)));
      }
      expect([...statements, ...splitter.finish()]).toEqual(whole);
    }
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
    expect(parseInsert("INSERT INTO t (a, b) VALUES ('it''s', 'a\\'b'), ('open")?.rows).toEqual([["'it''s'", "'a\\'b'"], ["'open"]]);
    expect(parseInsert('DELETE FROM `creature`')).toBeUndefined();
  });

  it('types columns from all their rows, and takes only plain values', () => {
    expect(['12', '-3', '1.5', '-.5', '2e3', '1.5E-2', "'x'", 'NULL'].map(columnType)).toEqual([
      'BIGINT',
      'BIGINT',
      'DOUBLE',
      'DOUBLE',
      'DOUBLE',
      'DOUBLE',
      'TEXT',
      undefined,
    ]);
    const types = columnTypes({
      table: 't',
      columns: ['guid', 'id', 'orientation', 'note', 'empty'],
      rows: [
        ['@CGUID+0', '6', '0', 'NULL', 'NULL'],
        ['@CGUID+1', '7', '0', "'x'", 'NULL'],
        ['@CGUID+2', '8.5'],
      ],
    });
    expect(Object.fromEntries(types)).toEqual({ guid: 'BIGINT', id: 'DOUBLE', orientation: 'DOUBLE', note: 'TEXT', empty: 'BIGINT' });
    expect(['int', 'bigint', 'double', 'float', 'varchar', 'text'].map(serverColumnType)).toEqual([
      'BIGINT',
      'BIGINT',
      'DOUBLE',
      'DOUBLE',
      'TEXT',
      'TEXT',
    ]);
    expect(["'a''b'", "'a\\'b'", '"q"', 'null', '-1.5e2', '.5'].every(isSqlLiteral)).toBe(true);
    expect(["'a'b'", '(SELECT 1)', '1); DROP TABLE x', 'abc', ''].some(isSqlLiteral)).toBe(false);
  });

  it('sends texts as hexadecimal, so nothing in them can end the string', () => {
    expect(unquote("'it''s \\'q\\' a\\nb \\\\ \\%'")).toBe("it's 'q' a\nb \\ %");
    expect(unquote('"say ""hi"""')).toBe('say "hi"');
    expect(sqlValue("'Kob'")).toBe("_utf8mb4 X'4b6f62'");
    expect(sqlValue("'é'")).toBe("_utf8mb4 X'c3a9'");
    expect(sqlValue("''")).toBe("''");
    expect(sqlValue('1.5')).toBe('1.5');
    expect(sqlValue('NULL')).toBe('NULL');
    // what would end the string on a server with NO_BACKSLASH_ESCAPES stays inside the literal
    expect(sqlValue("'\\'; DROP DATABASE acore_world; -- '")).toMatch(/^_utf8mb4 X'[0-9a-f]+'$/);
  });

  it('creates, widens and fills the tables in the sniff database, with the file of each row', () => {
    const insert = { table: 'creature', columns: ['guid', 'id', 'map', 'position_x', 'name'], rows: [['1', '6', '0', '1', "'Kob'"]] };
    expect(createTableSql('acore_wpp_keira', insert)).toBe(
      'CREATE TABLE IF NOT EXISTS `acore_wpp_keira`.`creature` (`guid` BIGINT NULL, `id` BIGINT NULL, `map` BIGINT NULL, ' +
        '`position_x` DOUBLE NULL, `name` TEXT NULL, `keira_file` INT NOT NULL, KEY `k_map` (`map`), KEY `k_id` (`id`))',
    );
    // a text column with an index is a VARCHAR
    expect(createTableSql('db', { table: 'x', columns: ['entry', 'a'], rows: [["'x'", "'y'"]] })).toBe(
      'CREATE TABLE IF NOT EXISTS `db`.`x` (`entry` VARCHAR(191) NULL, `a` TEXT NULL, `keira_file` INT NOT NULL, KEY `k_entry` (`entry`))',
    );
    const known = new Map<string, SniffColumnType>([
      ['guid', 'BIGINT'],
      ['id', 'BIGINT'],
      ['map', 'BIGINT'],
    ]);
    expect(alterTableSql('db', insert, known)).toBe('ALTER TABLE `db`.`creature` ADD COLUMN `position_x` DOUBLE NULL, ADD COLUMN `name` TEXT NULL');
    expect(alterTableSql('db', insert, known)).toBeUndefined();
    expect(alterTableSql('db', { ...insert, rows: [['1', "'6a'", '0.5', '1', "'Kob'"]] }, known)).toBe(
      'ALTER TABLE `db`.`creature` MODIFY COLUMN `id` VARCHAR(191) NULL, MODIFY COLUMN `map` DOUBLE NULL',
    );
    expect(known.get('id')).toBe('TEXT');
    expect(insertSql('db', insert, 3)).toBe(
      "INSERT INTO `db`.`creature` (`guid`, `id`, `map`, `position_x`, `name`, `keira_file`) VALUES\n(1, 6, 0, 1, _utf8mb4 X'4b6f62', 3)",
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
