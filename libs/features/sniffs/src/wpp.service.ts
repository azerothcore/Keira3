import { inject, Service, signal } from '@angular/core';
import { ElectronService } from '@keira/shared/common-services';
import { MysqlService } from '@keira/shared/db-layer';
import { keiraWppConfig, parseOutputs, WPP_REPOSITORY, WPP_SOLUTION, WppDatabase } from './wow-packet-parser';

export const WPP_FOLDER_KEY = 'keira3.wppFolder';

/** A program run: its exit code and what it printed. */
export interface RunResult {
  code: number;
  output: string;
}

function loadFolder(): string {
  try {
    return localStorage.getItem(WPP_FOLDER_KEY) ?? '';
  } catch {
    return '';
  }
}

/**
 * WowPacketParser on this computer: its folder (Settings), downloaded and built there with git and the .NET SDK, then
 * run on a sniff (.pkt) with Keira's config. Only in the desktop app.
 */
@Service()
export class WppService {
  private readonly electron = inject(ElectronService);
  private readonly mysql = inject(MysqlService);
  private readonly _folder = signal(loadFolder());
  readonly folder = this._folder.asReadonly();

  isSupported(): boolean {
    return !!this.electron.isElectron();
  }

  setFolder(folder: string): void {
    this._folder.set(folder.trim());
    try {
      localStorage.setItem(WPP_FOLDER_KEY, folder.trim());
    } catch {
      // (not kept)
    }
  }

  /** Runs a program, telling each line it prints. */
  run(command: string, args: string[], cwd: string | undefined, onLine: (line: string) => void): Promise<RunResult> {
    return new Promise((resolve) => {
      let output = '';
      const take = (chunk: unknown) => {
        const text = String(chunk);
        output += text;
        text
          .split(/\r?\n/)
          .filter((line) => line.trim())
          .forEach(onLine);
      };
      try {
        const child = this.electron.childProcess.spawn(command, args, { cwd, shell: false, windowsHide: true });
        child.stdout?.on('data', take);
        child.stderr?.on('data', take);
        child.on('error', (error: Error) => resolve({ code: -1, output: `${output}${error.message}` }));
        child.on('close', (code: number | null) => resolve({ code: code ?? -1, output }));
      } catch (error) {
        resolve({ code: -1, output: (error as Error).message });
      }
    });
  }

  /** Whether git and the .NET SDK are there (WPP needs them to be downloaded and built). */
  async tools(onLine: (line: string) => void = () => undefined): Promise<{ git: boolean; dotnet: boolean }> {
    const [git, dotnet] = await Promise.all([
      this.run('git', ['--version'], undefined, onLine),
      this.run('dotnet', ['--version'], undefined, onLine),
    ]);
    return { git: git.code === 0, dotnet: dotnet.code === 0 };
  }

  /** Downloads WPP into its folder (a fresh clone; an existing one is updated). */
  download(onLine: (line: string) => void): Promise<RunResult> {
    const folder = this.folder();
    const fs = this.electron.fs;
    if (fs.existsSync(`${folder}/.git`)) {
      return this.run('git', ['pull', '--ff-only'], folder, onLine);
    }
    return this.run('git', ['clone', '--depth', '1', WPP_REPOSITORY, folder], undefined, onLine);
  }

  build(onLine: (line: string) => void): Promise<RunResult> {
    return this.run('dotnet', ['build', WPP_SOLUTION, '-c', 'Release'], this.folder(), onLine);
  }

  /** The built WowPacketParser.dll (the newest, under WowPacketParser/bin/Release), or undefined. */
  builtDll(): string | undefined {
    const fs = this.electron.fs;
    const release = `${this.folder()}/WowPacketParser/bin/Release`;
    if (!this.folder() || !fs.existsSync(release)) {
      return undefined;
    }
    const found = (fs.readdirSync(release) as string[])
      .map((framework) => `${release}/${framework}/WowPacketParser.dll`)
      .filter((dll) => fs.existsSync(dll))
      .sort();
    return found[found.length - 1];
  }

  /** Keira's login and databases for WPP (its own: the sniff database; the world one to compare with). */
  database(wppDatabase: string): WppDatabase {
    const config = this.mysql.config;
    return {
      host: String(config.host ?? 'localhost'),
      port: Number(config.port ?? 3306),
      user: String(config.user ?? ''),
      password: String(config.password ?? ''),
      wppDatabase,
      worldDatabase: String(config.database ?? ''),
    };
  }

  /**
   * Parses a sniff with WPP, Keira's config written next to the built WPP (with the databases when given). Its output
   * goes next to the sniff, as WPP writes it; the files written are returned.
   */
  async parse(pkt: string, database: WppDatabase | undefined, onLine: (line: string) => void): Promise<RunResult & { files: string[] }> {
    const dll = this.builtDll();
    if (!dll) {
      return { code: -1, output: 'WowPacketParser is not built', files: [] };
    }
    const fs = this.electron.fs;
    const dir = dll.slice(0, dll.lastIndexOf('/'));
    const template = fs.readFileSync(`${dir}/WowPacketParser.dll.config`, 'utf8') as string;
    const config = `${dir}/keira.config`;
    fs.writeFileSync(config, keiraWppConfig(template, database));
    const started = Date.now();
    const result = await this.run('dotnet', [dll, '--ConfigFile', config, pkt], dir, onLine);
    const pktDir = pkt.slice(0, Math.max(pkt.lastIndexOf('/'), pkt.lastIndexOf('\\')));
    const files = (fs.readdirSync(pktDir) as string[]).map((name) => ({
      name,
      modified: Number(fs.statSync(`${pktDir}/${name}`).mtimeMs),
    }));
    return { ...result, files: parseOutputs(files, pkt, started).map((name) => `${pktDir}/${name}`) };
  }
}
