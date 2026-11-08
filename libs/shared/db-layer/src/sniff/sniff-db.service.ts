import { inject, Service, signal } from '@angular/core';
import { TableRow } from '@keira/shared/constants';
import { escape } from 'sqlstring';
import { firstValueFrom } from 'rxjs';
import { MysqlQueryService } from '../query/mysql-query.service';
import {
  alterTableSql,
  createTableSql,
  insertSql,
  isSniffDatabaseName,
  parseInsert,
  SNIFF_FILE_COLUMN,
  SNIFF_FILES_TABLE,
  serverColumnType,
  SniffColumnType,
  SqlStatementSplitter,
} from './sniff-sql';

export const SNIFF_DB_KEY = 'keira3.sniffDatabase';
export const DEFAULT_SNIFF_DB = 'acore_wpp_keira';

/** A table of the sniff database, with its rows. */
export interface SniffTable {
  name: string;
  rows: number;
}

/** A file loaded into the sniff database (`name`: its path). */
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

type Rotation = [number, number, number, number];

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
  /** gameobject.rotation0..3 (x, y, z, w), when the sniff has them. */
  rotation?: Rotation;
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
   * widened as its rows need. The file comes in pieces (`chunks`: read a piece at a time, never whole); `size` is its
   * length, for the progress. A file already loaded (same path and size) is left as it is, and one that fails partway
   * is taken out again (rows and entry), so it can be loaded once fixed.
   */
  async importSql(
    path: string,
    size: number,
    chunks: AsyncIterable<string> | Iterable<string>,
    progress?: (done: number, total: number) => void,
  ): Promise<SniffImportResult> {
    const result: SniffImportResult = { file: path, rows: 0, tables: [], skipped: 0 };
    const find = () => this.run(`SELECT id FROM ${this.db}.\`${SNIFF_FILES_TABLE}\` WHERE name = ? AND size = ?`, [path, String(size)]);
    if ((await find()).length) {
      return { ...result, alreadyLoaded: true };
    }
    await this.run(`INSERT INTO ${this.db}.\`${SNIFF_FILES_TABLE}\` (name, size) VALUES (${escape(path)}, ${Math.trunc(size)})`);
    const fileId = Number((await find())[0]['id']);
    const known = new Map<string, Map<string, SniffColumnType>>();
    const splitter = new SqlStatementSplitter();
    let done = 0;
    try {
      for await (const chunk of chunks) {
        for (const statement of splitter.push(chunk)) {
          await this.importStatement(statement, fileId, known, result);
        }
        done += chunk.length;
        progress?.(Math.min(done, size), size);
      }
      for (const statement of splitter.finish()) {
        await this.importStatement(statement, fileId, known, result);
      }
    } catch (error) {
      await this.removeFile(fileId).catch(() => undefined);
      throw error;
    }
    progress?.(size, size);
    return result;
  }

  private async importStatement(
    statement: string,
    fileId: number,
    known: Map<string, Map<string, SniffColumnType>>,
    result: SniffImportResult,
  ): Promise<void> {
    const insert = parseInsert(statement);
    const sql = insert && insertSql(this.database(), insert, fileId);
    if (!insert || !sql) {
      result.skipped++;
      return;
    }
    let columns = known.get(insert.table);
    if (!columns) {
      await this.run(createTableSql(this.database(), insert));
      const rows = await this.run(
        'SELECT COLUMN_NAME AS name, DATA_TYPE AS type FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
        [this.database(), insert.table],
      );
      columns = new Map(rows.map((row) => [String(row['name']), serverColumnType(String(row['type']))]));
      known.set(insert.table, columns);
    }
    const alter = alterTableSql(this.database(), insert, columns);
    if (alter) {
      await this.run(alter);
    }
    await this.run(sql);
    result.rows += insert.rows.length;
    if (!result.tables.includes(insert.table)) {
      result.tables.push(insert.table);
    }
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

  /**
   * The spawns the sniffs saw on a map around a place (empty when the sniff database or its tables aren't there; a
   * gameobject table without rotations read without them).
   */
  async spawnsNear(map: number, x: number, y: number, radius: number): Promise<SniffSpawn[]> {
    const near = (type: 'creature' | 'gameobject', withRotation: boolean): Promise<SniffSpawn[]> => {
      const wander = type === 'creature' ? 'wander_distance' : '0';
      const movement = type === 'creature' ? 'movement_type' : '0';
      const rotation = withRotation ? ', rotation0 AS r0, rotation1 AS r1, rotation2 AS r2, rotation3 AS r3' : '';
      return this.run(
        `SELECT id, map, position_x AS x, position_y AS y, position_z AS z, orientation AS o, ${wander} AS wander, ${movement} AS movement${rotation}, ` +
          `${SNIFF_FILE_COLUMN} AS file FROM ${this.db}.\`${type}\` WHERE map = ${Math.trunc(map)} ` +
          `AND position_x BETWEEN ${x - radius} AND ${x + radius} AND position_y BETWEEN ${y - radius} AND ${y + radius} LIMIT 2000`,
      ).then(
        (rows) =>
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
            ...(withRotation ? { rotation: [row['r0'], row['r1'], row['r2'], row['r3']].map((value) => Number(value ?? 0)) as Rotation } : {}),
            file: Number(row['file']),
          })),
        () => (withRotation ? near(type, false) : []),
      );
    };
    const [creatures, gameobjects] = await Promise.all([near('creature', false), near('gameobject', true)]);
    return [...creatures, ...gameobjects];
  }
}
