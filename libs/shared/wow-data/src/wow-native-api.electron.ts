import type * as fs from 'fs';
import type * as v8 from 'v8';
import type * as zlib from 'zlib';
import type { StormModule, WowNativeApi } from './wow-native-api';

/**
 * Electron implementation of {@link WowNativeApi}: Node `fs` plus StormJS loaded through `require` (`window.require` in
 * the renderer, like `mysql2` and `sqlite3`).
 */
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

  return {
    exists: (path) => nodeFs.existsSync(path),
    isDirectory: (path) => nodeFs.existsSync(path) && nodeFs.statSync(path).isDirectory(),
    readdir: (path) => nodeFs.readdirSync(path),
    readFile: (path) => new Uint8Array(nodeFs.readFileSync(path)),
    loadStorm: () => (storm ??= loadStorm()),
    writeFile: (path, data) => {
      nodeFs.mkdirSync(path.slice(0, path.lastIndexOf('/')), { recursive: true });
      nodeFs.writeFileSync(path, data);
    },
    removeDirectory: (path) => nodeFs.rmSync(path, { recursive: true, force: true }),
    directorySize,
    cacheDirectory: () => {
      const base = env['LOCALAPPDATA'] ?? env['APPDATA'] ?? `${env['HOME'] ?? '.'}/.cache`;
      return `${base.replace(/\\/g, '/')}/Keira3/world-editor-cache`;
    },
    // V8's structured clone keeps typed arrays as they are; a fast deflate makes tiles about 3× smaller.
    pack: (value) => new Uint8Array(zlibModule().deflateSync(v8Module().serialize(value), { level: 1 })),
    unpack: <T>(bytes: Uint8Array) => v8Module().deserialize(zlibModule().inflateSync(bytes)) as T,
  };
}
