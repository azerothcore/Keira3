import { TestBed } from '@angular/core/testing';
import { WORLD_RENDERER_FACTORY } from './world-renderer';

const webgl = vi.hoisted(() => ({ options: undefined as unknown }));

vi.mock('three', async (importOriginal) => ({
  ...(await importOriginal<typeof import('three')>()),
  WebGLRenderer: class {
    constructor(options: unknown) {
      webgl.options = options;
    }
  },
}));

describe('WORLD_RENDERER_FACTORY', () => {
  it('creates an antialiased WebGL renderer on the given canvas', () => {
    const canvas = document.createElement('canvas');
    const renderer = TestBed.inject(WORLD_RENDERER_FACTORY)(canvas);
    expect(renderer).toBeTruthy();
    expect(webgl.options).toEqual({ canvas, antialias: true });
  });
});
