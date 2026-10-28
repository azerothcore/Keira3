import { BufferGeometry, CompressedTexture, Object3D, Texture } from 'three';
import { texturesIn } from './texture-cache';

/** Bytes a texture takes on the graphics card: its compressed levels, or 4 bytes a pixel and a third more for mipmaps. */
export function textureBytes(texture: Texture): number {
  if (texture instanceof CompressedTexture) {
    return (texture.mipmaps as { data: ArrayBufferView }[]).reduce((total, level) => total + level.data.byteLength, 0);
  }
  const image = texture.image as { width?: number; height?: number } | undefined;
  return Math.round((image?.width ?? 0) * (image?.height ?? 0) * 4 * (texture.generateMipmaps ? 4 / 3 : 1));
}

/** Bytes the geometries drawn in a scene take on the graphics card (each shared geometry counted once). */
export function geometryBytes(root: Object3D): number {
  const seen = new Set<BufferGeometry>();
  let total = 0;
  root.traverse((object) => {
    const geometry = (object as { geometry?: BufferGeometry }).geometry;
    if (!(geometry instanceof BufferGeometry) || seen.has(geometry)) {
      return;
    }
    seen.add(geometry);
    for (const attribute of Object.values(geometry.attributes)) {
      total += (attribute as { array: ArrayBufferView }).array.byteLength;
    }
    total += geometry.index?.array.byteLength ?? 0;
    const instanced = (object as { instanceMatrix?: { array: ArrayBufferView } }).instanceMatrix;
    total += instanced?.array.byteLength ?? 0;
  });
  return total;
}

/** "900 MB", "1.5 GB". */
export function formatBytes(bytes: number): string {
  return bytes >= 1_000_000_000 ? `${(bytes / 1_000_000_000).toFixed(1)} GB` : `${Math.round(bytes / 1_000_000)} MB`;
}

/** An estimate of what a scene takes on the graphics card (bytes): the textures and geometries it draws. */
export function sceneGpuBytes(root: Object3D): number {
  let total = geometryBytes(root);
  texturesIn(root).forEach((texture) => (total += textureBytes(texture)));
  return total;
}
