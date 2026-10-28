import { BufferGeometry, Color, LessEqualDepth, Mesh, MeshBasicMaterial, ShaderMaterial } from 'three';
import { CHUNK_SIZE, TILE_SIZE } from '@keira/shared/wow-data';

/** Render layers of the terrain overlays (tile grid and steep slopes) and of its wireframe: drawn only while on. */
export const TERRAIN_OVERLAY_LAYER = 5;
export const TERRAIN_WIREFRAME_LAYER = 6;

/** What the terrain overlays show. */
export interface TerrainOverlayOptions {
  grid: boolean;
  slopes: boolean;
}

/** The steepest ground players walk up (degrees): steeper ground is drawn red by the slopes overlay. */
export const WALKABLE_SLOPE = 50;

const VERTEX_SHADER = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormal;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const FRAGMENT_SHADER = /* glsl */ `
uniform float showGrid;
uniform float showSlopes;
uniform float slopeCos;
uniform float chunkSize;
uniform float tileSize;
uniform vec3 chunkColor;
uniform vec3 tileColor;
varying vec3 vWorld;
varying vec3 vNormal;
// 1 on the lines every 'size' yards (about 'width' pixels wide whatever the distance), 0 between them
float gridLine(vec2 p, float size, float width) {
  vec2 d = abs(fract(p / size - 0.5) - 0.5) * size;
  vec2 w = fwidth(p) * width;
  vec2 l = 1.0 - smoothstep(vec2(0.0), w, d);
  return max(l.x, l.y);
}
void main() {
  vec4 color = vec4(0.0);
  if (showSlopes > 0.5 && normalize(vNormal).y < slopeCos) {
    color = vec4(0.9, 0.15, 0.1, 0.45);
  }
  if (showGrid > 0.5) {
    color = mix(color, vec4(chunkColor, 0.55), gridLine(vWorld.xz, chunkSize, 1.0));
    color = mix(color, vec4(tileColor, 0.9), gridLine(vWorld.xz, tileSize, 2.0));
  }
  if (color.a <= 0.01) {
    discard;
  }
  gl_FragColor = color;
}
`;

/**
 * One material for every terrain mesh's overlay: the tile (ADT) and chunk grid, and the ground too steep to walk up,
 * drawn over the terrain (same triangles, so it never fights with it for depth).
 */
export function createTerrainOverlayMaterial(): ShaderMaterial {
  const material = new ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    depthFunc: LessEqualDepth,
    uniforms: {
      showGrid: { value: 0 },
      showSlopes: { value: 0 },
      slopeCos: { value: Math.cos((WALKABLE_SLOPE * Math.PI) / 180) },
      chunkSize: { value: CHUNK_SIZE },
      tileSize: { value: TILE_SIZE },
      chunkColor: { value: new Color(0xfff27a) },
      tileColor: { value: new Color(0xff4fd8) },
    },
  });
  material.userData['shared'] = true;
  return material;
}

export function setTerrainOverlay(material: ShaderMaterial, options: TerrainOverlayOptions): void {
  material.uniforms['showGrid'].value = options.grid ? 1 : 0;
  material.uniforms['showSlopes'].value = options.slopes ? 1 : 0;
}

/** The terrain's triangles as green lines over it. */
export function createTerrainWireframeMaterial(): MeshBasicMaterial {
  const material = new MeshBasicMaterial({
    color: 0x5dff7a,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    depthFunc: LessEqualDepth,
  });
  material.userData['shared'] = true;
  return material;
}

/** The overlay and wireframe of a terrain mesh (sharing its triangles), not picked, on their own layers. */
export function terrainOverlayMeshes(geometry: BufferGeometry, overlay: ShaderMaterial, wireframe: MeshBasicMaterial): Mesh[] {
  return [
    [overlay, TERRAIN_OVERLAY_LAYER],
    [wireframe, TERRAIN_WIREFRAME_LAYER],
  ].map(([material, layer]) => {
    const mesh = new Mesh(geometry, material as ShaderMaterial | MeshBasicMaterial);
    mesh.name = 'terrain-overlay';
    mesh.layers.set(layer as number);
    mesh.raycast = () => undefined;
    mesh.renderOrder = 2;
    return mesh;
  });
}
