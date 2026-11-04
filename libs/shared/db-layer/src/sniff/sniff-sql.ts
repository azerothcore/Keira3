/**
 * Reading sniff SQL files (WowPacketParser's sniff database output: `INSERT INTO` rows, no `CREATE TABLE`) to load them
 * into Keira's own sniff database, never the world's: only INSERTs are taken, each sent to that database by name, with
 * the file it came from (sniffs reuse their ids: loot ids, guids…).
 */

/**
 * Splits SQL text read in pieces into statements, at the semicolons outside quotes and comments (dropping the comments):
 * a file is read a chunk at a time, never whole.
 */
export class SqlStatementSplitter {
  private parts: string[] = [];
  private state: 'code' | 'quote' | 'line' | 'block' = 'code';
  private quote = '';
  private escaped = false;
  /** A `-` or `/` that may start a comment, or a `*` that may end one, held until the next character. */
  private held = '';

  /** The statements ended in this piece. */
  push(chunk: string): string[] {
    const statements: string[] = [];
    let run = 0;
    const keep = (to: number) => to > run && this.parts.push(chunk.slice(run, to));
    for (let i = 0; i < chunk.length; i++) {
      const c = chunk[i];
      if (this.state === 'quote') {
        if (this.escaped) {
          this.escaped = false;
        } else if (c === '\\' && this.quote !== '`') {
          this.escaped = true;
        } else if (c === this.quote) {
          // (a doubled quote closes and opens again: kept as written)
          this.state = 'code';
        }
        continue;
      }
      if (this.state === 'line') {
        if (c === '\n') {
          this.state = 'code';
          run = i;
        }
        continue;
      }
      if (this.state === 'block') {
        if (this.held === '*' && c === '/') {
          this.state = 'code';
          this.held = '';
          run = i + 1;
        } else {
          this.held = c === '*' ? '*' : '';
        }
        continue;
      }
      if (this.held) {
        const held = this.held;
        this.held = '';
        if ((held === '-' && c === '-') || (held === '/' && c === '*')) {
          keep(i - 1);
          this.state = held === '-' ? 'line' : 'block';
          // (a `-` held from the previous piece was not kept)
          continue;
        }
        if (i === 0) {
          this.parts.push(held);
        }
      }
      if (c === "'" || c === '"' || c === '`') {
        this.state = 'quote';
        this.quote = c;
      } else if (c === '#') {
        keep(i);
        this.state = 'line';
      } else if (c === '-' || c === '/') {
        this.held = c;
        if (i === chunk.length - 1) {
          keep(i);
          run = i + 1;
        }
      } else if (c === ';') {
        keep(i);
        run = i + 1;
        this.end(statements);
      }
    }
    if (this.state === 'code' || this.state === 'quote') {
      keep(chunk.length);
    }
    return statements;
  }

  /** The statement left at the end of the text, if any. */
  finish(): string[] {
    const statements: string[] = [];
    if (this.held && this.state === 'code') {
      this.parts.push(this.held);
    }
    this.held = '';
    this.end(statements);
    return statements;
  }

  private end(statements: string[]): void {
    const statement = this.parts.join('').trim();
    this.parts = [];
    if (statement) {
      statements.push(statement);
    }
  }
}

/** The statements of an SQL text, split at the semicolons outside quotes and comments (without the comments). */
export function splitSqlStatements(text: string): string[] {
  const splitter = new SqlStatementSplitter();
  return [...splitter.push(text), ...splitter.finish()];
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

export type SniffColumnType = 'BIGINT' | 'DOUBLE' | 'TEXT';
const TYPE_RANK: Record<SniffColumnType, number> = { BIGINT: 0, DOUBLE: 1, TEXT: 2 };

/** The column type for a value as written: integers, decimals, else text (NULL: none). */
export function columnType(value: string): SniffColumnType | undefined {
  if (/^NULL$/i.test(value)) {
    return undefined;
  }
  if (/^-?\d+$/.test(value)) {
    return 'BIGINT';
  }
  if (/^-?\d*\.\d+(?:[eE][-+]?\d+)?$|^-?\d+(?:\.\d*)?[eE][-+]?\d+$/.test(value)) {
    return 'DOUBLE';
  }
  return 'TEXT';
}

/** The wider of two column types. */
export function widerType(a: SniffColumnType, b: SniffColumnType): SniffColumnType {
  return TYPE_RANK[a] >= TYPE_RANK[b] ? a : b;
}

/** Columns that are decimals even when a file writes them as whole numbers (`0`). */
const DECIMAL_COLUMN = /^(?:position_[xyz]|orientation|wander_distance|rotation\d|parent_rotation\d|speed_\w+|scale|bounding_radius|combat_reach)$/;

/** The type each column needs for all the rows of an INSERT (its values normalized). */
export function columnTypes(insert: SniffInsert): Map<string, SniffColumnType> {
  const types = new Map<string, SniffColumnType>();
  insert.columns.forEach((column, i) => {
    let type: SniffColumnType = DECIMAL_COLUMN.test(column) ? 'DOUBLE' : 'BIGINT';
    for (const row of insert.rows) {
      const value = columnType(normalizeValue(row[i] ?? 'NULL'));
      if (value) {
        type = widerType(type, value);
      }
    }
    types.set(column, type);
  });
  return types;
}

/** The type of a column as the server describes it (information_schema.COLUMNS.DATA_TYPE). */
export function serverColumnType(dataType: string): SniffColumnType {
  return /int/i.test(dataType) ? 'BIGINT' : /double|float|decimal/i.test(dataType) ? 'DOUBLE' : 'TEXT';
}

/** The column every loaded table gets: the file a row came from (keira_sniff_file.id). */
export const SNIFF_FILE_COLUMN = 'keira_file';
/** The table of the files loaded. */
export const SNIFF_FILES_TABLE = 'keira_sniff_file';
/** The columns given an index (what Keira looks spawns and loot up by). */
const KEYED = ['map', 'id', 'entry', 'loot_id'];

const name = (identifier: string): string => `\`${identifier.replace(/`/g, '``')}\``;
/** A column's SQL type: a text column with an index is a VARCHAR (TEXT can't have one without a length). */
const sqlType = (column: string, type: SniffColumnType): string => (type === 'TEXT' && KEYED.includes(column) ? 'VARCHAR(191)' : type);

