import { RgbaImage } from '@keira/shared/wow-data';
import {
  DataTexture,
  LinearMipmapLinearFilter,
  Material,
  Mesh,
  Object3D,
  RepeatWrapping,
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
