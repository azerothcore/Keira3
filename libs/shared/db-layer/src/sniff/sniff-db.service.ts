import { inject, Service, signal } from '@angular/core';
import { TableRow } from '@keira/shared/constants';
import { escape } from 'sqlstring';
import { firstValueFrom } from 'rxjs';
import { MysqlQueryService } from '../query/mysql-query.service';
import {
  addColumnsSql,
  createTableSql,
  insertSql,
  isSniffDatabaseName,
  parseInsert,
  SNIFF_FILE_COLUMN,
  SNIFF_FILES_TABLE,
  splitSqlStatements,
} from './sniff-sql';

export const SNIFF_DB_KEY = 'keira3.sniffDatabase';
export const DEFAULT_SNIFF_DB = 'acore_wpp_keira';

/** A table of the sniff database, with its rows. */
export interface SniffTable {
  name: string;
  rows: number;
}

/** A file loaded into the sniff database. */
export interface SniffFile {
  id: number;
  name: string;
  size: number;
}

/** What loading a file did: the rows added by table, the statements skipped (not INSERTs, or with odd values). */
export interface SniffImportResult {
  file: string;
  rows: number;
  tables: string[];
  skipped: number;
  alreadyLoaded?: boolean;
}

/** A spawn seen in a sniff (the sniff database's creature / gameobject rows). */
export interface SniffSpawn {
  type: 'creature' | 'gameobject';
  entry: number;
  map: number;
  x: number;
  y: number;
  z: number;
  o: number;
  wanderDistance: number;
  movementType: number;
  file: number;
}

function loadName(): string {
  try {
    const stored = localStorage.getItem(SNIFF_DB_KEY) ?? '';
    return isSniffDatabaseName(stored) ? stored : DEFAULT_SNIFF_DB;
  } catch {
    return DEFAULT_SNIFF_DB;
  }
}

/**
 * Keira's sniff database (a database of its own on the MySQL server, never the world's): created with the connection's
 * login, loaded from sniff SQL files, and read for what the sniffs saw.
 */
@Service()
export class SniffDbService {
  private readonly queryService = inject(MysqlQueryService);
  private readonly _database = signal(loadName());
  readonly database = this._database.asReadonly();

  setDatabase(database: string): boolean {
    if (!isSniffDatabaseName(database)) {
      return false;
    }
    this._database.set(database);
    try {
      localStorage.setItem(SNIFF_DB_KEY, database);
    } catch {
      // (not kept)
    }
    return true;
  }

  private run<T extends TableRow = TableRow>(sql: string, values?: string[]): Promise<T[]> {
    return firstValueFrom(this.queryService.query<T>(sql, values)).then((rows) => rows ?? []);
  }

  private get db(): string {
    return `\`${this.database()}\``;
  }

  /** Creates the sniff database and its table of loaded files (nothing when they are there). */
  async create(): Promise<void> {
    await this.run(`CREATE DATABASE IF NOT EXISTS ${this.db} CHARACTER SET utf8mb4`);
    await this.run(
      `CREATE TABLE IF NOT EXISTS ${this.db}.\`${SNIFF_FILES_TABLE}\` (\`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY, ` +
        '`name` VARCHAR(512) NOT NULL, `size` BIGINT NOT NULL, `loaded` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY `file` (`name`, `size`))',
    );
  }

  /** Whether the sniff database is there. */
  async exists(): Promise<boolean> {
    const rows = await this.run('SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?', [this.database()]);
    return rows.length > 0;
  }

  /** Its tables and their rows (as the server estimates them). */
  async tables(): Promise<SniffTable[]> {
    const rows = await this.run(
      'SELECT TABLE_NAME AS name, TABLE_ROWS AS count FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
      [this.database()],
    );
    return rows.map((row) => ({ name: String(row['name']), rows: Number(row['count'] ?? 0) }));
  }

  /** The files loaded. */
  async files(): Promise<SniffFile[]> {
    const rows = await this.run(`SELECT id, name, size FROM ${this.db}.\`${SNIFF_FILES_TABLE}\` ORDER BY id`);
    return rows.map((row) => ({ id: Number(row['id']), name: String(row['name']), size: Number(row['size']) }));
  }

