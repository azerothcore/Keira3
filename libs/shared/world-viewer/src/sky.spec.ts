import { BackSide, Color } from 'three';
import { createSkyDome, setSkyColors } from './sky';

describe('sky', () => {
  it('is a hidden dome drawn behind everything until coloured by a zone', () => {
    const sky = createSkyDome();
    expect(sky.visible).toBe(false);
    expect(sky.material.side).toBe(BackSide);
    expect(sky.material.depthTest).toBe(false);
    setSkyColors(sky, { top: new Color(1, 0, 0), middle: new Color(0, 1, 0), horizon: new Color(0, 0, 1), ground: new Color(1, 1, 1) });
    expect((sky.material.uniforms['middle'].value as Color).g).toBe(1);
    expect((sky.material.uniforms['ground'].value as Color).r).toBe(1);
  });
});
