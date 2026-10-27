import { inject, InjectionToken } from '@angular/core';
import { ElectronService } from '@keira/shared/common-services';
import { createWowNativeApi } from './wow-native-api.electron';

/** Subset of `@wowserhq/stormjs` (StormLib compiled to WebAssembly) used by Keira. */
export interface StormFile {
  read(): Uint8Array;
  close(): void;
}

export interface StormArchive {
  hasFile(name: string): boolean;
  openFile(name: string): StormFile;
  close(): void;
}

export interface StormModule {
  FS: {
    filesystems: { NODEFS: unknown };
    mkdir(path: string): void;
    mount(type: unknown, options: { root: string }, mountpoint: string): void;
    unmount(mountpoint: string): void;
  };
  MPQ: { open(path: string, mode: string): Promise<StormArchive> };
}

/** Local file access needed to read game data. Only available under Electron. */
export interface WowNativeApi {
  exists(path: string): boolean;
  isDirectory(path: string): boolean;
  readdir(path: string): string[];
  readFile(path: string): Uint8Array;
  loadStorm(): StormModule;
  /** Writes a file, creating its folders. */
  writeFile(path: string, data: Uint8Array): void;
  /** Deletes a folder and everything in it (nothing if missing). */
  removeDirectory(path: string): void;
  /** Total size in bytes of the files in a folder, recursively (0 if missing). */
  directorySize(path: string): number;
  /** Size in bytes of each file directly in a folder, by name (empty if missing). */
  fileSizes(path: string): Record<string, number>;
  /** Where Keira keeps data it can rebuild (the user's local application data). */
  cacheDirectory(): string;
  /** Turns plain data (objects, arrays, typed arrays…) into compact bytes, and back. */
  pack(value: unknown): Uint8Array;
  unpack<T>(bytes: Uint8Array): T;
}

export const WOW_NATIVE_API = new InjectionToken<WowNativeApi | undefined>('WOW_NATIVE_API', {
  providedIn: 'root',
  factory: () => {
    const electronService = inject(ElectronService);
    return electronService.isElectron() ? createWowNativeApi(electronService.fs, window.require, window.process.env) : undefined;
  },
});