  /**
   * Loads a sniff SQL file's rows (its INSERTs; nothing else is run) into the sniff database, each table created or
   * widened as its rows need. A file already loaded (same name and size) is left as it is.
   */
  async importSql(
    fileName: string,
    size: number,
    text: string,
    progress?: (done: number, total: number) => void,
  ): Promise<SniffImportResult> {
    const result: SniffImportResult = { file: fileName, rows: 0, tables: [], skipped: 0 };
    const [loaded] = await this.run(`SELECT id FROM ${this.db}.\`${SNIFF_FILES_TABLE}\` WHERE name = ? AND size = ?`, [
      fileName,
      String(size),
    ]);
    if (loaded) {
      return { ...result, alreadyLoaded: true };
    }
    await this.run(`INSERT INTO ${this.db}.\`${SNIFF_FILES_TABLE}\` (name, size) VALUES (${escape(fileName)}, ${Math.trunc(size)})`);
    const [file] = await this.run(`SELECT id FROM ${this.db}.\`${SNIFF_FILES_TABLE}\` WHERE name = ? AND size = ?`, [
      fileName,
      String(size),
    ]);
    const fileId = Number(file['id']);
    const columns = new Map<string, string[]>();
    const statements = splitSqlStatements(text);
    for (const [index, statement] of statements.entries()) {
      progress?.(index, statements.length);
      const insert = parseInsert(statement);
      const sql = insert && insertSql(this.database(), insert, fileId);
      if (!insert || !sql) {
        result.skipped++;
        continue;
      }
      let known = columns.get(insert.table);
      if (!known) {
        await this.run(createTableSql(this.database(), insert));
        const rows = await this.run(
          'SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
          [this.database(), insert.table],
        );
        known = rows.map((row) => String(row['name']));
      }
      const widen = addColumnsSql(this.database(), insert, known);
      if (widen) {
        await this.run(widen);
        known = [...known, ...insert.columns.filter((column) => !known?.includes(column))];
      }
      columns.set(insert.table, known);
      await this.run(sql);
      result.rows += insert.rows.length;
      if (!result.tables.includes(insert.table)) {
        result.tables.push(insert.table);
      }
    }
    progress?.(statements.length, statements.length);
    return result;
  }

  /** Forgets a loaded file: its rows in every table, and its entry. */
  async removeFile(fileId: number): Promise<void> {
    const tables = await this.run('SELECT TABLE_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND COLUMN_NAME = ?', [
      this.database(),
      SNIFF_FILE_COLUMN,
    ]);
    for (const table of tables) {
      await this.run(`DELETE FROM ${this.db}.\`${String(table['name'])}\` WHERE \`${SNIFF_FILE_COLUMN}\` = ${Math.trunc(fileId)}`);
    }
    await this.run(`DELETE FROM ${this.db}.\`${SNIFF_FILES_TABLE}\` WHERE id = ${Math.trunc(fileId)}`);
  }

  /** The spawns the sniffs saw on a map around a place (empty when the sniff database or its tables aren't there). */
  async spawnsNear(map: number, x: number, y: number, radius: number): Promise<SniffSpawn[]> {
    const near = (type: 'creature' | 'gameobject') => {
      const wander = type === 'creature' ? 'wander_distance' : '0';
      const movement = type === 'creature' ? 'movement_type' : '0';
      return this.run(
        `SELECT id, map, position_x AS x, position_y AS y, position_z AS z, orientation AS o, ${wander} AS wander, ${movement} AS movement, ` +
          `${SNIFF_FILE_COLUMN} AS file FROM ${this.db}.\`${type}\` WHERE map = ${Math.trunc(map)} ` +
          `AND position_x BETWEEN ${x - radius} AND ${x + radius} AND position_y BETWEEN ${y - radius} AND ${y + radius} LIMIT 2000`,
      )
        .then((rows) =>
          rows.map((row) => ({
            type,
            entry: Number(row['id']),
            map: Number(row['map']),
            x: Number(row['x']),
            y: Number(row['y']),
            z: Number(row['z']),
            o: Number(row['o'] ?? 0),
            wanderDistance: Number(row['wander'] ?? 0),
            movementType: Number(row['movement'] ?? 0),
            file: Number(row['file']),
          })),
        )
        .catch(() => [] as SniffSpawn[]);
    };
    const [creatures, gameobjects] = await Promise.all([near('creature'), near('gameobject')]);
    return [...creatures, ...gameobjects];
  }
}
