import { Texture } from 'three';
import { createTerrainLighting, createTerrainMaterial } from './terrain-material';

describe('terrain material', () => {
  const fallback = new Texture();
  const textures = [new Texture(), new Texture(), new Texture(), new Texture(), new Texture()];

  it('blends as many layers as the chunk has (max 4), filling unused samplers', () => {
    const lighting = createTerrainLighting();
    const material = createTerrainMaterial(textures.slice(0, 2), new Texture(), lighting, fallback);
    expect(material.defines['LAYER_COUNT']).toBe(2);
    expect(material.uniforms['layer1'].value).toBe(textures[1]);
    expect(material.uniforms['layer2'].value).toBe(fallback);
    expect(material.uniforms['sunColor']).toBe(lighting.sunColor);
    expect(material.fog).toBe(true);

    expect(createTerrainMaterial(textures, new Texture(), lighting, fallback).defines['LAYER_COUNT']).toBe(4);
  });

  it('uses only the base layer without alpha map, and the fallback without textures', () => {
    const lighting = createTerrainLighting();
    const single = createTerrainMaterial(textures.slice(0, 3), undefined, lighting, fallback);
    expect(single.defines['LAYER_COUNT']).toBe(1);
    expect(single.uniforms['splat'].value).toBe(fallback);
    expect(createTerrainMaterial([], undefined, lighting, fallback).uniforms['layer0'].value).toBe(fallback);
  });
});
