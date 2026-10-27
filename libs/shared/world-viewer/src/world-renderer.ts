import { InjectionToken } from '@angular/core';
import { Camera, Scene, WebGLRenderer } from 'three';

/** The part of `WebGLRenderer` the viewer uses; replaced by a fake in unit tests (jsdom has no WebGL). */
export interface WorldRenderer {
  setPixelRatio(ratio: number): void;
  setSize(width: number, height: number, updateStyle?: boolean): void;
  render(scene: Scene, camera: Camera): void;
  dispose(): void;
  /** The WebGL extensions available (to use compressed textures). */
  extensions?: { has(name: string): boolean };
}

export type WorldRendererFactory = (canvas: HTMLCanvasElement) => WorldRenderer;

export const WORLD_RENDERER_FACTORY = new InjectionToken<WorldRendererFactory>('WORLD_RENDERER_FACTORY', {
  providedIn: 'root',
  factory: () => (canvas) => new WebGLRenderer({ canvas, antialias: true }),
});
