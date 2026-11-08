import { graphicsDescription, stateLine } from './viewer-log';
import { WorldRenderer } from './world-renderer';

const renderer = (debugInfo: boolean): WorldRenderer => ({
  setPixelRatio: vi.fn(),
  setSize: vi.fn(),
  render: vi.fn(),
  dispose: vi.fn(),
  getContext: () => ({
    RENDERER: 1,
    VENDOR: 2,
    VERSION: 3,
    MAX_TEXTURE_SIZE: 4,
    getExtension: (() => (debugInfo ? {} : null)) as WebGLRenderingContext['getExtension'],
    getParameter: (name: number) =>
      ({ 1: 'WebKit WebGL', 2: 'WebKit', 3: 'WebGL 2.0', 4: 16384, 0x9245: 'NVIDIA Corporation', 0x9246: 'GeForce RTX 3070' })[name],
  }),
});

describe('viewer log', () => {
  it('names the real graphics card when the browser tells it, and what it offers', () => {
    expect(graphicsDescription(renderer(true), true)).toBe(
      'GeForce RTX 3070 (NVIDIA Corporation) | WebGL 2.0 | textures up to 16384 px | compressed textures yes',
    );
    expect(graphicsDescription(renderer(false), false)).toBe(
      'WebKit WebGL (WebKit) | WebGL 2.0 | textures up to 16384 px | compressed textures NO (decoded instead: more memory)',
    );
    expect(graphicsDescription({ ...renderer(true), getContext: undefined }, true)).toBe('unknown');
  });

  it('sums up what the view shows and what it costs', () => {
    const state = {
      map: 'Azeroth',
      camera: { x: -8913.25, y: -137.5, z: 82 },
      frames: 300,
      seconds: 10,
      calls: 900,
      triangles: 1_200_000,
      geometries: 400,
      textures: 300,
      programs: 12,
      tiles: 9,
      buildings: 20,
      props: 1500,
      models: 80,
      spawns: 200,
      ram: { used: 2 * 1024 ** 3, total: 16 * 1024 ** 3 },
      gpu: 512 * 1024 ** 2,
    };
    expect(stateLine(state)).toBe(
      'state: Azeroth at -8913.3 -137.5 82.0 | 300 frames drawn in 10 s (only when something changes), 900 draw calls, 1200000 triangles | ' +
        'loaded: 9 tiles, 20 buildings, 1500 props, 80 models, 200 spawns | ' +
        'GPU: 400 geometries, 300 textures, 12 shaders, about 512 MB | memory 2048 MB of 16384 MB',
    );
    expect(stateLine({ ...state, map: undefined, ram: { used: 1024 ** 2 } })).toContain('state: no map at');
    expect(stateLine({ ...state, ram: { used: 1024 ** 2 } })).toContain('memory 1 MB');
    expect(stateLine({ ...state, ram: undefined })).toContain('memory unknown');
  });
});
