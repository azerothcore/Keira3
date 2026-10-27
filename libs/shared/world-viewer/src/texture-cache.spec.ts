import {
  BoxGeometry,
  CompressedTexture,
  DataTexture,
  Group,
  Line,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  RGB_S3TC_DXT1_Format,
  RGBA_S3TC_DXT1_Format,
  RGBA_S3TC_DXT3_Format,
  RGBA_S3TC_DXT5_Format,
  ShaderMaterial,
  SRGBColorSpace,
} from 'three';
import { createGpuTexture, createTexture, TextureCache, texturesIn } from './texture-cache';

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

  it('frees the graphics memory of textures nothing uses, once more than allowed were loaded', async () => {
    const cache = new TextureCache((path) => Promise.resolve(path === 'missing' ? undefined : image));
    const [used, inShader, unused] = await Promise.all([cache.get('used'), cache.get('shader'), cache.get('unused')]);
    await cache.get('missing');
    const scene = new Group();
    scene.add(
      new Mesh(new BoxGeometry(), new MeshBasicMaterial({ map: used })),
      new Mesh(new BoxGeometry(), [new ShaderMaterial({ uniforms: { layers: { value: [inShader, 1] }, tint: { value: 2 } } })]),
      new Line(),
    );
    const disposals = [used, inShader, unused].map((texture) => vi.spyOn(texture, 'dispose'));
    expect(cache.release(scene, 3)).toBe(0);
    expect(cache.release(scene, 2)).toBe(1);
    expect(disposals.map((spy) => spy.mock.calls.length)).toEqual([0, 0, 1]);
    expect(texturesIn(scene)).toEqual(new Set([used, inShader]));
  });

  it('uploads DXT textures as they are, with their mip levels when there are all of them', async () => {
    const mip = (size: number) => ({ width: size, height: size, data: new Uint8Array(8) });
    const full = createGpuTexture({ format: 'dxt5', width: 4, height: 4, mips: [mip(4), mip(2), mip(1)] }) as CompressedTexture;
    expect(full).toBeInstanceOf(CompressedTexture);
    expect(full.format).toBe(RGBA_S3TC_DXT5_Format);
    expect(full.minFilter).toBe(LinearMipmapLinearFilter);
    expect(full.colorSpace).toBe(SRGBColorSpace);
    const top = createGpuTexture({ format: 'dxt1', width: 4, height: 4, mips: [mip(4)] });
    expect(top.minFilter).toBe(LinearFilter);
    expect(top.format).toBe(RGB_S3TC_DXT1_Format);
    expect(createGpuTexture({ format: 'dxt1a', width: 4, height: 4, mips: [mip(4)] }).format).toBe(RGBA_S3TC_DXT1_Format);
    expect(createGpuTexture({ format: 'dxt3', width: 4, height: 4, mips: [mip(4)] }).format).toBe(RGBA_S3TC_DXT3_Format);
    expect(createGpuTexture({ format: 'rgba', ...image })).toBeInstanceOf(DataTexture);
    // through the cache too
    const cache = new TextureCache(() => Promise.resolve({ format: 'dxt1' as const, width: 4, height: 4, mips: [mip(4)] }));
    expect(await cache.get('a')).toBeInstanceOf(CompressedTexture);
  });

  it('creates repeating textures, sRGB unless asked otherwise', () => {
    expect(createTexture(image).colorSpace).toBe(SRGBColorSpace);
    expect(createTexture(image, false).colorSpace).not.toBe(SRGBColorSpace);
  });
});
