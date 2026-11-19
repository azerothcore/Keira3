import { TestBed } from '@angular/core/testing';
import { ElectronService } from '@keira/shared/common-services';
import type * as fs from 'fs';
import { WOW_NATIVE_API } from './wow-native-api';
import { createWowNativeApi } from './wow-native-api.electron';

describe('WOW_NATIVE_API', () => {
  it('is undefined outside Electron', () => {
    TestBed.configureTestingModule({ providers: [{ provide: ElectronService, useValue: { isElectron: () => false } }] });
    expect(TestBed.inject(WOW_NATIVE_API)).toBeUndefined();
  });

  it('wraps Node fs under Electron', () => {
    const nodeFs = { existsSync: vi.fn().mockReturnValue(true) };
    window.require = vi.fn() as unknown as typeof window.require;
    window.process = { env: {} } as unknown as typeof window.process;
    TestBed.configureTestingModule({ providers: [{ provide: ElectronService, useValue: { isElectron: () => true, fs: nodeFs } }] });
    const api = TestBed.inject(WOW_NATIVE_API);
    expect(api?.exists('x')).toBe(true);
    expect(nodeFs.existsSync).toHaveBeenCalledWith('x');
  });
});

describe('createWowNativeApi', () => {
  const nodeFs = {
    existsSync: (path: string) => path !== '/missing',
    statSync: (path: string) => ({ isDirectory: () => path === '/dir' }),
    readdirSync: () => ['a', 'b'],
    readFileSync: () => Buffer.from([1, 2]),
  } as unknown as typeof fs;

  it('exposes file access', () => {
    const api = createWowNativeApi(nodeFs, vi.fn(), {});
    expect(api.exists('/dir')).toBe(true);
    expect(api.isDirectory('/dir')).toBe(true);
    expect(api.isDirectory('/file')).toBe(false);
    expect(api.isDirectory('/missing')).toBe(false);
    expect(api.readdir('/dir')).toEqual(['a', 'b']);
    expect(api.readFile('/file')).toEqual(new Uint8Array([1, 2]));
  });

  it('loads StormJS once in production mode and removes the temporary NODE_ENV', () => {
    const storm = { MPQ: {} };
    const env: Record<string, string | undefined> = {};
    const requireModule = vi.fn().mockImplementation(() => {
      expect(env['NODE_ENV']).toBe('production');
      return storm;
    });
    const api = createWowNativeApi(nodeFs, requireModule, env);

    expect(api.loadStorm()).toBe(storm);
    expect(api.loadStorm()).toBe(storm);
    expect(requireModule).toHaveBeenCalledTimes(1);
    expect(requireModule).toHaveBeenCalledWith('@wowserhq/stormjs');
    expect('NODE_ENV' in env).toBe(false);
  });

  it('restores a previous NODE_ENV even when loading fails', () => {
    const env: Record<string, string | undefined> = { NODE_ENV: 'development' };
    const api = createWowNativeApi(
      nodeFs,
      () => {
        throw new Error('missing module');
      },
      env,
    );
    expect(() => api.loadStorm()).toThrowError('missing module');
    expect(env['NODE_ENV']).toBe('development');
  });

  it('reads and writes files (with their folders) without blocking, measures and removes folders', async () => {
    const writable = {
      existsSync: (path: string) => path !== '/missing',
      promises: {
        mkdir: vi.fn().mockResolvedValue(undefined),
        writeFile: vi.fn().mockResolvedValue(undefined),
        readFile: vi.fn().mockResolvedValue(Buffer.from([7, 8])),
        readdir: vi.fn((path: string) =>
          path === '/missing'
            ? Promise.reject(new Error('ENOENT'))
            : Promise.resolve(
                (path === '/cache' ? ['a.bin', 'sub'] : ['b.bin']).map((name) => ({ name, isDirectory: () => name === 'sub' })),
              ),
        ),
        stat: vi.fn((path: string) => Promise.resolve({ size: path.endsWith('a.bin') ? 10 : 5 })),
      },
      rmSync: vi.fn(),
      readdirSync: (path: string) => (path === '/cache' ? ['a.bin', 'sub'] : ['b.bin']),
      statSync: (path: string) => ({ isDirectory: () => path.endsWith('/sub'), size: path.endsWith('a.bin') ? 10 : 5 }),
    };
    const api = createWowNativeApi(writable as unknown as typeof fs, vi.fn(), {});
    await api.writeFile('/cache/v1/adt/x.bin', new Uint8Array([1]));
    expect(writable.promises.mkdir).toHaveBeenCalledWith('/cache/v1/adt', { recursive: true });
    expect(writable.promises.writeFile).toHaveBeenCalledWith('/cache/v1/adt/x.bin', new Uint8Array([1]));
    expect(Array.from(await api.readFileAsync('/cache/v1/adt/x.bin'))).toEqual([7, 8]);
    expect(api.directorySize('/cache')).toBe(15);
    expect(api.directorySize('/missing')).toBe(0);
    expect(await api.directorySizeAsync('/cache')).toBe(15);
    expect(await api.directorySizeAsync('/missing')).toBe(0);
    expect(await api.fileSizesAsync('/cache')).toEqual({ 'a.bin': 10 });
    expect(await api.fileSizesAsync('/missing')).toEqual({});
    api.removeDirectory('/cache');
    expect(writable.rmSync).toHaveBeenCalledWith('/cache', { recursive: true, force: true });
  });

  it("tells the window's memory and the computer's", () => {
    const modules: Record<string, unknown> = {
      process: { memoryUsage: () => ({ rss: 900 }) },
      os: { totalmem: () => 8000 },
    };
    expect(createWowNativeApi(nodeFs, (id) => modules[id], {}).memoryUsage()).toEqual({ used: 900, total: 8000 });
  });

  it("reads the graphics card's memory on Windows from the registry, the biggest adapter's", async () => {
    const exec = vi.fn((_command: string, _options: unknown, done: (error: unknown, stdout: string) => void) =>
      done(
        null,
        [
          'HKEY_LOCAL_MACHINE\\SYSTEM\\...\\0000',
          '    HardwareInformation.qwMemorySize    REG_QWORD    0x200000000',
          'HKEY_LOCAL_MACHINE\\SYSTEM\\...\\0001',
          '    HardwareInformation.MemorySize    REG_DWORD    0x80000000',
        ].join('\r\n'),
      ),
    );
    const modules: Record<string, unknown> = { os: { platform: () => 'win32' }, child_process: { exec } };
    expect(await createWowNativeApi(nodeFs, (id) => modules[id], {}).graphicsMemory()).toBe(8 * 1024 ** 3);
    expect(exec.mock.calls[0][0]).toContain('HardwareInformation.*MemorySize');
    // nothing found (or a failure: no output)
    exec.mockImplementationOnce((_c, _o, done) => done(new Error('denied'), undefined as unknown as string));
    expect(await createWowNativeApi(nodeFs, (id) => modules[id], {}).graphicsMemory()).toBeUndefined();
    // not Windows
    const linux: Record<string, unknown> = { os: { platform: () => 'linux' } };
    expect(await createWowNativeApi(nodeFs, (id) => linux[id], {}).graphicsMemory()).toBeUndefined();
  });

  it("keeps its cache in the user's local application data", () => {
    expect(createWowNativeApi(nodeFs, vi.fn(), { LOCALAPPDATA: 'C:\\Users\\Me\\AppData\\Local' }).cacheDirectory()).toBe(
      'C:/Users/Me/AppData/Local/Keira3/world-editor-cache',
    );
    expect(createWowNativeApi(nodeFs, vi.fn(), { APPDATA: '/roaming' }).cacheDirectory()).toBe('/roaming/Keira3/world-editor-cache');
    expect(createWowNativeApi(nodeFs, vi.fn(), { HOME: '/home/me' }).cacheDirectory()).toBe('/home/me/.cache/Keira3/world-editor-cache');
    expect(createWowNativeApi(nodeFs, vi.fn(), {}).cacheDirectory()).toBe('./.cache/Keira3/world-editor-cache');
  });

  it('packs data with its typed arrays', async () => {
    const modules: Record<string, unknown> = { v8: await import('node:v8'), zlib: await import('node:zlib') };
    const api = createWowNativeApi(nodeFs, (id) => modules[id], {});
    const value = { name: 'tile', heights: new Float32Array([1.5, 2]), nested: [{ id: 1 }] };
    const packed = await api.pack(value);
    expect(packed).toBeInstanceOf(Uint8Array);
    const unpacked = await api.unpack<typeof value>(packed);
    // (V8 builds Node-realm typed arrays, so compare their values)
    expect(unpacked.name).toBe('tile');
    expect(Array.from(unpacked.heights)).toEqual([1.5, 2]);
    expect(unpacked.heights.constructor.name).toBe('Float32Array');
    expect(unpacked.nested).toEqual([{ id: 1 }]);
    // damaged bytes
    await expect(api.unpack(new Uint8Array([1, 2, 3]))).rejects.toThrow();
    const failing = createWowNativeApi(
      nodeFs,
      (id) =>
        id === 'zlib' ? { deflate: (_b: unknown, _o: unknown, done: (e: Error) => void) => done(new Error('no memory')) } : modules[id],
      {},
    );
    await expect(failing.pack(value)).rejects.toThrow('no memory');
  });
});
