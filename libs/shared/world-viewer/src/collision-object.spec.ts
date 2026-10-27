import { EMPTY_COLLISION } from '@keira/shared/wow-data';
import { Raycaster } from 'three';
import { buildCollisionGeometry, COLLISION_LAYER, COLLISION_MATERIAL, collisionMesh } from './collision-object';

describe('collision objects', () => {
  it('builds collision geometry, none for models without collision', () => {
    expect(buildCollisionGeometry(undefined)).toBeUndefined();
    expect(buildCollisionGeometry(EMPTY_COLLISION)).toBeUndefined();
    const geometry = buildCollisionGeometry({
      positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
      indices: new Uint16Array([0, 1, 2]),
    });
    expect(geometry?.getIndex()?.count).toBe(3);
    expect(geometry?.boundingSphere).toBeTruthy();
  });

  it('puts collision meshes on their own layer, as a wireframe nothing can click', () => {
    const geometry = buildCollisionGeometry({ positions: new Float32Array(9), indices: new Uint16Array([0, 1, 2]) });
    const mesh = collisionMesh(geometry!);
    expect(mesh.name).toBe('collision');
    expect(mesh.layers.isEnabled(COLLISION_LAYER)).toBe(true);
    expect(mesh.layers.isEnabled(0)).toBe(false);
    expect(mesh.material).toBe(COLLISION_MATERIAL);
    expect(COLLISION_MATERIAL.wireframe).toBe(true);
    // ordinary rays (layer 0) don't see it
    expect(mesh.layers.test(new Raycaster().layers)).toBe(false);
  });
});
