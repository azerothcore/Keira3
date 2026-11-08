import type * as fs from 'fs';
import type * as v8 from 'v8';
import type * as zlib from 'zlib';
import type { StormModule, WowNativeApi } from './wow-native-api';
import { perfTime } from './perf-log';

/**
 * Electron implementation of {@link WowNativeApi}: Node `fs` plus StormJS loaded through `require` (`window.require` in
 * the renderer, like `mysql2` and `sqlite3`).
 */
/** The registry key of the display adapters (one subkey each). */
const GPU_CLASS_KEY = 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}';

/** The biggest graphics memory in `reg query` output: `qwMemorySize REG_QWORD 0x200000000`, or `MemorySize REG_DWORD`. */
export function largestMemorySize(output: string): number | undefined {
  const sizes = [...output.matchAll(/MemorySize\s+REG_(?:QWORD|DWORD)\s+0x([0-9a-f]+)/gi)].map((match) => parseInt(match[1], 16));
  return sizes.length ? Math.max(...sizes) : undefined;
}

export function createWowNativeApi(
  nodeFs: typeof fs,
  requireModule: (id: string) => unknown,
  env: Record<string, string | undefined>,
): WowNativeApi {
  let storm: StormModule | undefined;

  const loadStorm = (): StormModule => {
    // StormJS picks its (very chatty) debug build unless NODE_ENV is "production" at load time.
    const previous = env['NODE_ENV'];
    env['NODE_ENV'] = 'production';
    try {
      return requireModule('@wowserhq/stormjs') as StormModule;
    } finally {
      if (previous === undefined) {
        delete env['NODE_ENV'];
      } else {
        env['NODE_ENV'] = previous;
      }
    }
  };

  const v8Module = (): typeof v8 => requireModule('v8') as typeof v8;
  const zlibModule = (): typeof zlib => requireModule('zlib') as typeof zlib;
  const directorySize = (path: string): number =>
    nodeFs.existsSync(path)
      ? nodeFs.readdirSync(path).reduce((total, name) => {
          const child = `${path}/${name}`;
          const stat = nodeFs.statSync(child);
          return total + (stat.isDirectory() ? directorySize(child) : stat.size);
        }, 0)
      : 0;

  const directorySizeAsync = async (path: string): Promise<number> => {
    const entries = await nodeFs.promises.readdir(path, { withFileTypes: true }).catch(() => []);
    const sizes = await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? directorySizeAsync(`${path}/${entry.name}`)
          : nodeFs.promises.stat(`${path}/${entry.name}`).then((stat) => stat.size),
      ),
    );
    return sizes.reduce((total, size) => total + size, 0);
  };

  return {
    exists: (path) => nodeFs.existsSync(path),
    isDirectory: (path) => nodeFs.existsSync(path) && nodeFs.statSync(path).isDirectory(),
    readdir: (path) => nodeFs.readdirSync(path),
    readFile: (path) => new Uint8Array(nodeFs.readFileSync(path)),
    readFileAsync: async (path) => {
      const buffer = await nodeFs.promises.readFile(path);
      return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    },
    loadStorm: () => (storm ??= loadStorm()),
    writeFile: async (path, data) => {
      await nodeFs.promises.mkdir(path.slice(0, path.lastIndexOf('/')), { recursive: true });
      await nodeFs.promises.writeFile(path, data);
    },
    removeDirectory: (path) => nodeFs.rmSync(path, { recursive: true, force: true }),
    directorySize,
    directorySizeAsync,
    fileSizesAsync: async (path) => {
      const entries = await nodeFs.promises.readdir(path, { withFileTypes: true }).catch(() => []);
      const files = entries.filter((entry) => !entry.isDirectory());
      const sizes = await Promise.all(files.map((entry) => nodeFs.promises.stat(`${path}/${entry.name}`).then((stat) => stat.size)));
      return Object.fromEntries(files.map((entry, index) => [entry.name, sizes[index]]));
    },
    memoryUsage: () => ({
      used: (requireModule('process') as typeof process).memoryUsage().rss,
      total: (requireModule('os') as { totalmem(): number }).totalmem(),
    }),
    // (WebGL can't tell: Windows keeps it per display adapter in the registry, 64-bit, or 32-bit on older drivers)
    graphicsMemory: () =>
      new Promise<number | undefined>((resolve) => {
        if ((requireModule('os') as { platform(): string }).platform() !== 'win32') {
          resolve(undefined);
          return;
        }
        (requireModule('child_process') as typeof import('child_process')).exec(
          `reg query "${GPU_CLASS_KEY}" /s /v HardwareInformation.*MemorySize`,
          { windowsHide: true },
          (_error, stdout) => resolve(largestMemorySize(String(stdout ?? ''))),
        );
      }),
    cacheDirectory: () => {
      const base = env['LOCALAPPDATA'] ?? env['APPDATA'] ?? `${env['HOME'] ?? '.'}/.cache`;
      return `${base.replace(/\\/g, '/')}/Keira3/world-editor-cache`;
    },
    // V8's structured clone keeps typed arrays as they are; a fast deflate makes tiles about 3× smaller. The
    // (de)compression runs on Node's thread pool, so reading a cached tile doesn't hold up the window.
    pack: (value) =>
      new Promise<Uint8Array>((resolve, reject) =>
        zlibModule().deflate(
          perfTime('cache serialize', () => v8Module().serialize(value)),
          { level: 1 },
          (error, bytes) => (error ? reject(error) : resolve(new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength))),
        ),
      ),
    unpack: <T>(bytes: Uint8Array) =>
      new Promise<T>((resolve, reject) =>
        zlibModule().inflate(bytes, (error, raw) =>
          error ? reject(error) : resolve(perfTime('cache deserialize', () => v8Module().deserialize(raw)) as T),
        ),
      ),
  };
}
