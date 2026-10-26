import { DataTexture, SRGBColorSpace } from 'three';
import { createTexture, TextureCache } from './texture-cache';

describe('TextureCache', () => {
  const image = { width: 2, height: 2, data: new Uint8Array(16) };

  it('loads each path once, case-insensitively', async () => {
    const load = vi.fn().mockResolvedValue(image);
    const cache = new TextureCache(load);
    const [a, b] = await Promise.all([cache.get('Tileset\\A.blp'), cache.get('tileset\\a.BLP')]);
    expect(a).toBe(b);
    expect(load).toHaveBeenCalledTimes(1);
    expect(cache.size).toBe(1);
    expect((a as DataTexture).image.width).toBe(2);
  });

  it('falls back to grey for missing or broken textures', async () => {
    const cache = new TextureCache((path) => (path === 'broken' ? Promise.reject(new Error('bad blp')) : Promise.resolve(undefined)));
    expect(await cache.get('missing')).toBe(cache.fallback);
    expect(await cache.get('broken')).toBe(cache.fallback);
  });

  it('disposes its textures', async () => {
    const cache = new TextureCache(() => Promise.resolve(image));
    const texture = await cache.get('a');
    const dispose = vi.spyOn(texture, 'dispose');
    cache.dispose();
    await Promise.resolve();
    expect(dispose).toHaveBeenCalled();
    expect(cache.size).toBe(0);
  });

  it('creates repeating textures, sRGB unless asked otherwise', () => {
    expect(createTexture(image).colorSpace).toBe(SRGBColorSpace);
    expect(createTexture(image, false).colorSpace).not.toBe(SRGBColorSpace);
  });
});
