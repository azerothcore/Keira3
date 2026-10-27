import { inject, Service, signal } from '@angular/core';
import { WOW_NATIVE_API, WowNativeApi } from './wow-native-api';

export const WOW_DATA_CACHE_KEY = 'keira3.worldEditor.cache';
/** Bumped whenever the cached data's shape changes, so old entries are simply not found. */
const CACHE_VERSION = 'v1';
/** Default limit of the cache on disk. */
export const DEFAULT_CACHE_MAX_BYTES = 10 * 1_000_000_000;
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
  private readonly _maxBytes = signal(this.stored.maxBytes);
  /** Most the cache may take on disk; nothing more is written once reached. */
  readonly maxBytes = this._maxBytes.asReadonly();
  /** Bytes in the cache folder, counted once then kept up to date by the writes. */
  private usedBytes?: number;
  private counting?: Promise<number>;
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
    this.usedBytes = undefined;
    this.save();
  }

  setMaxBytes(bytes: number): void {
    this._maxBytes.set(Math.max(0, bytes));
    this.save();
  }

  /** True once the cache reached its maximum size. */
  isFull(): boolean {
    return this.used() >= this._maxBytes();
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

  /**
   * The cached value, or undefined when missing, turned off or unreadable. Read, uncompressed and decoded without
   * holding up the window (only the last step runs on its thread).
   */
  async read<T>(identity: string, kind: string, key: string): Promise<T | undefined> {
    if (!this.active) {
      return undefined;
    }
    const native = this.native as WowNativeApi;
    const path = this.path(identity, kind, key);
    let bytes: Uint8Array;
    try {
      bytes = await native.readFileAsync(path);
    } catch {
      // not cached
      return undefined;
    }
    try {
      return await native.unpack<T>(bytes);
    } catch (error) {
      console.warn(`[World Editor] Ignoring a damaged cache entry ${path}: ${(error as Error).message}`);
      return undefined;
    }
  }

  /** Stores a value (in the background: compressed and written off the window's thread). */
  async write(identity: string, kind: string, key: string, value: unknown): Promise<void> {
    if (!this.active) {
      return;
    }
    // the first write of a session counts what's in the cache (thousands of files) in the background, not here
    if (this.usedBytes === undefined) {
      await this.countInBackground();
    }
    if (this.isFull()) {
      return;
    }
    const native = this.native as WowNativeApi;
    try {
      const bytes = await native.pack(value);
      // counted before it's written, so writes in flight don't go over the limit
      this.usedBytes = this.used() + bytes.length;
      await native.writeFile(this.path(identity, kind, key), bytes);
    } catch (error) {
      // a full disk or a read-only folder only costs speed
      console.warn(`[World Editor] Could not write to the cache: ${(error as Error).message}`);
    }
  }

  /** Files of one kind for a client, with their sizes, by key (lower case, as stored). */
  entries(identity: string, kind: string): Record<string, number> {
    if (!this.native) {
      return {};
    }
    const sizes = this.native.fileSizes(this.kindFolder(identity, kind));
    return Object.fromEntries(Object.entries(sizes).map(([name, size]) => [name.replace(/\.bin$/, ''), size]));
  }

  /** Bytes used on disk by the cache (0 outside the desktop app). */
  size(): number {
    this.usedBytes = this.native ? this.native.directorySize(this.root() as string) : 0;
    return this.usedBytes;
  }

  clear(): void {
    this.native?.removeDirectory(this.root() as string);
    this.usedBytes = 0;
  }

  private countInBackground(): Promise<number> {
    const root = this.root() as string;
    this.counting ??= (this.native as WowNativeApi).directorySizeAsync(root).then((bytes) => {
      this.counting = undefined;
      // (unless counted meanwhile, or moved to another folder)
      if (root === this.root()) {
        this.usedBytes ??= bytes;
      }
      return bytes;
    });
    return this.counting;
  }

  private used(): number {
    return this.usedBytes ?? this.size();
  }

  private save(): void {
    localStorage.setItem(
      WOW_DATA_CACHE_KEY,
      JSON.stringify({ enabled: this._enabled(), folder: this._folder(), maxBytes: this._maxBytes() }),
    );
  }

  private get active(): boolean {
    return !!this.native && this._enabled();
  }

  private kindFolder(identity: string, kind: string): string {
    return `${this.root() as string}/${CACHE_VERSION}/${safeName(identity)}/${safeName(kind)}`;
  }

  private path(identity: string, kind: string, key: string): string {
    return `${this.kindFolder(identity, kind)}/${safeName(key)}.bin`;
  }
}

function safeName(part: string): string {
  return part.toLowerCase().replace(/[^a-z0-9_.-]+/g, '_');
}

/** A short, stable name for a client installation (its folder and archives), used to keep caches apart. */
export function clientIdentity(clientPath: string, archives: string[]): string {
  let hash = 2166136261;
  for (const char of `${clientPath}|${archives.join('|')}`.toLowerCase()) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function loadSettings(): { enabled: boolean; folder: string; maxBytes: number } {
  try {
    const stored = JSON.parse(localStorage.getItem(WOW_DATA_CACHE_KEY) ?? '{}') as {
      enabled?: unknown;
      folder?: unknown;
      maxBytes?: unknown;
    };
    return {
      enabled: stored.enabled !== false,
      folder: typeof stored.folder === 'string' ? stored.folder : '',
      maxBytes: typeof stored.maxBytes === 'number' && stored.maxBytes >= 0 ? stored.maxBytes : DEFAULT_CACHE_MAX_BYTES,
    };
  } catch {
    return { enabled: true, folder: '', maxBytes: DEFAULT_CACHE_MAX_BYTES };
  }
}
