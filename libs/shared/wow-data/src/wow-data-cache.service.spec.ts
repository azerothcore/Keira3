import { TestBed } from '@angular/core/testing';
import {
  cacheFileName,
  cacheSection,
  clientIdentity,
  DEFAULT_CACHE_MAX_BYTES,
  WOW_DATA_CACHE_KEY,
  WowDataCacheService,
} from './wow-data-cache.service';
import { WOW_NATIVE_API } from './wow-native-api';
import { createFakeNative, FakeNative } from './wow-native-api.mock';

describe('WowDataCacheService', () => {
  const setup = (desktop = true) => {
    const native: FakeNative | undefined = desktop ? createFakeNative({}) : undefined;
    TestBed.configureTestingModule({ providers: [{ provide: WOW_NATIVE_API, useValue: native }] });
    return { cache: TestBed.inject(WowDataCacheService), native };
  };

  beforeEach(() => localStorage.clear());

  it('stores and reads back values per client, kind and key', async () => {
    const { cache } = setup();
    expect(await cache.read('abc', 'adt', 'Azeroth_32_48')).toBeUndefined();
    expect(cache.has('abc', 'adt', 'Azeroth_32_48')).toBe(false);
    await cache.write('abc', 'adt', 'Azeroth_32_48', { heights: new Float32Array([1, 2]) });
    expect(cache.has('abc', 'adt', 'azeroth_32_48')).toBe(true);
    expect(await cache.read('abc', 'adt', 'Azeroth_32_48')).toEqual({ heights: new Float32Array([1, 2]) });
    expect(await cache.read('other', 'adt', 'Azeroth_32_48')).toBeUndefined();
    expect(await cache.size()).toBeGreaterThan(0);

    await cache.write('abc', 'wmo', 'World\\wmo\\Abbey.wmo', { ok: true });
    expect(await cache.read('abc', 'wmo', 'world\\WMO\\abbey.wmo')).toEqual({ ok: true });

    expect(Object.keys(await cache.entries('abc', 'adt'))).toEqual(['azeroth_32_48']);
    expect((await cache.entries('abc', 'adt'))['azeroth_32_48']).toBeGreaterThan(0);
    expect(await cache.entries('abc', 'other')).toEqual({});

    cache.clear();
    expect(await cache.size()).toBe(0);
    expect(await cache.read('abc', 'wmo', 'World\\wmo\\Abbey.wmo')).toBeUndefined();
  });

  it('can be turned off, and remembers it', async () => {
    const { cache } = setup();
    await cache.write('abc', 'adt', 'x', 1);
    cache.setEnabled(false);
    expect(cache.enabled()).toBe(false);
    expect(await cache.read('abc', 'adt', 'x')).toBeUndefined();
    expect(cache.has('abc', 'adt', 'x')).toBe(false);
    await cache.write('abc', 'adt', 'y', 2);
    cache.setEnabled(true);
    expect(await cache.read('abc', 'adt', 'y')).toBeUndefined();
    expect(await cache.read('abc', 'adt', 'x')).toBe(1);

    cache.setEnabled(false);
    TestBed.resetTestingModule();
    expect(setup().cache.enabled()).toBe(false);
  });

  it('caches each section on its own (all by default), and remembers them and whether to load the maps at start', async () => {
    const { cache } = setup();
    expect(cache.sections()).toEqual({ maps: true, terrain: true, buildings: true, models: true, textures: true });
    expect(cache.preloadMaps()).toBe(true);
    expect([cacheSection('minimap-1'), cacheSection('game-map-3'), cacheSection('adt-v2'), cacheSection('wmo-doodads')]).toEqual([
      'maps',
      'maps',
      'terrain',
      'buildings',
    ]);
    expect([cacheSection('m2-v3'), cacheSection('texture'), cacheSection('map-picture-256'), cacheSection('other')]).toEqual([
      'models',
      'textures',
      'maps',
      undefined,
    ]);
    expect(cacheFileName('Azeroth_32_48')).toBe('azeroth_32_48');
    await cache.write('abc', 'adt-v2', 'x', 1);
    cache.setSection('terrain', false);
    expect(cache.isOn('adt-v2')).toBe(false);
    expect(cache.isOn('wmo')).toBe(true);
    expect(cache.isOn('other')).toBe(true);
    expect(await cache.read('abc', 'adt-v2', 'x')).toBeUndefined();
    await cache.write('abc', 'adt-v2', 'y', 2);
    cache.setSection('terrain', true);
    expect(await cache.read('abc', 'adt-v2', 'y')).toBeUndefined();
    expect(await cache.read('abc', 'adt-v2', 'x')).toBe(1);
    cache.setSection('maps', false);
    cache.setPreloadMaps(false);
    TestBed.resetTestingModule();
    const again = setup().cache;
    expect(again.sections().maps).toBe(false);
    expect(again.sections().terrain).toBe(true);
    expect(again.preloadMaps()).toBe(false);
    // off: nothing is
    again.setEnabled(false);
    expect(again.isOn('other')).toBe(false);
  });

  it('survives damaged entries, write failures and damaged settings', async () => {
    const { cache, native } = setup();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await native?.writeFile('/cache/v1/abc/adt/x.bin', new TextEncoder().encode('{nope'));
    expect(await cache.read('abc', 'adt', 'x')).toBeUndefined();
    vi.spyOn(native as FakeNative, 'writeFile').mockRejectedValue(new Error('ENOSPC'));
    await cache.write('abc', 'adt', 'y', 1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('ENOSPC'));

    localStorage.setItem(WOW_DATA_CACHE_KEY, '{nope');
    TestBed.resetTestingModule();
    expect(setup().cache.enabled()).toBe(true);
    localStorage.setItem(WOW_DATA_CACHE_KEY, JSON.stringify({ folder: 3, maxBytes: -1 }));
    TestBed.resetTestingModule();
    expect(setup().cache.folder()).toBe('');
    expect(TestBed.inject(WowDataCacheService).maxBytes()).toBe(DEFAULT_CACHE_MAX_BYTES);
  });

  it('can live in a folder of the user, in its own subfolder', async () => {
    const { cache, native } = setup();
    expect(cache.root()).toBe('/cache');
    cache.setFolder(' D:\\Games\\Cache\\ ');
    expect(cache.folder()).toBe('D:\\Games\\Cache\\');
    expect(cache.root()).toBe('D:/Games/Cache/Keira3 world editor cache');
    await cache.write('abc', 'adt', 'x', 1);
    expect(native?.exists('D:/Games/Cache/Keira3 world editor cache/v1/abc/adt/x.bin')).toBe(true);
    await native?.writeFile('D:/Games/Cache/mine.txt', new Uint8Array([1]));
    cache.clear();
    expect(native?.exists('D:/Games/Cache/mine.txt')).toBe(true);
    expect(await cache.read('abc', 'adt', 'x')).toBeUndefined();

    TestBed.resetTestingModule();
    expect(setup().cache.folder()).toBe('D:\\Games\\Cache\\');
    cache.setFolder('');
    expect(cache.root()).toBe('/cache');
  });

  it('stops growing at its maximum size (10 GB unless changed), and remembers it', async () => {
    const { cache } = setup();
    expect(cache.maxBytes()).toBe(DEFAULT_CACHE_MAX_BYTES);
    expect(DEFAULT_CACHE_MAX_BYTES).toBe(10_000_000_000);
    cache.setMaxBytes(30);
    await cache.write('abc', 'adt', 'a', { data: 'x'.repeat(40) });
    expect(cache.isFull()).toBe(true);
    await cache.write('abc', 'adt', 'b', 1);
    expect(cache.has('abc', 'adt', 'b')).toBe(false);

    cache.clear();
    expect(cache.isFull()).toBe(false);
    cache.setMaxBytes(-5);
    expect(cache.maxBytes()).toBe(0);
    cache.setMaxBytes(1000);

    TestBed.resetTestingModule();
    const restored = setup().cache;
    expect(restored.maxBytes()).toBe(1000);
    // the size of an existing cache is counted the first time it's needed
    await restored.write('abc', 'adt', 'c', 1);
    expect(restored.isFull()).toBe(false);
    // counted in the background on the first write; a count for a folder left meanwhile is not used
    TestBed.resetTestingModule();
    const moved = setup();
    let finish: (bytes: number) => void = () => undefined;
    vi.spyOn(moved.native as FakeNative, 'directorySizeAsync')
      .mockReturnValueOnce(new Promise((resolve) => (finish = resolve)))
      // (the new folder's count still going on when the entry is written)
      .mockReturnValueOnce(new Promise(() => undefined));
    const writing = moved.cache.write('abc', 'adt', 'd', 1);
    moved.cache.setFolder('D:\\Elsewhere');
    finish(999_999);
    await writing;
    expect(moved.cache.isFull()).toBe(false);
    // the same for a size asked for
    let finishSize: (bytes: number) => void = () => undefined;
    vi.spyOn(moved.native as FakeNative, 'directorySizeAsync').mockReturnValueOnce(new Promise((resolve) => (finishSize = resolve)));
    const sizing = moved.cache.size();
    moved.cache.setFolder('');
    finishSize(999_999);
    expect(await sizing).toBe(999_999);
    expect(moved.cache.isFull()).toBe(false);
    // asked whether full before anything was counted: not yet, counted in the background, then known
    TestBed.resetTestingModule();
    const fresh = setup();
    await fresh.native?.writeFile('/cache/v1/abc/adt/e.bin', new Uint8Array(2000));
    fresh.cache.setMaxBytes(1000);
    expect(fresh.cache.isFull()).toBe(false);
    await fresh.cache.size();
    expect(fresh.cache.isFull()).toBe(true);
    // turned off: never full
    fresh.cache.setEnabled(false);
    expect(fresh.cache.isFull()).toBe(false);
  });

  it('does nothing outside the desktop app', async () => {
    const { cache } = setup(false);
    expect(cache.isFull()).toBe(false);
    await cache.write('abc', 'adt', 'x', 1);
    expect(await cache.read('abc', 'adt', 'x')).toBeUndefined();
    expect(cache.has('abc', 'adt', 'x')).toBe(false);
    expect(await cache.size()).toBe(0);
    expect(cache.root()).toBeUndefined();
    expect(await cache.entries('abc', 'adt')).toEqual({});
    expect(cache.isFull()).toBe(false);
    cache.clear();
  });

  it('names client installations stably', () => {
    expect(clientIdentity('C:/WoW', ['common.MPQ'])).toBe(clientIdentity('c:/wow', ['COMMON.MPQ']));
    expect(clientIdentity('C:/WoW', ['common.MPQ'])).not.toBe(clientIdentity('C:/WoW', ['common.MPQ', 'patch.MPQ']));
    expect(clientIdentity('', [])).toMatch(/^[0-9a-f]{8}$/);
  });
});
