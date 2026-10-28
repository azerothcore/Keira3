import { DbcFile } from './dbc';
import { buildDbc } from './dbc.mock';
import { NOON, parseZoneLights, sampleColor, sampleFloat, sampleZoneLight, ZoneLight } from './light';

const float = (value: number): number => {
  const view = new DataView(new ArrayBuffer(4));
  view.setFloat32(0, value, true);
  return view.getUint32(0, true);
};
/** A band row: id, count, 16 times, 16 values. */
const bandRow = (id: number, times: number[], values: number[]): number[] => {
  const row = new Array(34).fill(0);
  row[0] = id;
  row[1] = times.length;
  times.forEach((t, i) => (row[2 + i] = t));
  values.forEach((v, i) => (row[18 + i] = v));
  return row;
};
const constant = (value: number) => ({ times: [0], values: [value] });

describe('light', () => {
  it('samples bands over the day, wrapping around midnight', () => {
    const band = { times: [720, 2160], values: [0, 100] };
    expect(sampleFloat(band, 1440)).toBe(50);
    // from 2160 back to 720 next morning: 1440 half-minutes, 0 is halfway
    expect(sampleFloat(band, 0)).toBe(50);
    expect(sampleFloat(band, 2160)).toBe(100);
    expect(sampleFloat(constant(7), 999)).toBe(7);
    expect(sampleFloat({ times: [], values: [] }, 0, 3)).toBe(3);
    expect(sampleFloat({ times: [], values: [] }, 0)).toBe(0);

    expect(sampleColor({ times: [0, 1440], values: [0x000000, 0xff0000] }, 720).map((v) => Math.round(v * 255))).toEqual([128, 0, 0]);
    expect(sampleColor({ times: [], values: [] }, 0)).toEqual([0, 0, 0]);
  });

  it('reads the lights of each map with their clear-weather bands, in world coordinates', () => {
    const lights = new DbcFile(
      buildDbc([
        [1, 0, 0, 0, 0, 0, 0, 2],
        [2, 0, float(36 * 17066.666), float(36 * 10), float(36 * 17066.666 + 36 * 9000), float(36 * 100), float(36 * 200), 3],
        [3, 1, 0, 0, 0, 0, 0, 1],
      ]),
    );
    const ints = new DbcFile(buildDbc([bandRow(19, [0], [0x123456]), bandRow(37, [0], [0xffffff])]));
    const floats = new DbcFile(buildDbc([bandRow(7, [0], [float(36 * 400)])]));
    const parsed = parseZoneLights(lights, ints, floats);

    const [global, local] = parsed.get(0) as ZoneLight[];
    expect(global.position).toBeUndefined();
    expect(global.colors[0]).toEqual({ times: [0], values: [0x123456] });
    expect(global.floats[0].values[0]).toBeCloseTo(36 * 400);
    expect(global.colors[1]).toEqual({ times: [], values: [] });
    expect(local.position?.x).toBeCloseTo(-9000, 1);
    expect(local.position?.y).toBeCloseTo(0, 1);
    expect(local.position?.z).toBeCloseTo(10);
    expect(local.inner).toBeCloseTo(100);
    expect(local.outer).toBeCloseTo(200);
    expect(local.colors[0].values).toEqual([0xffffff]);
    expect(parsed.get(1)).toHaveLength(1);
    expect(global.skybox).toBeUndefined();

    // with the skyboxes of their LightParams
    const params = new DbcFile(
      buildDbc([
        [2, 0, 9, 0],
        [3, 0, 8, 0],
      ]),
    );
    const skyboxes = new DbcFile(buildDbc([[9, 'Environments\\Stars\\Stars.mdx', 0]]));
    const withSky = parseZoneLights(lights, ints, floats, params, skyboxes).get(0) as ZoneLight[];
    expect(withSky.map((l) => l.skybox)).toEqual(['Environments\\Stars\\Stars.m2', undefined]);
  });

  describe('sampleZoneLight', () => {
    const light = (color: number, position?: { x: number; y: number; z: number }, fogEnd = 36 * 300): ZoneLight => ({
      id: color,
      position,
      inner: 100,
      outer: 200,
      colors: Array.from({ length: 18 }, () => constant(color)),
      floats: [constant(fogEnd), constant(0.5), constant(0), constant(0), constant(0), constant(0)],
    });
    const red = light(0xff0000);
    const blue = light(0x0000ff, { x: 0, y: 0, z: 0 }, 36 * 100);

    it('takes the skybox of the light weighing most that has one', () => {
      const starry = { ...red, skybox: 'Stars.m2' };
      const aurora = { ...blue, skybox: 'Aurora.m2' };
      expect(sampleZoneLight([starry, aurora], { x: 1000, y: 0, z: 0 })?.skybox).toBe('Stars.m2');
      expect(sampleZoneLight([starry, aurora], { x: 0, y: 0, z: 0 })?.skybox).toBe('Aurora.m2');
      expect(sampleZoneLight([starry, blue], { x: 150, y: 0, z: 0 })?.skybox).toBe('Stars.m2');
      // both in play: the heavier
      expect(sampleZoneLight([starry, aurora], { x: 120, y: 0, z: 0 })?.skybox).toBe('Aurora.m2');
      expect(sampleZoneLight([starry, aurora], { x: 180, y: 0, z: 0 })?.skybox).toBe('Stars.m2');
      expect(sampleZoneLight([red, blue], { x: 0, y: 0, z: 0 })).not.toHaveProperty('skybox');
    });

    it('uses the map light away from local lights, and the local light inside it', () => {
      expect(sampleZoneLight([red, blue], { x: 1000, y: 0, z: 0 })).toEqual({
        diffuse: [1, 0, 0],
        ambient: [1, 0, 0],
        skyTop: [1, 0, 0],
        skyMiddle: [1, 0, 0],
        skyHorizon: [1, 0, 0],
        fog: [1, 0, 0],
        water: [1, 0, 0],
        ocean: [1, 0, 0],
        fogStart: 150,
        fogEnd: 300,
      });
      expect(sampleZoneLight([red, blue], { x: 50, y: 0, z: 0 }, NOON)?.diffuse).toEqual([0, 0, 1]);
    });

    it('blends across the falloff', () => {
      const sample = sampleZoneLight([red, blue], { x: 150, y: 0, z: 0 });
      expect(sample?.diffuse).toEqual([0.5, 0, 0.5]);
      expect(sample?.fogEnd).toBe(200);
    });

    it('lets the first local lights take precedence, and works without a map light', () => {
      const green = light(0x00ff00, { x: 0, y: 0, z: 0 });
      expect(sampleZoneLight([blue, green], { x: 0, y: 0, z: 0 })?.diffuse).toEqual([0, 0, 1]);
      expect(sampleZoneLight([blue], { x: 150, y: 0, z: 0 })?.diffuse).toEqual([0, 0, 1]);
      expect(sampleZoneLight([blue], { x: 500, y: 0, z: 0 })).toBeUndefined();
      expect(sampleZoneLight([], { x: 0, y: 0, z: 0 })).toBeUndefined();
    });
  });
});
