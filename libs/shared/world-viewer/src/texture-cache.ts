import { GpuTexture, RgbaImage } from '@keira/shared/wow-data';
import {
  CompressedPixelFormat,
  CompressedTexture,
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  Material,
  Mesh,
  Object3D,
  RepeatWrapping,
  RGB_S3TC_DXT1_Format,
  RGBA_S3TC_DXT1_Format,
  RGBA_S3TC_DXT3_Format,
  RGBA_S3TC_DXT5_Format,
  RGBAFormat,
  SRGBColorSpace,
  Texture,
} from 'three';

/** Loads each BLP once and shares the resulting texture (terrain tilesets, model skins…). */
export class TextureCache {
  private readonly textures = new Map<string, Promise<Texture>>();
  /** The textures loaded so far. */
  private readonly loaded = new Set<Texture>();
  /** Shown when a texture is missing from the archives: plain mid grey. */
  readonly fallback = createTexture({ width: 1, height: 1, data: new Uint8Array([128, 128, 128, 255]) });

  constructor(private readonly load: (path: string) => Promise<RgbaImage | GpuTexture | undefined>) {}

  get size(): number {
    return this.textures.size;
  }

  get(path: string): Promise<Texture> {
    const key = path.toLowerCase();
    let texture = this.textures.get(key);
    if (!texture) {
      texture = this.load(path)
        .then((image) => (image ? ('format' in image ? createGpuTexture(image) : createTexture(image)) : this.fallback))
        .catch(() => this.fallback)
        .then((loaded) => (loaded !== this.fallback && this.loaded.add(loaded), loaded));
      this.textures.set(key, texture);
    }
    return texture;
  }

  /**
   * Frees the graphics memory of the textures nothing in `scene` uses (anymore), once more than `keep` were loaded:
   * the image stays here, and goes back to the graphics card when something uses it again.
   */
  release(scene: Object3D, keep: number): number {
    if (this.loaded.size <= keep) {
      return 0;
    }
    const used = texturesIn(scene);
    let released = 0;
    for (const texture of this.loaded) {
      if (!used.has(texture)) {
        texture.dispose();
        released++;
      }
    }
    return released;
  }

  dispose(): void {
    this.textures.forEach((texture) => void texture.then((t) => t.dispose()));
    this.textures.clear();
    this.fallback.dispose();
  }
}

/** Every texture the meshes of `root` use: their materials' maps and the textures among shader uniforms. */
export function texturesIn(root: Object3D): Set<Texture> {
  const textures = new Set<Texture>();
  const add = (value: unknown) => {
    if (value instanceof Texture) {
      textures.add(value);
    } else if (Array.isArray(value)) {
      value.forEach(add);
    }
  };
  root.traverse((object) => {
    if (!(object instanceof Mesh)) {
      return;
    }
    for (const material of (Array.isArray(object.material) ? object.material : [object.material]) as (Material & {
      map?: Texture;
      uniforms?: Record<string, { value: unknown }>;
    })[]) {
      add(material.map);
      Object.values(material.uniforms ?? {}).forEach((uniform) => add(uniform.value));
    }
  });
  return textures;
}

const DXT_FORMATS: Record<Exclude<GpuTexture['format'], 'rgba'>, CompressedPixelFormat> = {
  dxt1: RGB_S3TC_DXT1_Format,
  dxt1a: RGBA_S3TC_DXT1_Format,
  dxt3: RGBA_S3TC_DXT3_Format,
  dxt5: RGBA_S3TC_DXT5_Format,
};

/** A texture from what the graphics card takes: DXT mip levels uploaded as they are (no decoding), or RGBA. */
export function createGpuTexture(image: GpuTexture): Texture {
  if (image.format === 'rgba') {
    return createTexture(image);
  }
  const texture = new CompressedTexture(image.mips, image.width, image.height, DXT_FORMATS[image.format]);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  // every level down to 1×1 is needed to blend between them; otherwise the top one alone
  const levels = Math.floor(Math.log2(Math.max(image.width, image.height))) + 1;
  texture.minFilter = image.mips.length >= levels ? LinearMipmapLinearFilter : LinearFilter;
  texture.generateMipmaps = false;
  texture.anisotropy = 4;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
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
