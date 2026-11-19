import { Color, IUniform, ShaderMaterial, Texture, UniformsLib, UniformsUtils, Vector3 } from 'three';

/**
 * Lighting shared by every terrain material, so a zone light change updates all chunks at once. Like the client, the
 * colours are gamma-space (sRGB) values summed as `ambient + sun × N·L`, converted to linear light afterwards.
 */
export interface TerrainLighting {
  sunDirection: IUniform<Vector3>;
  sunColor: IUniform<Color>;
  ambientColor: IUniform<Color>;
}

export function createTerrainLighting(): TerrainLighting {
  return {
    sunDirection: { value: new Vector3(0.3, 0.8, 0.5).normalize() },
    // a neutral light: about 1.2× at full sun, 0.45× in the shade
    sunColor: { value: new Color(0.39, 0.37, 0.35) },
    ambientColor: { value: new Color(0.7, 0.71, 0.73) },
  };
}

const VERTEX_SHADER = /* glsl */ `
#include <fog_pars_vertex>
attribute vec2 layerUv;
attribute vec2 splatUv;
varying vec2 vLayerUv;
varying vec2 vSplatUv;
varying vec3 vNormal;
void main() {
  vLayerUv = layerUv;
  vSplatUv = splatUv;
  vNormal = normal;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const FRAGMENT_SHADER = /* glsl */ `
#include <common>
#include <fog_pars_fragment>
uniform sampler2D layer0;
uniform sampler2D layer1;
uniform sampler2D layer2;
uniform sampler2D layer3;
uniform sampler2D splat;
uniform vec3 sunDirection;
uniform vec3 sunColor;
uniform vec3 ambientColor;
varying vec2 vLayerUv;
varying vec2 vSplatUv;
varying vec3 vNormal;
void main() {
  vec3 color = texture2D(layer0, vLayerUv).rgb;
  #if LAYER_COUNT > 1
    vec3 blend = texture2D(splat, vSplatUv).rgb;
    color = mix(color, texture2D(layer1, vLayerUv).rgb, blend.r);
  #endif
  #if LAYER_COUNT > 2
    color = mix(color, texture2D(layer2, vLayerUv).rgb, blend.g);
  #endif
  #if LAYER_COUNT > 3
    color = mix(color, texture2D(layer3, vLayerUv).rgb, blend.b);
  #endif
  float light = clamp(dot(normalize(vNormal), sunDirection), 0.0, 1.0);
  // (the client's fixed-function lighting saturates at 1: without it a strong sun, like midday's, burns orange)
  gl_FragColor = vec4(color * pow(min(sunColor * light + ambientColor, vec3(1.0)), vec3(2.2)), 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`;

/**
 * Blends up to 4 tileset textures with the chunk's alpha map (R, G, B = layers 2..4), lit by the shared sun, with
 * the scene fog. `fallback` fills unused samplers.
 */
export function createTerrainMaterial(
  layers: Texture[],
  splat: Texture | undefined,
  lighting: TerrainLighting,
  fallback: Texture,
): ShaderMaterial {
  const layerCount = Math.max(1, Math.min(4, splat ? layers.length : 1));
  return new ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    defines: { LAYER_COUNT: layerCount },
    fog: true,
    uniforms: {
      ...UniformsUtils.clone(UniformsLib.fog),
      layer0: { value: layers[0] ?? fallback },
      layer1: { value: layers[1] ?? fallback },
      layer2: { value: layers[2] ?? fallback },
      layer3: { value: layers[3] ?? fallback },
      splat: { value: splat ?? fallback },
      ...lighting,
    },
  });
}
