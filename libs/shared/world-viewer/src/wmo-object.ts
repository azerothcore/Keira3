import { buildCollisionGeometry, collisionMesh } from './collision-object';
import { createInvisibleMaterial } from './m2-object';
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

/** Render layer of building roofs: the camera shows it unless roofs are hidden; picking (layer 0) never sees it. */
export const ROOF_LAYER = 2;
/** Render layer of buildings' invisible walls: drawn (while shown), but never ground for picking and snapping. */
export const INVISIBLE_WALL_LAYER = 7;

/** Roof textures live in DUNGEONS\TEXTURES\ROOF (and are named …ROOF…). */
export function isRoofTexture(texture: string | undefined): boolean {
  return !!texture && /roof/i.test(texture);
}

const WMO_BLEND_ALPHA_KEY = 1;
const WMO_BLEND_ALPHA = 2;

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
  let wallMaterial: Material | undefined;
  const invisibleMaterial = (): Material => (wallMaterial ??= createInvisibleMaterial());
  const material = (index: number, indoor: boolean): Material => {
    const info = model.materials[index];
    const key = `${index}:${indoor}`;
    let result = cache.get(key);
    if (!result) {
      // Only alpha-keyed materials (leaves, fences, windows) are cut out by their alpha: on opaque ones (most walls
      // and roofs) the alpha channel holds other data and would make them see-through.
      const blend = info?.blend ?? 0;
      const options = {
        map: textures[index] ?? fallback,
        alphaTest: blend === WMO_BLEND_ALPHA_KEY ? 0.5 : 0,
        transparent: blend >= WMO_BLEND_ALPHA,
        depthWrite: blend < WMO_BLEND_ALPHA,
        side: info?.twoSided ? DoubleSide : FrontSide,
      };
      result = indoor || info?.unlit ? new MeshBasicMaterial({ ...options, vertexColors: indoor }) : new MeshLambertMaterial(options);
      // (indoor parts can be hidden from outside: see setWmoIndoorVisible)
      result.userData = { indoor };
      cache.set(key, result);
    }
    return result;
  };

  model.groups.forEach((group, groupIndex) => {
    const collision = buildCollisionGeometry(group.collision);
    if (collision) {
      template.add(collisionMesh(collision));
    }
    // its invisible walls, drawn see-through blue while invisible walls are shown
    if (group.collision?.invisible) {
      const walls = new BufferGeometry();
      walls.setAttribute('position', new BufferAttribute(group.collision.positions, 3));
      walls.setIndex(new BufferAttribute(group.collision.invisible, 1));
      walls.computeBoundingSphere();
      const mesh = new Mesh(walls, invisibleMaterial());
      mesh.name = 'invisible-walls';
      mesh.userData = { group: groupIndex };
      mesh.layers.set(INVISIBLE_WALL_LAYER);
      template.add(mesh);
    }
    if (group.indices.length === 0) {
      return;
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
    // roofs get their own mesh on ROOF_LAYER, so they can be hidden to look (and click) inside
    const roof = new BufferGeometry();
    for (const name of Object.keys(geometry.attributes)) {
      roof.setAttribute(name, geometry.getAttribute(name));
    }
    roof.setIndex(geometry.getIndex());
    const materials: Material[] = [];
    const roofMaterials: Material[] = [];
    group.batches.forEach((batch) => {
      const isRoof = !group.indoor && isRoofTexture(model.materials[batch.material]?.texture);
      const [target, list] = isRoof ? [roof, roofMaterials] : [geometry, materials];
      target.addGroup(batch.start, batch.count, list.length);
      list.push(material(batch.material, indoor));
    });
    if (materials.length > 0) {
      geometry.computeBoundingSphere();
      const mesh = new Mesh(geometry, materials);
      // (which group, named when hovered)
      mesh.userData = { group: groupIndex };
      template.add(mesh);
    }
    if (roofMaterials.length > 0) {
      roof.computeBoundingSphere();
      const mesh = new Mesh(roof, roofMaterials);
      mesh.name = 'roof';
      mesh.userData = { group: groupIndex };
      mesh.layers.set(ROOF_LAYER);
      template.add(mesh);
    }
  });
  template.userData['materials'] = [...cache.values(), ...(wallMaterial ? [wallMaterial] : [])];
  return template;
}

/**
 * Shows or hides a building template's indoor parts (and those of every copy of it): the client draws them only from
 * inside or through a doorway, so from outside some (ceilings over tunnels, say) show as flat untextured squares.
 * Hidden ones are still picked, so things can be placed inside.
 */
export function setWmoIndoorVisible(template: Group, visible: boolean): void {
  for (const material of template.userData['materials'] as Material[]) {
    if (material.userData['indoor']) {
      material.visible = visible;
    }
  }
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