/** The CREATE TABLE of a table first met, its columns typed from the rows of its first INSERT. */
export function createTableSql(database: string, insert: SniffInsert): string {
  const types = columnTypes(insert);
  const columns = insert.columns.map((column) => `${name(column)} ${sqlType(column, types.get(column) as SniffColumnType)} NULL`);
  const indexes = KEYED.filter((column) => insert.columns.includes(column));
  return (
    `CREATE TABLE IF NOT EXISTS ${name(database)}.${name(insert.table)} (${[...columns, `${name(SNIFF_FILE_COLUMN)} INT NOT NULL`].join(', ')}` +
    indexes.map((column) => `, KEY ${name(`k_${column}`)} (${name(column)})`).join('') +
    ')'
  );
}

/**
 * The ALTER TABLE a later INSERT needs: the columns the table lacks added, and those whose values no longer fit their
 * type (a decimal in a whole number column, a text in a number one) widened. `known` is updated with them.
 */
export function alterTableSql(database: string, insert: SniffInsert, known: Map<string, SniffColumnType>): string | undefined {
  const changes: string[] = [];
  for (const [column, type] of columnTypes(insert)) {
    const current = known.get(column);
    if (!current) {
      changes.push(`ADD COLUMN ${name(column)} ${sqlType(column, type)} NULL`);
      known.set(column, type);
    } else if (widerType(current, type) !== current) {
      changes.push(`MODIFY COLUMN ${name(column)} ${sqlType(column, type)} NULL`);
      known.set(column, type);
    }
  }
  return changes.length ? `ALTER TABLE ${name(database)}.${name(insert.table)} ${changes.join(', ')}` : undefined;
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

const ESCAPES: Record<string, string> = { '0': '\0', b: '\b', n: '\n', r: '\r', t: '\t', Z: '\x1a' };

/** The text of a quoted value as written in a file (backslash escapes and doubled quotes read). */
export function unquote(value: string): string {
  const quote = value[0];
  return value
    .slice(1, -1)
    .replace(new RegExp(`\\\\([\\s\\S])|${quote}${quote}`, 'g'), (match, escaped?: string) =>
      escaped === undefined ? quote : (ESCAPES[escaped] ?? escaped),
    );
}

/**
 * A value as sent to the server: a text as a hexadecimal literal (nothing in it can end the string, whatever the
 * server's SQL mode), numbers and NULL as written.
 */
export function sqlValue(value: string): string {
  if (value[0] !== "'" && value[0] !== '"') {
    return value;
  }
  const text = unquote(value);
  return text ? `_utf8mb4 X'${Array.from(new TextEncoder().encode(text), (byte) => byte.toString(16).padStart(2, '0')).join('')}'` : "''";
}

/** The INSERT of the rows into the sniff database, each with the file it came from; undefined when a value isn't a plain literal. */
export function insertSql(database: string, sniff: SniffInsert, fileId: number): string | undefined {
  const rows = sniff.rows.map((row) => row.map(normalizeValue));
  if (rows.some((row) => row.length !== sniff.columns.length || !row.every(isSqlLiteral))) {
    return undefined;
  }
  const columns = [...sniff.columns, SNIFF_FILE_COLUMN].map(name).join(', ');
  const values = rows.map((row) => `(${[...row.map(sqlValue), String(Math.trunc(fileId))].join(', ')})`).join(',\n');
  return `INSERT INTO ${name(database)}.${name(sniff.table)} (${columns}) VALUES\n${values}`;
}

/** A database name Keira may create and load into: letters, digits and underscores. */
export function isSniffDatabaseName(database: string): boolean {
  return /^[A-Za-z0-9_]{1,64}$/.test(database);
}
