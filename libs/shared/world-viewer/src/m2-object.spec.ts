import { M2Blend, M2Mesh } from '@keira/shared/wow-data';
import { AdditiveBlending, DoubleSide, FrontSide, MeshBasicMaterial, MeshLambertMaterial, NormalBlending, Texture } from 'three';
import { buildM2Template, createM2Material, disposeM2Template } from './m2-object';

const batch = (blend: M2Blend, overrides: Partial<M2Mesh['batches'][number]> = {}): M2Mesh['batches'][number] => ({
  start: 0,
  count: 3,
  textureType: 0,
  blend,
  twoSided: false,
  unlit: false,
  ...overrides,
});

describe('m2-object', () => {
  const texture = new Texture();

  it('picks a material per blend mode', () => {
    const opaque = createM2Material(batch(M2Blend.Opaque), texture) as MeshLambertMaterial;
    expect(opaque).toBeInstanceOf(MeshLambertMaterial);
    expect(opaque.map).toBe(texture);
    expect(opaque.transparent).toBe(false);
    expect(opaque.side).toBe(FrontSide);

    const leaves = createM2Material(batch(M2Blend.AlphaKey, { twoSided: true }), texture);
    expect(leaves.alphaTest).toBe(0.5);
    expect(leaves.side).toBe(DoubleSide);

    const glass = createM2Material(batch(M2Blend.Alpha), texture);
    expect(glass.transparent).toBe(true);
    expect(glass.depthWrite).toBe(false);
    expect(glass.blending).toBe(NormalBlending);

    for (const blend of [M2Blend.Add, M2Blend.NoAlphaAdd]) {
      const glow = createM2Material(batch(blend), texture);
      expect(glow).toBeInstanceOf(MeshBasicMaterial);
      expect(glow.blending).toBe(AdditiveBlending);
    }
    expect(createM2Material(batch(M2Blend.Opaque, { unlit: true }), texture)).toBeInstanceOf(MeshBasicMaterial);
  });

  it('builds a template with one draw group per batch and disposes it', () => {
    const mesh: M2Mesh = {
      positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
      normals: new Float32Array(9),
      uvs: new Float32Array(6),
      indices: new Uint16Array([0, 1, 2, 2, 1, 0]),
      batches: [batch(M2Blend.Opaque), batch(M2Blend.Alpha, { start: 3 })],
    };
    const fallback = new Texture();
    const template = buildM2Template(mesh, [texture], fallback);
    expect(template.geometry.groups).toEqual([
      { start: 0, count: 3, materialIndex: 0 },
      { start: 3, count: 3, materialIndex: 1 },
    ]);
    expect((template.materials[0] as MeshLambertMaterial).map).toBe(texture);
    expect((template.materials[1] as MeshLambertMaterial).map).toBe(fallback);
    expect(template.geometry.boundingSphere).not.toBeNull();

    const disposed = vi.fn();
    template.geometry.addEventListener('dispose', disposed);
    template.materials.forEach((material) => material.addEventListener('dispose', disposed));
    disposeM2Template(template);
    expect(disposed).toHaveBeenCalledTimes(3);
  });
});
