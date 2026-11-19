import { tileCenter, ZoneLight } from '@keira/shared/wow-data';
import { Fog } from 'three';
import { WorldScene } from './world-scene';
import { brightnessAt, ZoneLighting, ZoneLightSource } from './zone-lighting';

const CENTER = tileCenter({ tx: 32, ty: 48 });
const constant = (value: number) => ({ times: [0], values: [value] });
const LIGHT: ZoneLight = {
  id: 1,
  inner: 0,
  outer: 0,
  colors: Array.from({ length: 18 }, () => constant(0x808080)),
  floats: [constant(36 * 700), constant(0.5), constant(0), constant(0), constant(0), constant(0)],
};

describe('ZoneLighting', () => {
  const setup = () => {
    const source = { getZoneLights: vi.fn().mockResolvedValue([LIGHT]) } satisfies ZoneLightSource;
    const world = new WorldScene();
    const onChange = vi.fn();
    const lighting = new ZoneLighting(source, world, onChange);
    lighting.configure(true);
    return { source, world, onChange, lighting };
  };
  const fogEnd = (world: WorldScene) => (world.scene.fog as Fog).far;

  it("lights the scene with the map's zone lights around the camera target", async () => {
    const { source, world, lighting, onChange } = setup();
    const neutral = fogEnd(world);
    await lighting.setMap('Azeroth');
    expect(source.getZoneLights).toHaveBeenCalledWith('Azeroth');
    expect(fogEnd(world)).toBe(neutral);

    lighting.update(CENTER);
    expect(fogEnd(world)).toBeCloseTo(700);
    expect(onChange).toHaveBeenCalled();

    lighting.configure(false);
    expect(fogEnd(world)).toBe(neutral);
    lighting.configure(false);
    lighting.configure(true);
    expect(fogEnd(world)).toBeCloseTo(700);

    // another time of day: the same light here (constant bands), but sampled again
    onChange.mockClear();
    lighting.configure(true, 0);
    expect(onChange).toHaveBeenCalled();
    lighting.configure(true, 0);
    // fog turned off: none, the zone's or the neutral one, until turned back on
    world.setFog(false);
    expect(fogEnd(world)).toBeGreaterThan(1e7);
    world.setFog(false);
    lighting.update(CENTER);
    expect(fogEnd(world)).toBeGreaterThan(1e7);
    world.setFog(true);
    expect(fogEnd(world)).toBeCloseTo(700);
    // the edge fog closes in to where the drawn world ends, the fog on or off
    world.setEdgeFog(500);
    world.setEdgeFog(500);
    expect(fogEnd(world)).toBe(500);
    world.setFog(false);
    expect(fogEnd(world)).toBe(500);
    world.setFog(true);
    world.setEdgeFog(undefined);
    expect(fogEnd(world)).toBeCloseTo(700);

    await lighting.setMap(undefined);
    expect(fogEnd(world)).toBe(neutral);
  });

  it('makes the sun and ambient light brighter or darker', async () => {
    const { world, lighting } = setup();
    await lighting.setMap('Azeroth');
    lighting.update(CENTER);
    const sun = () => world['sun'].color.r;
    const normal = sun();
    lighting.configure(true, undefined, 0.5);
    expect(sun()).toBeLessThan(normal);
    lighting.configure(true, undefined, 0.5);
    lighting.configure(true, undefined, 1);
    expect(sun()).toBeCloseTo(normal);
  });

  it('blends the brightness of the parts of the day', () => {
    const parts: [number, number, number, number] = [0.5, 1, 2, 1.5];
    expect(brightnessAt(0, parts)).toBe(0.5);
    expect(brightnessAt(720, parts)).toBe(1);
    expect(brightnessAt(1440, parts)).toBe(2);
    expect(brightnessAt(2160, parts)).toBe(1.5);
    expect(brightnessAt(1080, parts)).toBe(1.5);
    // late evening back towards the night, and a day later
    expect(brightnessAt(2520, parts)).toBe(1);
    expect(brightnessAt(2880 + 1440, parts)).toBe(2);
  });

  it('ignores lights of a map left while loading, and reports failures', async () => {
    const { source, world, lighting } = setup();
    lighting.update(CENTER);
    const neutral = fogEnd(world);
    const first = lighting.setMap('Azeroth');
    await lighting.setMap(undefined);
    await first;
    expect(fogEnd(world)).toBe(neutral);

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    source.getZoneLights.mockRejectedValueOnce(new Error('bad dbc'));
    await lighting.setMap('Azeroth');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('bad dbc'));
  });
});
