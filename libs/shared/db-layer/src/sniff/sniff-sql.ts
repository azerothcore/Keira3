/**
 * Reading sniff SQL files (WowPacketParser's sniff database output: `INSERT INTO` rows, no `CREATE TABLE`) to load them
 * into Keira's own sniff database, never the world's: only INSERTs are taken, each sent to that database by name, with
 * the file it came from (sniffs reuse their ids: loot ids, guids…).
 */

/** The statements of an SQL text, split at the semicolons outside quotes and comments (without the comments). */
export function splitSqlStatements(text: string): string[] {
  const statements: string[] = [];
  let current = '';
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    const next = text[i + 1];
    if (c === "'" || c === '"' || c === '`') {
      const end = quotedEnd(text, i);
      current += text.slice(i, end);
      i = end;
    } else if ((c === '-' && next === '-') || c === '#') {
      // a line comment
      const end = text.indexOf('\n', i);
      i = end < 0 ? text.length : end;
    } else if (c === '/' && next === '*') {
      const end = text.indexOf('*/', i + 2);
      i = end < 0 ? text.length : end + 2;
    } else if (c === ';') {
      if (current.trim()) {
        statements.push(current.trim());
      }
      current = '';
      i++;
    } else {
      current += c;
      i++;
    }
  }
  if (current.trim()) {
    statements.push(current.trim());
  }
  return statements;
}

/** Where a quoted text starting at `start` ends (after its closing quote): backslash escapes and doubled quotes. */
function quotedEnd(text: string, start: number): number {
  const quote = text[start];
  let i = start + 1;
  while (i < text.length) {
    if (text[i] === '\\' && quote !== '`') {
      i += 2;
    } else if (text[i] === quote) {
      if (text[i + 1] === quote) {
        i += 2;
      } else {
        return i + 1;
      }
    } else {
      i++;
    }
  }
  return text.length;
}

/** An `INSERT INTO table (columns) VALUES (…), (…)` statement read: its table, columns and rows (each row's values as written). */
export interface SniffInsert {
  table: string;
  columns: string[];
  rows: string[][];
}

const INSERT = /^INSERT\s+(?:IGNORE\s+)?INTO\s+`?([A-Za-z0-9_]+)`?\s*\(([^)]*)\)\s*VALUES\s*/i;

/** An INSERT statement read; undefined for any other statement (they are not loaded). */
export function parseInsert(statement: string): SniffInsert | undefined {
  const head = INSERT.exec(statement);
  if (!head) {
    return undefined;
  }
  const columns = head[2].split(',').map((column) => column.trim().replace(/`/g, ''));
  const rows: string[][] = [];
  let i = head[0].length;
  const text = statement;
  while (i < text.length) {
    if (text[i] !== '(') {
      i++;
      continue;
    }
    // a row: values separated by commas outside quotes
    const values: string[] = [];
    let value = '';
    i++;
    while (i < text.length && text[i] !== ')') {
      if (text[i] === "'" || text[i] === '"') {
        const end = quotedEnd(text, i);
        value += text.slice(i, end);
        i = end;
      } else if (text[i] === ',') {
        values.push(value.trim());
        value = '';
        i++;
      } else {
        value += text[i];
        i++;
      }
    }
    values.push(value.trim());
    rows.push(values);
    i++;
  }
  return { table: head[1], columns, rows };
}

/** The column type for a value as written: integers, decimals, else text. */
export function columnType(value: string): 'BIGINT' | 'DOUBLE' | 'TEXT' {
  if (/^-?\d+$/.test(value)) {
    return 'BIGINT';
  }
  if (/^-?\d*\.\d+(?:[eE][-+]?\d+)?$|^-?\d+(?:\.\d*)?[eE][-+]?\d+$/.test(value)) {
    return 'DOUBLE';
  }
  return 'TEXT';
}

/** The column every loaded table gets: the file a row came from (keira_sniff_file.id). */
export const SNIFF_FILE_COLUMN = 'keira_file';
/** The table of the files loaded. */
export const SNIFF_FILES_TABLE = 'keira_sniff_file';

const name = (identifier: string): string => `\`${identifier.replace(/`/g, '``')}\``;

/** The CREATE TABLE of a table first met, its columns typed from its first row. */
export function createTableSql(database: string, insert: SniffInsert): string {
  const first = insert.rows[0] ?? [];
  const columns = insert.columns.map((column, i) => `${name(column)} ${columnType(first[i] ?? '')} NULL`);
  const indexes = ['map', 'id', 'entry', 'loot_id'].filter((column) => insert.columns.includes(column));
  return (
    `CREATE TABLE IF NOT EXISTS ${name(database)}.${name(insert.table)} (${[...columns, `${name(SNIFF_FILE_COLUMN)} INT NOT NULL`].join(', ')}` +
    indexes.map((column) => `, KEY ${name(`k_${column}`)} (${name(column)})`).join('') +
    ')'
  );
}

/** The ALTER TABLE adding the columns a later file has that the table lacks. */
export function addColumnsSql(database: string, insert: SniffInsert, known: string[]): string | undefined {
  const first = insert.rows[0] ?? [];
  const missing = insert.columns.map((column, i) => [column, first[i] ?? ''] as const).filter(([column]) => !known.includes(column));
  return missing.length
    ? `ALTER TABLE ${name(database)}.${name(insert.table)} ${missing.map(([column, value]) => `ADD COLUMN ${name(column)} ${columnType(value)} NULL`).join(', ')}`
    : undefined;
}

/** A value as a file may give it: a quoted text, NULL or a number (nothing else is run). */
export function isSqlLiteral(value: string): boolean {
  return (
    /^'(?:[^'\\]|\\[\s\S]|'')*'$/.test(value) ||
    /^"(?:[^"\\]|\\[\s\S]|"")*"$/.test(value) ||
    /^NULL$/i.test(value) ||
    /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/.test(value)
  );
}

/** A WowPacketParser guid variable (`@CGUID+12`) as its offset (12); any other value as it is. */
export function normalizeValue(value: string): string {
  const variable = /^@[A-Za-z_]+(?:\s*\+\s*(\d+))?$/.exec(value);
  return variable ? (variable[1] ?? '0') : value;
}

/** The INSERT of the rows into the sniff database, each with the file it came from; undefined when a value isn't a plain literal. */
export function insertSql(database: string, sniff: SniffInsert, fileId: number): string | undefined {
  const insert = { ...sniff, rows: sniff.rows.map((row) => row.map(normalizeValue)) };
  if (insert.rows.some((row) => row.length !== insert.columns.length || !row.every(isSqlLiteral))) {
    return undefined;
  }
  const columns = [...insert.columns, SNIFF_FILE_COLUMN].map(name).join(', ');
  const rows = insert.rows.map((row) => `(${[...row, String(Math.trunc(fileId))].join(', ')})`).join(',\n');
  return `INSERT INTO ${name(database)}.${name(insert.table)} (${columns}) VALUES\n${rows}`;
}

/** A database name Keira may create and load into: letters, digits and underscores. */
export function isSniffDatabaseName(database: string): boolean {
  return /^[A-Za-z0-9_]{1,64}$/.test(database);
}
