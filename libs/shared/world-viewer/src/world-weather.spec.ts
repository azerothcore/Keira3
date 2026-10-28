import { BufferAttribute, LineSegments, PerspectiveCamera, Points } from 'three';
import { WeatherEffect } from './world-weather';

describe('WeatherEffect', () => {
  const camera = new PerspectiveCamera();
  const positions = (effect: WeatherEffect) =>
    ((effect.group.children[0] as Points).geometry.getAttribute('position') as BufferAttribute).array as Float32Array;

  it('fills the area around the camera with particles that fall and wrap round it', () => {
    const effect = new WeatherEffect();
    expect(effect.active).toBe(false);
    effect.update(camera, 1);
    effect.set({ kind: 'snow', intensity: 0.5 }, () => 0.5);
    expect(effect.active).toBe(true);
    expect(effect.group.children[0]).toBeInstanceOf(Points);
    expect(positions(effect).length).toBe(2000 * 3);
    camera.position.set(1000, 2000, 50);
    effect.update(camera, 0.1);
    const [x, y, z] = positions(effect);
    // around the camera, wherever it is
    expect(Math.abs(x - 1000)).toBeLessThanOrEqual(30);
    expect(Math.abs(y - 2000)).toBeLessThanOrEqual(30);
    expect(Math.abs(z - 50)).toBeLessThanOrEqual(20);
    effect.update(camera, 100);
    expect(Math.abs(positions(effect)[2] - 50)).toBeLessThanOrEqual(20);
  });

  it('draws rain as streaks, a sandstorm as dust, and nothing without weather or intensity', () => {
    const effect = new WeatherEffect();
    effect.set({ kind: 'rain', intensity: 2 });
    expect(effect.group.children[0]).toBeInstanceOf(LineSegments);
    // (intensity above 1 counts as 1: two points per streak)
    expect(positions(effect).length).toBe(6000 * 6);
    effect.update(camera, 0.016);
    const [, , z1, , , z2] = positions(effect);
    expect(z2 - z1).toBeCloseTo(0.9);
    effect.set({ kind: 'storm', intensity: 0.1 });
    expect(effect.group.children).toHaveLength(1);
    expect(effect.group.children[0]).toBeInstanceOf(Points);
    effect.set({ kind: 'snow', intensity: 0 });
    expect(effect.active).toBe(false);
    effect.set({ kind: 'snow', intensity: 1 });
    effect.set(undefined);
    expect(effect.group.children).toHaveLength(0);
    effect.set({ kind: 'snow', intensity: 1 });
    effect.dispose();
    expect(effect.active).toBe(false);
  });
});
