import { Group, Mesh, MeshBasicMaterial } from 'three';
import { setMaterialOpacity, setObjectOpacity } from './see-through';

describe('see-through', () => {
  it('makes a material less solid and back as built, keeping what it was', () => {
    const opaque = new MeshBasicMaterial();
    const version = opaque.version;
    setMaterialOpacity(opaque, 0.4);
    expect([opaque.opacity, opaque.transparent, opaque.depthWrite]).toEqual([0.4, true, false]);
    expect(opaque.version).toBeGreaterThan(version);
    setMaterialOpacity(opaque, 1);
    expect([opaque.opacity, opaque.transparent, opaque.depthWrite]).toEqual([1, false, true]);
    // already see-through (a leaf's alpha blending): relative to its own opacity, and stays blended
    const glass = new MeshBasicMaterial({ transparent: true, opacity: 0.5, depthWrite: false });
    setMaterialOpacity(glass, 0.5);
    expect([glass.opacity, glass.transparent, glass.depthWrite]).toEqual([0.25, true, false]);
    setMaterialOpacity(glass, 1);
    expect([glass.opacity, glass.transparent, glass.depthWrite]).toEqual([0.5, true, false]);
  });

  it('does every material of an object and its children', () => {
    const group = new Group();
    const single = new Mesh(undefined, new MeshBasicMaterial());
    const several = new Mesh(undefined, [new MeshBasicMaterial(), new MeshBasicMaterial()]);
    group.add(single, several, new Group());
    setObjectOpacity(group, 0.3);
    expect((single.material as MeshBasicMaterial).opacity).toBeCloseTo(0.3);
    expect((several.material as MeshBasicMaterial[]).map((m) => m.opacity)).toEqual([0.3, 0.3]);
  });
});
