import { ModelPlacement, WmoModel, worldToScene } from '@keira/shared/wow-data';
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  FrontSide,
  Group,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  Quaternion,
  Texture,
} from 'three';

/** Rotation taking server axes (x north, y west, z up) to scene axes (x = −y, y = z, z = −x). */
const SERVER_TO_SCENE = new Quaternion().setFromRotationMatrix(new Matrix4().set(0, -1, 0, 0, 0, 0, 1, 0, -1, 0, 0, 0, 0, 0, 0, 1));
const SCENE_TO_SERVER = SERVER_TO_SCENE.clone().invert();

/** A rotation given in server axes, expressed in scene axes (for geometry already converted to scene axes). */
export function serverQuaternionToScene(rotation: ArrayLike<number>): Quaternion {
  const q = new Quaternion(rotation[0], rotation[1], rotation[2], rotation[3]);
  return SERVER_TO_SCENE.clone().multiply(q).multiply(SCENE_TO_SERVER);
}

/** Places an object (whose geometry is in scene axes) as described by an ADT placement. */
export function applyPlacement(object: Object3D, placement: ModelPlacement): void {
  const p = worldToScene({ x: placement.position[0], y: placement.position[1], z: placement.position[2] });
  object.position.set(p.x, p.y, p.z);
  object.quaternion.copy(serverQuaternionToScene(placement.rotation));
  object.scale.setScalar(placement.scale);
}

/**
 * Builds a reusable building template: one mesh per WMO group, one draw group per batch. Outdoor groups are lit by
 * the scene; indoor groups use their baked vertex lighting. Clone it per placement (geometry and materials are shared).
 */
export function buildWmoObject(model: WmoModel, textures: Texture[], fallback: Texture): Group {
  const template = new Group();
  const cache = new Map<string, Material>();
  const material = (index: number, indoor: boolean): Material => {
    const info = model.materials[index];
    const key = `${index}:${indoor}`;
    let result = cache.get(key);
    if (!result) {
      const options = {
        map: textures[index] ?? fallback,
        alphaTest: 0.5,
        side: info?.twoSided ? DoubleSide : FrontSide,
      };
      result = indoor || info?.unlit ? new MeshBasicMaterial({ ...options, vertexColors: indoor }) : new MeshLambertMaterial(options);
      cache.set(key, result);
    }
    return result;
  };

  for (const group of model.groups) {
    if (group.indices.length === 0) {
      continue;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(group.positions, 3));
    geometry.setAttribute('normal', new BufferAttribute(group.normals, 3));
    geometry.setAttribute('uv', new BufferAttribute(group.uvs, 2));
    if (group.colors) {
      geometry.setAttribute('color', new BufferAttribute(group.colors, 3));
    }
    geometry.setIndex(new BufferAttribute(group.indices, 1));
    const indoor = group.indoor && !!group.colors;
    const materials: Material[] = [];
    group.batches.forEach((batch, i) => {
      geometry.addGroup(batch.start, batch.count, i);
      materials.push(material(batch.material, indoor));
    });
    geometry.computeBoundingSphere();
    template.add(new Mesh(geometry, materials));
  }
  template.userData['materials'] = [...cache.values()];
  return template;
}

/** Disposes a template's geometries and materials (not its shared textures). */
export function disposeWmoObject(template: Group): void {
  template.traverse((object) => {
    if (object instanceof Mesh) {
      object.geometry.dispose();
    }
  });
  (template.userData['materials'] as Material[]).forEach((material) => material.dispose());
}
