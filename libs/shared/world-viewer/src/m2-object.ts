import { M2Blend, M2Mesh } from '@keira/shared/wow-data';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  FrontSide,
  Material,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Sphere,
  Texture,
} from 'three';

/** Geometry (one draw group per batch) and materials of an M2, shared by every placement of the model. */
export interface M2Template {
  geometry: BufferGeometry;
  materials: Material[];
  /** Bounding sphere radius of the model at scale 1. */
  radius: number;
}

/** One material per batch, following the batch's blend mode: cut-out leaves, glowing additive parts, glass… */
export function createM2Material(batch: M2Mesh['batches'][number], texture: Texture): Material {
  const additive = batch.blend === M2Blend.NoAlphaAdd || batch.blend === M2Blend.Add;
  const options = {
    map: texture,
    side: batch.twoSided ? DoubleSide : FrontSide,
    alphaTest: batch.blend === M2Blend.AlphaKey ? 0.5 : 0,
    transparent: batch.blend >= M2Blend.Alpha,
    depthWrite: batch.blend < M2Blend.Alpha,
    ...(additive ? { blending: AdditiveBlending } : {}),
  };
  // additive parts (glows, light beams) aren't shaded: lighting would only dim them
  return batch.unlit || additive ? new MeshBasicMaterial(options) : new MeshLambertMaterial(options);
}

/**
 * Builds a model's template. `textures[i]` is the texture of batch `i` (the caller resolves replaceable textures);
 * transparent batches are drawn after the opaque ones by three.js' own sorting of transparent materials.
 */
export function buildM2Template(mesh: M2Mesh, textures: Texture[], fallback: Texture): M2Template {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(mesh.positions, 3));
  geometry.setAttribute('normal', new BufferAttribute(mesh.normals, 3));
  geometry.setAttribute('uv', new BufferAttribute(mesh.uvs, 2));
  geometry.setIndex(new BufferAttribute(mesh.indices, 1));
  const materials = mesh.batches.map((batch, i) => {
    geometry.addGroup(batch.start, batch.count, i);
    return createM2Material(batch, textures[i] ?? fallback);
  });
  geometry.computeBoundingSphere();
  return { geometry, materials, radius: (geometry.boundingSphere as Sphere).radius };
}

/** Disposes a template's geometry and materials (not its shared textures). */
export function disposeM2Template(template: M2Template): void {
  template.geometry.dispose();
  template.materials.forEach((material) => material.dispose());
}
