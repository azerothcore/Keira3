import { RgbaImage } from '@keira/shared/wow-data';
import { DataTexture, LinearMipmapLinearFilter, RepeatWrapping, RGBAFormat, SRGBColorSpace, Texture } from 'three';

/** Loads each BLP once and shares the resulting texture (terrain tilesets, model skins…). */
export class TextureCache {
  private readonly textures = new Map<string, Promise<Texture>>();
  /** Shown when a texture is missing from the archives: plain mid grey. */
  readonly fallback = createTexture({ width: 1, height: 1, data: new Uint8Array([128, 128, 128, 255]) });

  constructor(private readonly load: (path: string) => Promise<RgbaImage | undefined>) {}

  get size(): number {
    return this.textures.size;
  }

  get(path: string): Promise<Texture> {
    const key = path.toLowerCase();
    let texture = this.textures.get(key);
    if (!texture) {
      texture = this.load(path)
        .then((image) => (image ? createTexture(image) : this.fallback))
        .catch(() => this.fallback);
      this.textures.set(key, texture);
    }
    return texture;
  }

  dispose(): void {
    this.textures.forEach((texture) => void texture.then((t) => t.dispose()));
    this.textures.clear();
    this.fallback.dispose();
  }
}

export function createTexture(image: RgbaImage, srgb = true): DataTexture {
  const texture = new DataTexture(image.data, image.width, image.height, RGBAFormat);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 4;
  if (srgb) {
    texture.colorSpace = SRGBColorSpace;
  }
  texture.needsUpdate = true;
  return texture;
}
