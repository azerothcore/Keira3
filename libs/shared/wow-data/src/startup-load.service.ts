import { inject, Injectable, signal } from '@angular/core';
import { WowClientService } from './wow-client.service';
import { WowDataSettingsService } from './wow-data-settings.service';

/** The game data folders that can be read when Keira starts. */
export type StartupFolder = 'client' | 'server' | 'source';
export const STARTUP_FOLDERS: StartupFolder[] = ['client', 'server', 'source'];

export const STARTUP_LOAD_KEY = 'keira3.loadOnStartup';
/** How long Keira is left alone after it starts before the folders are read (ms). */
export const STARTUP_LOAD_DELAY = 3000;

/** How the reading of a folder went. */
export type StartupState = 'waiting' | 'reading' | 'done' | 'failed';

/**
 * Reads the game data folders asked for right after Keira starts, instead of the first time a page needs them, so
 * the World Editor and the Scripts pages open at once: the client's archives and its maps, factions and areas; the
 * server's DataDir tables (its own Map.dbc and the like); the core source's scripts (names, boss boundaries, scripted
 * spawns). Each is off unless asked for (Settings).
 */
@Injectable({ providedIn: 'root' })
export class StartupLoadService {
  private readonly client = inject(WowClientService);
  private readonly settings = inject(WowDataSettingsService);
  private readonly _chosen = signal<Record<StartupFolder, boolean>>(this.load());
  /** The folders read when Keira starts. */
  readonly chosen = this._chosen.asReadonly();
  private readonly _states = signal<Partial<Record<StartupFolder, StartupState>>>({});
  /** How the reading of each folder went (this time). */
  readonly states = this._states.asReadonly();

  choose(folder: StartupFolder, on: boolean): void {
    this._chosen.set({ ...this._chosen(), [folder]: on });
    try {
      localStorage.setItem(STARTUP_LOAD_KEY, JSON.stringify(this._chosen()));
    } catch {
      // (storage blocked: until Keira closes)
    }
  }

  /** When Keira starts: after a moment, the folders asked for (and set), one after the other. */
  startup(): void {
    setTimeout(() => void this.run(), STARTUP_LOAD_DELAY);
  }

  async run(): Promise<void> {
    if (!this.client.isSupported()) {
      return;
    }
    const paths = this.settings.paths();
    const set: Record<StartupFolder, string> = { client: paths.clientPath, server: paths.serverDataPath, source: paths.sourcePath };
    const folders = STARTUP_FOLDERS.filter((folder) => this._chosen()[folder] && set[folder]);
    this._states.set(Object.fromEntries(folders.map((folder) => [folder, 'waiting'])));
    for (const folder of folders) {
      this.setState(folder, 'reading');
      try {
        await this.read(folder);
        this.setState(folder, 'done');
      } catch (error) {
        console.warn(`[Keira] Could not read the ${folder} folder on startup:`, error);
        this.setState(folder, 'failed');
      }
    }
  }

  private read(folder: StartupFolder): Promise<unknown> {
    switch (folder) {
      case 'client':
        return Promise.all([
          this.client.getArchiveNames(),
          this.client.getFactions(),
          this.client.getAreaNames(),
          this.client.getGameMap(),
        ]);
      case 'server':
        // (the maps come from the server's own Map.dbc when it has one)
        return this.client.getMaps();
      case 'source':
        return Promise.all([this.client.getScriptNames(), this.client.getAllBossBoundaries(), this.client.getAllScriptSpawns()]);
    }
  }

  private setState(folder: StartupFolder, state: StartupState): void {
    this._states.set({ ...this._states(), [folder]: state });
  }

  private load(): Record<StartupFolder, boolean> {
    const none = { client: false, server: false, source: false };
    try {
      const stored = JSON.parse(localStorage.getItem(STARTUP_LOAD_KEY) ?? '{}') as Record<string, unknown>;
      return Object.fromEntries(STARTUP_FOLDERS.map((folder) => [folder, stored[folder] === true])) as Record<StartupFolder, boolean>;
    } catch {
      return none;
    }
  }
}
