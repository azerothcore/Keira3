import { BackSide, Color, Mesh, ShaderMaterial, SphereGeometry } from 'three';

const VERTEX_SHADER = /* glsl */ `
varying vec3 vDirection;
void main() {
  vDirection = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `
uniform vec3 top;
uniform vec3 middle;
uniform vec3 horizon;
uniform vec3 ground;
varying vec3 vDirection;
void main() {
  float h = normalize(vDirection).y;
  vec3 color = h < 0.0
    ? ground
    : mix(mix(horizon, middle, smoothstep(0.0, 0.2, h)), top, smoothstep(0.2, 0.9, h));
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;

export interface SkyColors {
  top: Color;
  middle: Color;
  horizon: Color;
  /** Below the horizon (seen through holes in the terrain or past its edge): the fog colour. */
  ground: Color;
}

/**
 * A sky dome drawn behind everything with the zone's sky gradient. Keep it centred on the camera and inside its far
 * plane (see `WorldScene.updateMarkerScale`).
 */
export function createSkyDome(): Mesh<SphereGeometry, ShaderMaterial> {
  const material = new ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      top: { value: new Color() },
      middle: { value: new Color() },
      horizon: { value: new Color() },
      ground: { value: new Color() },
    },
    side: BackSide,
    depthTest: false,
    depthWrite: false,
    fog: false,
  });
  const sky = new Mesh(new SphereGeometry(1, 32, 16), material);
  sky.name = 'sky';
  sky.renderOrder = -1;
  sky.frustumCulled = false;
  sky.visible = false;
  return sky;
}

export function setSkyColors(sky: Mesh<SphereGeometry, ShaderMaterial>, colors: SkyColors): void {
  for (const [key, color] of Object.entries(colors)) {
    (sky.material.uniforms[key].value as Color).copy(color);
  }
}
