import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ElectronService } from '@keira/shared/common-services';
import { SniffDbService, SniffFile, SniffImportResult, SniffTable } from '@keira/shared/db-layer';
import { TranslatePipe } from '@ngx-translate/core';
import { WppService } from './wpp.service';

/** How many lines of a program's output are kept on screen. */
export const LOG_LINES = 300;
/** How much of a sniff SQL file is read at a time (they can be hundreds of MB: never read whole). */
export const SQL_CHUNK = 1 << 20;

const message = (error: unknown): string =>
  (error as { sqlMessage?: string; message?: string })?.sqlMessage ?? (error as Error)?.message ?? String(error);

/**
 * Sniffs: Keira's sniff database (created on the MySQL server with Keira's login, never the world database), sniff SQL
 * files loaded into it, and WowPacketParser downloaded, built and run on a .pkt. The sniffs stay on this computer and
 * that server: nothing is sent anywhere else.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sniffs',
  templateUrl: './sniffs.component.html',
  imports: [FormsModule, TranslatePipe],
})
export class SniffsComponent implements OnInit {
  protected readonly sniffDb = inject(SniffDbService);
  protected readonly wpp = inject(WppService);
  private readonly electron = inject(ElectronService);

  protected readonly desktop = !!this.electron.isElectron();
  protected readonly databaseName = signal(this.sniffDb.database());
  protected readonly exists = signal<boolean | undefined>(undefined);
  protected readonly tables = signal<SniffTable[]>([]);
  protected readonly files = signal<SniffFile[]>([]);
  protected readonly error = signal('');
  protected readonly busy = signal(false);

  protected readonly sqlPath = signal('');
  protected readonly progress = signal('');
  protected readonly results = signal<SniffImportResult[]>([]);

  protected readonly wppFolder = signal(this.wpp.folder());
  protected readonly pktPath = signal('');
  protected readonly useDatabases = signal(false);
  protected readonly log = signal<string[]>([]);
  protected readonly parsedFiles = signal<string[]>([]);
  protected readonly built = signal(false);

  ngOnInit(): void {
    void this.refresh();
    this.built.set(this.desktop && !!this.wpp.builtDll());
  }

  /** The work under way (busy until all of it is done). */
  private running = 0;

  private async guard(work: () => Promise<void>): Promise<void> {
    this.busy.set(++this.running > 0);
    this.error.set('');
    try {
      await work();
    } catch (error) {
      this.error.set(message(error));
    }
    this.busy.set(--this.running > 0);
  }

  protected async refresh(): Promise<void> {
    await this.guard(async () => {
      const exists = await this.sniffDb.exists();
      this.exists.set(exists);
      this.tables.set(exists ? await this.sniffDb.tables() : []);
      this.files.set(exists ? await this.sniffDb.files().catch(() => []) : []);
    });
  }

  protected saveName(): void {
    if (!this.sniffDb.setDatabase(this.databaseName().trim())) {
      this.error.set('NAME');
      return;
    }
    void this.refresh();
  }

  protected async create(): Promise<void> {
    await this.guard(() => this.sniffDb.create());
    await this.refresh();
  }

  protected async removeFile(file: SniffFile): Promise<void> {
    await this.guard(() => this.sniffDb.removeFile(file.id));
    await this.refresh();
  }

  /** The .sql files of a path: the file, or those in the folder and its subfolders. */
  private sqlFiles(path: string): string[] {
    const fs = this.electron.fs;
    if (!fs.statSync(path).isDirectory()) {
      return [path];
    }
    return (fs.readdirSync(path) as string[]).flatMap((name) => {
      const full = `${path}/${name}`;
      return fs.statSync(full).isDirectory() ? this.sqlFiles(full) : /\.sql$/i.test(name) ? [full] : [];
    });
  }

  /** Loads the sniff SQL files of a file or folder into the sniff database (created when it isn't there). */
  protected async load(path = this.sqlPath().trim()): Promise<void> {
    if (!path) {
      return;
    }
    this.results.set([]);
    await this.guard(async () => {
      await this.sniffDb.create();
      const fs = this.electron.fs;
      const files = this.sqlFiles(path);
      for (const [i, file] of files.entries()) {
        const name = file.split(/[\\/]/).pop() as string;
        const size = Number(fs.statSync(file).size);
        const chunks = fs.createReadStream(file, { encoding: 'utf8', highWaterMark: SQL_CHUNK }) as AsyncIterable<string>;
        const result = await this.sniffDb.importSql(file, size, chunks, (done, total) =>
          this.progress.set(`${i + 1}/${files.length} ${name}: ${Math.round((done / Math.max(total, 1)) * 100)}%`),
        );
        this.results.set([...this.results(), result]);
      }
      this.progress.set('');
    });
    await this.refresh();
  }

  private say(line: string): void {
    this.log.set([...this.log(), line].slice(-LOG_LINES));
  }

  protected saveWppFolder(): void {
    this.wpp.setFolder(this.wppFolder());
    this.built.set(!!this.wpp.builtDll());
  }

  /** Downloads (or updates) and builds WPP, after checking that git and the .NET SDK are there. */
  protected async downloadAndBuild(): Promise<void> {
    this.log.set([]);
    await this.guard(async () => {
      this.saveWppFolder();
      const tools = await this.wpp.tools((line) => this.say(line));
      if (!tools.git || !tools.dotnet) {
        this.error.set(!tools.git ? 'NO_GIT' : 'NO_DOTNET');
        return;
      }
      const download = await this.wpp.download((line) => this.say(line));
      if (download.code !== 0) {
        this.error.set('DOWNLOAD_FAILED');
        return;
      }
      const build = await this.wpp.build((line) => this.say(line));
      this.built.set(build.code === 0 && !!this.wpp.builtDll());
      if (!this.built()) {
        this.error.set('BUILD_FAILED');
      }
    });
  }

  /** Parses the .pkt with WPP; its text and SQL are written next to it. */
  protected async parse(): Promise<void> {
    this.log.set([]);
    this.parsedFiles.set([]);
    await this.guard(async () => {
      const database = this.useDatabases() ? this.wpp.database(this.sniffDb.database()) : undefined;
      const result = await this.wpp.parse(this.pktPath().trim(), database, (line) => this.say(line));
      this.parsedFiles.set(result.files);
      if (result.code !== 0) {
        this.error.set('PARSE_FAILED');
      }
    });
  }

  protected loadParsedSql(file: string): Promise<void> {
    return this.load(file);
  }

  protected open(file: string): void {
    void this.electron.openPath(file);
  }
}
