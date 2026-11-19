import { BufferGeometry, CompressedTexture, Layers, Object3D, Texture } from 'three';
import { texturesIn } from './texture-cache';

/** Bytes a texture takes on the graphics card: its compressed levels, or 4 bytes a pixel and a third more for mipmaps. */
export function textureBytes(texture: Texture): number {
  if (texture instanceof CompressedTexture) {
    return (texture.mipmaps as { data: ArrayBufferView }[]).reduce((total, level) => total + level.data.byteLength, 0);
  }
  const image = texture.image as { width?: number; height?: number } | undefined;
  return Math.round((image?.width ?? 0) * (image?.height ?? 0) * 4 * (texture.generateMipmaps ? 4 / 3 : 1));
}

/**
 * Bytes the geometries drawn in a scene take on the graphics card: each buffer counted once, however many geometries
 * share it (a terrain tile's picking chunks all point into the tile's buffers), and only what can be drawn: visible,
 * and on a layer the camera shows (`layers`), e.g. not the collision meshes kept for line of sight.
 */
export function geometryBytes(root: Object3D, layers?: Layers): number {
  const seen = new Set<object>();
  let total = 0;
  const add = (attribute: { array: ArrayBufferView; data?: { array: ArrayBufferView } } | null | undefined) => {
    // (interleaved attributes share one buffer)
    const buffer = attribute?.data ?? attribute;
    if (buffer && !seen.has(buffer)) {
      seen.add(buffer);
      total += buffer.array.byteLength;
    }
  };
  root.traverseVisible((object) => {
    const geometry = (object as { geometry?: BufferGeometry }).geometry;
    if (!(geometry instanceof BufferGeometry) || (layers && !layers.test(object.layers))) {
      return;
    }
    Object.values(geometry.attributes).forEach((attribute) => add(attribute as never));
    add(geometry.index as never);
    add((object as { instanceMatrix?: { array: ArrayBufferView } }).instanceMatrix);
  });
  return total;
}

/** "900 MB", "1.5 GB". */
export function formatBytes(bytes: number): string {
  return bytes >= 1_000_000_000 ? `${(bytes / 1_000_000_000).toFixed(1)} GB` : `${Math.round(bytes / 1_000_000)} MB`;
}

/** An estimate of what a scene takes on the graphics card (bytes): the textures and geometries it draws. */
export function sceneGpuBytes(root: Object3D, layers?: Layers): number {
  let total = geometryBytes(root, layers);
  texturesIn(root).forEach((texture) => (total += textureBytes(texture)));
  return total;
}
