import { inject, Service, signal } from '@angular/core';
import { WOW_NATIVE_API, WowNativeApi } from './wow-native-api';

export const WOW_DATA_CACHE_KEY = 'keira3.worldEditor.cache';
/** Bumped whenever the cached data's shape changes, so old entries are simply not found. */
const CACHE_VERSION = 'v1';
/** Subfolder created inside a folder the user picked. */
export const CACHE_FOLDER_NAME = 'Keira3 world editor cache';

/**
 * Keeps processed game data (parsed map tiles, buildings) in a folder on this computer, so a place loads much faster
 * the second time. Entries are grouped per client (`identity`); the cache can be turned off and cleared.
 */
@Service()
export class WowDataCacheService {
  private readonly native = inject(WOW_NATIVE_API);
  private readonly stored = loadSettings();
  private readonly _enabled = signal(this.stored.enabled);
  private readonly _folder = signal(this.stored.folder);
  readonly enabled = this._enabled.asReadonly();
  /** The folder chosen by the user ('' = the default, in the local application data). */
  readonly folder = this._folder.asReadonly();

  setEnabled(enabled: boolean): void {
    this._enabled.set(enabled);
    this.save();
  }

  /** Moves the cache to another folder ('' = default). Entries in the old folder stay there until cleared. */
  setFolder(folder: string): void {
    this._folder.set(folder.trim());
    this.save();
  }

  /**
   * Where entries are written. A chosen folder gets its own subfolder, so clearing the cache never touches anything
   * else the user keeps there.
   */
  root(): string | undefined {
    if (!this.native) {
      return undefined;
    }
    const folder = this._folder().replace(/[\\/]+$/, '');
    return folder ? `${folder.replace(/\\/g, '/')}/${CACHE_FOLDER_NAME}` : this.native.cacheDirectory();
  }

  has(identity: string, kind: string, key: string): boolean {
    return this.active ? (this.native as WowNativeApi).exists(this.path(identity, kind, key)) : false;
  }

  /** The cached value, or undefined when missing, turned off or unreadable. */
  read<T>(identity: string, kind: string, key: string): T | undefined {
    if (!this.active) {
      return undefined;
    }
    const native = this.native as WowNativeApi;
    const path = this.path(identity, kind, key);
    if (!native.exists(path)) {
      return undefined;
    }
    try {
      return native.unpack<T>(native.readFile(path));
    } catch (error) {
      console.warn(`[World Editor] Ignoring a damaged cache entry ${path}: ${(error as Error).message}`);
      return undefined;
    }
  }

  write(identity: string, kind: string, key: string, value: unknown): void {
    if (!this.active) {
      return;
    }
    const native = this.native as WowNativeApi;
    try {
      native.writeFile(this.path(identity, kind, key), native.pack(value));
    } catch (error) {
      // a full disk or a read-only folder only costs speed
      console.warn(`[World Editor] Could not write to the cache: ${(error as Error).message}`);
    }
  }

  /** Bytes used on disk by the cache (0 outside the desktop app). */
  size(): number {
    return this.native ? this.native.directorySize(this.root() as string) : 0;
  }

  clear(): void {
    this.native?.removeDirectory(this.root() as string);
  }

  private save(): void {
    localStorage.setItem(WOW_DATA_CACHE_KEY, JSON.stringify({ enabled: this._enabled(), folder: this._folder() }));
  }

  private get active(): boolean {
    return !!this.native && this._enabled();
  }

  private path(identity: string, kind: string, key: string): string {
    const safe = (part: string) => part.toLowerCase().replace(/[^a-z0-9_.-]+/g, '_');
    return `${this.root() as string}/${CACHE_VERSION}/${safe(identity)}/${safe(kind)}/${safe(key)}.bin`;
  }
}

/** A short, stable name for a client installation (its folder and archives), used to keep caches apart. */
export function clientIdentity(clientPath: string, archives: string[]): string {
  let hash = 2166136261;
  for (const char of `${clientPath}|${archives.join('|')}`.toLowerCase()) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function loadSettings(): { enabled: boolean; folder: string } {
  try {
    const stored = JSON.parse(localStorage.getItem(WOW_DATA_CACHE_KEY) ?? '{}') as { enabled?: unknown; folder?: unknown };
    return { enabled: stored.enabled !== false, folder: typeof stored.folder === 'string' ? stored.folder : '' };
  } catch {
    return { enabled: true, folder: '' };
  }
}
