import { buildCollisionGeometry } from './collision-object';
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
  /** What the server collides with, when the model has any. */
  collision?: BufferGeometry;
}

/** Below this opacity a batch is one the game doesn't show (an invisible wall, a smoke emitter's box). */
const INVISIBLE_ALPHA = 0.02;
/** The invisible batches' materials, drawn see-through while invisible walls are shown. */
const invisibleMaterials = new Set<Material>();
let invisibleShown = false;

/** Shows the parts the game never draws (invisible walls, emitter boxes) as see-through blue, or hides them. */
export function setInvisibleModelsVisible(visible: boolean): void {
  invisibleShown = visible;
  invisibleMaterials.forEach((material) => (material.visible = visible));
}

/**
 * The look of a part the game never draws (an invisible wall, an emitter's box): see-through blue like the game's own
 * debug view of them, shown or hidden with `setInvisibleModelsVisible`.
 */
export function createInvisibleMaterial(): Material {
  const material = new MeshBasicMaterial({ color: 0x4aa8ff, transparent: true, opacity: 0.25, depthWrite: false, side: DoubleSide });
  material.visible = invisibleShown;
  material.userData['invisible'] = true;
  invisibleMaterials.add(material);
  return material;
}

/** One material per batch, following the batch's blend mode: cut-out leaves, glowing additive parts, glass… */
export function createM2Material(batch: M2Mesh['batches'][number], texture: Texture): Material {
  if (batch.alpha < INVISIBLE_ALPHA) {
    return createInvisibleMaterial();
  }
  const additive = batch.blend === M2Blend.NoAlphaAdd || batch.blend === M2Blend.Add;
  const options = {
    map: texture,
    side: batch.twoSided ? DoubleSide : FrontSide,
    alphaTest: batch.blend === M2Blend.AlphaKey ? 0.5 : 0,
    transparent: batch.blend >= M2Blend.Alpha,
    depthWrite: batch.blend < M2Blend.Alpha,
    ...(additive ? { blending: AdditiveBlending } : {}),
    // (faded by its texture weight or colour)
    ...(batch.alpha < 1 ? { transparent: true, opacity: batch.alpha, depthWrite: false } : {}),
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
  return { geometry, materials, radius: (geometry.boundingSphere as Sphere).radius, collision: buildCollisionGeometry(mesh.collision) };
}

/** Disposes a template's geometry and materials (not its shared textures). */
export function disposeM2Template(template: M2Template): void {
  template.geometry.dispose();
  template.collision?.dispose();
  template.materials.forEach((material) => {
    invisibleMaterials.delete(material);
    material.dispose();
  });
}
