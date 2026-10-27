import { StormArchive, StormModule, WowNativeApi } from './wow-native-api';

export interface FakeMpq {
  files?: Record<string, number[]>;
  /** Opening this archive rejects. */
  fail?: boolean;
}

export interface FakeNative extends WowNativeApi {
  storm: StormModule;
  mounts: Map<string, string>;
  openedArchives: FakeStormArchive[];
}

export class FakeStormArchive implements StormArchive {
  closed = false;
  constructor(
    readonly name: string,
    private readonly files: Record<string, number[]>,
  ) {}

  private find(name: string): number[] | undefined {
    const wanted = name.replace(/\//g, '\\').toLowerCase();
    const key = Object.keys(this.files).find((k) => k.replace(/\//g, '\\').toLowerCase() === wanted);
    return key === undefined ? undefined : this.files[key];
  }

  hasFile(name: string): boolean {
    return this.find(name) !== undefined;
  }

  /** Like StormJS, read() returns a buffer that close() releases (simulated by zeroing it). */
  openFile(name: string): { read: () => Uint8Array; close: () => void } {
    const buffer = Uint8Array.from(this.find(name) as number[]);
    return { read: () => buffer, close: () => buffer.fill(0) };
  }

  close(): void {
    this.closed = true;
  }
}

/**
 * In-memory replacement for the Electron file access: `files` maps absolute paths to bytes (directories are implied by
 * the paths). `mpqs` maps archive paths (as opened by StormJS, relative to the mounted `Data` folder) to their content;
 * those archives are also added as files under `mpqRoot`.
 */
export function createFakeNative(files: Record<string, number[]>, mpqs: Record<string, FakeMpq> = {}, mpqRoot?: string): FakeNative {
  const allFiles: Record<string, number[]> = { ...files };
  if (mpqRoot) {
    for (const name of Object.keys(mpqs)) {
      allFiles[`${mpqRoot}/${name}`] = [];
    }
  }
  const paths = (): string[] => Object.keys(allFiles);
  const isDirectory = (path: string): boolean => paths().some((p) => p.startsWith(`${path}/`));
  const mounts = new Map<string, string>();
  const openedArchives: FakeStormArchive[] = [];

  const storm: StormModule = {
    FS: {
      filesystems: { NODEFS: 'NODEFS' },
      mkdir: () => undefined,
      mount: (_type, options, mountpoint) => void mounts.set(mountpoint, options.root),
      unmount: (mountpoint) => void mounts.delete(mountpoint),
    },
    MPQ: {
      open: (path: string) => {
        const name = path.replace(/^\/[^/]+\//, '');
        const mpq = mpqs[name];
        if (!mpq || mpq.fail) {
          return Promise.reject(new Error('Archive could not be opened (error 31)'));
        }
        const archive = new FakeStormArchive(name, mpq.files ?? {});
        openedArchives.push(archive);
        return Promise.resolve(archive);
      },
    },
  };

  return {
    storm,
    mounts,
    openedArchives,
    exists: (path) => path in allFiles || isDirectory(path),
    isDirectory,
    readdir: (path) => [
      ...new Set(
        paths()
          .filter((p) => p.startsWith(`${path}/`))
          .map((p) => p.slice(path.length + 1).split('/')[0]),
      ),
    ],
    readFile: (path) => {
      if (!(path in allFiles)) {
        throw new Error(`ENOENT: ${path}`);
      }
      return Uint8Array.from(allFiles[path]);
    },
    loadStorm: () => storm,
    writeFile: (path, data) => void (allFiles[path] = Array.from(data)),
    removeDirectory: (path) => paths().forEach((p) => p.startsWith(`${path}/`) && delete allFiles[p]),
    directorySize: (path) => paths().reduce((total, p) => total + (p.startsWith(`${path}/`) ? allFiles[p].length : 0), 0),
    cacheDirectory: () => '/cache',
    // JSON with typed arrays tagged, standing in for V8 serialisation
    pack: (value) =>
      new TextEncoder().encode(
        JSON.stringify(value, (_key, v) =>
          ArrayBuffer.isView(v) ? { $typed: v.constructor.name, values: Array.from(v as Uint8Array) } : v,
        ),
      ),
    unpack: <T>(bytes: Uint8Array) =>
      JSON.parse(new TextDecoder().decode(bytes), (_key, v) =>
        v && typeof v === 'object' && '$typed' in v
          ? new (globalThis as unknown as Record<string, new (values: number[]) => unknown>)[v.$typed](v.values)
          : v,
      ) as T,
  };
}
