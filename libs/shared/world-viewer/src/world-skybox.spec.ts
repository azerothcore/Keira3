import { M2Blend, M2Mesh } from '@keira/shared/wow-data';
import { AdditiveBlending, Material, Mesh, MeshBasicMaterial } from 'three';
import { TextureCache } from './texture-cache';
import { SKYBOX_DISTANCE, WorldSkybox } from './world-skybox';

const mesh = (texture?: string): M2Mesh => ({
  positions: new Float32Array([0, 0, 0, 100, 0, 0, 0, 100, 0]),
  normals: new Float32Array(9),
  uvs: new Float32Array(6),
  indices: new Uint16Array([0, 1, 2]),
  batches: [{ start: 0, count: 3, texture, textureType: 0, blend: M2Blend.Add, geoset: 0, twoSided: false, unlit: false }],
  collision: { positions: new Float32Array(0), indices: new Uint16Array(0) },
});

describe('WorldSkybox', () => {
  const setup = () => {
    const source = { getM2: vi.fn().mockResolvedValue(mesh('Stars.blp')) };
    const textures = new TextureCache(() => Promise.resolve(undefined));
    const onChange = vi.fn();
    return { source, onChange, skybox: new WorldSkybox(source, textures, onChange) };
  };
  const settle = () => new Promise((resolve) => setTimeout(resolve));

  it('draws the skybox model around the camera, behind everything, and changes or hides it', async () => {
    const { source, onChange, skybox } = setup();
    skybox.show('Environments\\Stars\\Stars.m2');
    await settle();
    expect(source.getM2).toHaveBeenCalledWith('Environments\\Stars\\Stars.m2');
    const drawn = skybox.group.children[0] as Mesh;
    const material = (drawn.material as Material[])[0] as MeshBasicMaterial;
    expect(material.depthWrite).toBe(false);
    expect(material.transparent).toBe(false);
    expect(material.fog).toBe(false);
    expect(material.blending).toBe(AdditiveBlending);
    expect(drawn.renderOrder).toBe(-1);
    expect(onChange).toHaveBeenCalled();
    skybox.place({ position: { x: 1, y: 2, z: 3 }, far: 4000 }, 0.5);
    expect(skybox.group.position.toArray()).toEqual([1, 2, 3]);
    expect(skybox.group.rotation.y).toBe(0.5);
    expect(drawn.scale.x).toBeCloseTo((4000 * SKYBOX_DISTANCE) / (drawn.userData as { radius: number }).radius);
    // the same one again (whatever its case): nothing reloaded
    skybox.show('ENVIRONMENTS\\STARS\\STARS.M2');
    expect(source.getM2).toHaveBeenCalledTimes(1);
    // another, then none
    source.getM2.mockResolvedValueOnce(mesh());
    skybox.show('Aurora.m2');
    await settle();
    expect(skybox.group.children).toHaveLength(1);
    skybox.show(undefined);
    expect(skybox.group.children).toHaveLength(0);
    skybox.place({ position: { x: 0, y: 0, z: 0 }, far: 4000 });
    expect(skybox.group.rotation.y).toBe(0);
  });

  it('drops a skybox changed while it loaded, and copes with missing or broken models', async () => {
    const { source, skybox } = setup();
    skybox.show('Slow.m2');
    skybox.show('Fast.m2');
    await settle();
    expect(skybox.group.children).toHaveLength(1);
    // a change while a missing model loads
    source.getM2.mockResolvedValueOnce(undefined);
    skybox.show('Missing.m2');
    skybox.show(undefined);
    await settle();
    source.getM2.mockResolvedValueOnce(undefined);
    skybox.show('Missing.m2');
    await settle();
    expect(skybox.group.children).toHaveLength(0);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    source.getM2.mockRejectedValueOnce(new Error('bad m2'));
    skybox.show('Broken.m2');
    await settle();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('bad m2'));
    skybox.dispose();
    warn.mockRestore();
  });
});
