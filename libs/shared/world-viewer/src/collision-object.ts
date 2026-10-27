import { CollisionMesh } from '@keira/shared/wow-data';
import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial } from 'three';

/** Collision meshes live on this layer: the camera sees it only when hitboxes are shown, and clicks never hit it (only line-of-sight rays). */
export const COLLISION_LAYER = 3;
/** The server's collision (vmaps, see `WorldVmaps`): drawn with the hitboxes, never picked, hit by line-of-sight rays. */
export const SERVER_COLLISION_LAYER = 4;

/** One see-through wireframe for every collision mesh (never disposed: shared by all of them). */
export const COLLISION_MATERIAL = new MeshBasicMaterial({ color: 0xff3b5c, wireframe: true, transparent: true, opacity: 0.7 });

/** The geometry of a collision mesh, or undefined when there is none. */
export function buildCollisionGeometry(collision: CollisionMesh | undefined): BufferGeometry | undefined {
  if (!collision || collision.indices.length === 0) {
    return undefined;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(collision.positions, 3));
  geometry.setIndex(new BufferAttribute(collision.indices, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

/** A collision mesh on the collision layer: ordinary picking never sees it, line-of-sight rays do. */
export function collisionMesh(geometry: BufferGeometry): Mesh {
  const mesh = new Mesh(geometry, COLLISION_MATERIAL);
  mesh.name = 'collision';
  mesh.layers.set(COLLISION_LAYER);
  return mesh;
}
