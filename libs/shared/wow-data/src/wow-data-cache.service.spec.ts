import { TestBed } from '@angular/core/testing';
import { clientIdentity, WOW_DATA_CACHE_KEY, WowDataCacheService } from './wow-data-cache.service';
import { WOW_NATIVE_API } from './wow-native-api';
import { createFakeNative, FakeNative } from './wow-native-api.mock';

describe('WowDataCacheService', () => {
  const setup = (desktop = true) => {
    const native: FakeNative | undefined = desktop ? createFakeNative({}) : undefined;
    TestBed.configureTestingModule({ providers: [{ provide: WOW_NATIVE_API, useValue: native }] });
    return { cache: TestBed.inject(WowDataCacheService), native };
  };

  beforeEach(() => localStorage.clear());

  it('stores and reads back values per client, kind and key', () => {
    const { cache } = setup();
    expect(cache.read('abc', 'adt', 'Azeroth_32_48')).toBeUndefined();
    expect(cache.has('abc', 'adt', 'Azeroth_32_48')).toBe(false);
    cache.write('abc', 'adt', 'Azeroth_32_48', { heights: new Float32Array([1, 2]) });
    expect(cache.has('abc', 'adt', 'azeroth_32_48')).toBe(true);
    expect(cache.read('abc', 'adt', 'Azeroth_32_48')).toEqual({ heights: new Float32Array([1, 2]) });
    expect(cache.read('other', 'adt', 'Azeroth_32_48')).toBeUndefined();
    expect(cache.size()).toBeGreaterThan(0);

    cache.write('abc', 'wmo', 'World\\wmo\\Abbey.wmo', { ok: true });
    expect(cache.read('abc', 'wmo', 'world\\WMO\\abbey.wmo')).toEqual({ ok: true });

    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.read('abc', 'wmo', 'World\\wmo\\Abbey.wmo')).toBeUndefined();
  });

  it('can be turned off, and remembers it', () => {
    const { cache } = setup();
    cache.write('abc', 'adt', 'x', 1);
    cache.setEnabled(false);
    expect(cache.enabled()).toBe(false);
    expect(cache.read('abc', 'adt', 'x')).toBeUndefined();
    expect(cache.has('abc', 'adt', 'x')).toBe(false);
    cache.write('abc', 'adt', 'y', 2);
    cache.setEnabled(true);
    expect(cache.read('abc', 'adt', 'y')).toBeUndefined();
    expect(cache.read('abc', 'adt', 'x')).toBe(1);

    cache.setEnabled(false);
    TestBed.resetTestingModule();
    expect(setup().cache.enabled()).toBe(false);
  });

  it('survives damaged entries, write failures and damaged settings', () => {
    const { cache, native } = setup();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    native?.writeFile('/cache/v1/abc/adt/x.bin', new TextEncoder().encode('{nope'));
    expect(cache.read('abc', 'adt', 'x')).toBeUndefined();
    vi.spyOn(native as FakeNative, 'writeFile').mockImplementation(() => {
      throw new Error('ENOSPC');
    });
    cache.write('abc', 'adt', 'y', 1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('ENOSPC'));

    localStorage.setItem(WOW_DATA_CACHE_KEY, '{nope');
    TestBed.resetTestingModule();
    expect(setup().cache.enabled()).toBe(true);
    localStorage.setItem(WOW_DATA_CACHE_KEY, JSON.stringify({ folder: 3 }));
    TestBed.resetTestingModule();
    expect(setup().cache.folder()).toBe('');
  });

  it('can live in a folder of the user, in its own subfolder', () => {
    const { cache, native } = setup();
    expect(cache.root()).toBe('/cache');
    cache.setFolder(' D:\\Games\\Cache\\ ');
    expect(cache.folder()).toBe('D:\\Games\\Cache\\');
    expect(cache.root()).toBe('D:/Games/Cache/Keira3 world editor cache');
    cache.write('abc', 'adt', 'x', 1);
    expect(native?.exists('D:/Games/Cache/Keira3 world editor cache/v1/abc/adt/x.bin')).toBe(true);
    native?.writeFile('D:/Games/Cache/mine.txt', new Uint8Array([1]));
    cache.clear();
    expect(native?.exists('D:/Games/Cache/mine.txt')).toBe(true);
    expect(cache.read('abc', 'adt', 'x')).toBeUndefined();

    TestBed.resetTestingModule();
    expect(setup().cache.folder()).toBe('D:\\Games\\Cache\\');
    cache.setFolder('');
    expect(cache.root()).toBe('/cache');
  });

  it('does nothing outside the desktop app', () => {
    const { cache } = setup(false);
    cache.write('abc', 'adt', 'x', 1);
    expect(cache.read('abc', 'adt', 'x')).toBeUndefined();
    expect(cache.has('abc', 'adt', 'x')).toBe(false);
    expect(cache.size()).toBe(0);
    expect(cache.root()).toBeUndefined();
    cache.clear();
  });

  it('names client installations stably', () => {
    expect(clientIdentity('C:/WoW', ['common.MPQ'])).toBe(clientIdentity('c:/wow', ['COMMON.MPQ']));
    expect(clientIdentity('C:/WoW', ['common.MPQ'])).not.toBe(clientIdentity('C:/WoW', ['common.MPQ', 'patch.MPQ']));
    expect(clientIdentity('', [])).toMatch(/^[0-9a-f]{8}$/);
  });
});
