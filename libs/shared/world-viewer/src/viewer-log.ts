import { WorldRenderer } from './world-renderer';

/** WEBGL_debug_renderer_info's parameters (the real graphics card, rather than "WebKit WebGL"). */
const UNMASKED_VENDOR = 0x9245;
const UNMASKED_RENDERER = 0x9246;

/** The graphics card and what it offers, for the top of the log. */
export function graphicsDescription(renderer: WorldRenderer, compressedTextures: boolean): string {
  const gl = renderer.getContext?.();
  if (!gl) {
    return 'unknown';
  }
  const unmasked = !!gl.getExtension('WEBGL_debug_renderer_info');
  const vendor = gl.getParameter(unmasked ? UNMASKED_VENDOR : gl.VENDOR);
  const name = gl.getParameter(unmasked ? UNMASKED_RENDERER : gl.RENDERER);
  return (
    `${name} (${vendor}) | ${gl.getParameter(gl.VERSION)} | textures up to ${gl.getParameter(gl.MAX_TEXTURE_SIZE)} px | ` +
    `compressed textures ${compressedTextures ? 'yes' : 'NO (decoded instead: more memory)'}`
  );
}

export interface ViewerState {
  map?: string;
  camera: { x: number; y: number; z: number };
  frames: number;
  seconds: number;
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
  programs: number;
  tiles: number;
  buildings: number;
  props: number;
  models: number;
  spawns: number;
  ram?: { used: number; total?: number };
  gpu: number;
}

const MB = 1024 * 1024;
const mb = (bytes: number) => `${Math.round(bytes / MB)} MB`;

/** A line of what the view is showing and what it costs, written to the log every little while. */
export function stateLine(state: ViewerState): string {
  const { camera } = state;
  const ram = state.ram ? `${mb(state.ram.used)}${state.ram.total ? ` of ${mb(state.ram.total)}` : ''}` : 'unknown';
  return (
    `state: ${state.map ?? 'no map'} at ${camera.x.toFixed(1)} ${camera.y.toFixed(1)} ${camera.z.toFixed(1)} | ` +
    `${(state.frames / state.seconds).toFixed(1)} fps, ${state.calls} draw calls, ${state.triangles} triangles | ` +
    `loaded: ${state.tiles} tiles, ${state.buildings} buildings, ${state.props} props, ${state.models} models, ${state.spawns} spawns | ` +
    `GPU: ${state.geometries} geometries, ${state.textures} textures, ${state.programs} shaders, about ${mb(state.gpu)} | memory ${ram}`
  );
}
