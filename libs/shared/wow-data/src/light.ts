import { DbcFile } from './dbc';
import { WorldPosition } from './coords';

/** A value that changes over the day: keyframes at `times` (half-minutes, 0..2880), wrapping around midnight. */
export interface LightBand {
  times: number[];
  values: number[];
}

/** A zone light from Light.dbc: the map-wide default (no position) or a sphere of influence around a point. */
export interface ZoneLight {
  id: number;
  /** Undefined for the map's default light. */
  position?: WorldPosition;
  /** Full influence within `inner` yards, fading out to none at `outer`. */
  inner: number;
  outer: number;
  /** LightIntBand colours (0xRRGGBB): 0 diffuse, 1 ambient, 2 sky top, 3 sky middle, 6 horizon, 7 fog, 14 ocean, 16 river. */
  colors: LightBand[];
  /** LightFloatBand values: 0 fog end (1/36 yards), 1 fog start (fraction of the end). */
  floats: LightBand[];
}

export type Rgb = [number, number, number];

/** Lighting at one place and time of day. */
export interface LightSample {
  diffuse: Rgb;
  ambient: Rgb;
  skyTop: Rgb;
  skyMiddle: Rgb;
  skyHorizon: Rgb;
  fog: Rgb;
  /** Rivers and lakes, and the sea (near colours). */
  water: Rgb;
  ocean: Rgb;
  /** Yards. */
  fogStart: number;
  fogEnd: number;
}

export const DAY_LENGTH = 2880;
export const NOON = 1440;
const LIGHT_UNITS = 36;
/** Light.dbc stores positions in its own space: x' = 17066.666 − z/36, y' = 17066.666 − x/36, z' = y/36. */
const LIGHT_ORIGIN = 17066.666;
const INT_BANDS = 18;
const FLOAT_BANDS = 6;

/** Reads a band row (0 ID, 1 count, 2..17 times, 18..33 values). */
function readBand(dbc: DbcFile, record: number, float: boolean): LightBand {
  const count = Math.min(16, dbc.getUint(record, 1));
  const times: number[] = [];
  const values: number[] = [];
  for (let i = 0; i < count; i++) {
    times.push(dbc.getUint(record, 2 + i));
    values.push(float ? dbc.getFloat(record, 18 + i) : dbc.getUint(record, 18 + i));
  }
  return { times, values };
}

function bandsById(dbc: DbcFile, float: boolean): Map<number, LightBand> {
  const bands = new Map<number, LightBand>();
  for (let r = 0; r < dbc.recordCount; r++) {
    bands.set(dbc.getUint(r, 0), readBand(dbc, r, float));
  }
  return bands;
}

/**
 * Light.dbc (0 ID, 1 Map, 2..4 position, 5 falloff start, 6 falloff end, 7 clear-weather LightParams) with the
 * LightIntBand/LightFloatBand rows of that LightParams (18 and 6 consecutive ids). Returns the lights of every map.
 */
export function parseZoneLights(lights: DbcFile, intBands: DbcFile, floatBands: DbcFile): Map<number, ZoneLight[]> {
  const colors = bandsById(intBands, false);
  const floats = bandsById(floatBands, true);
  const byMap = new Map<number, ZoneLight[]>();
  for (let r = 0; r < lights.recordCount; r++) {
    const params = lights.getUint(r, 7);
    const [px, py, pz] = [2, 3, 4].map((field) => lights.getFloat(r, field));
    const global = px === 0 && py === 0 && pz === 0;
    const light: ZoneLight = {
      id: lights.getUint(r, 0),
      position: global ? undefined : { x: LIGHT_ORIGIN - pz / LIGHT_UNITS, y: LIGHT_ORIGIN - px / LIGHT_UNITS, z: py / LIGHT_UNITS },
      inner: lights.getFloat(r, 5) / LIGHT_UNITS,
      outer: lights.getFloat(r, 6) / LIGHT_UNITS,
      colors: Array.from({ length: INT_BANDS }, (_, i) => colors.get((params - 1) * INT_BANDS + 1 + i) ?? { times: [], values: [] }),
      floats: Array.from({ length: FLOAT_BANDS }, (_, i) => floats.get((params - 1) * FLOAT_BANDS + 1 + i) ?? { times: [], values: [] }),
    };
    const map = lights.getUint(r, 1);
    byMap.set(map, [...(byMap.get(map) ?? []), light]);
  }
  return byMap;
}

/** The two keyframes around `time` and how far between them it is (wrapping over midnight). */
function keyframes(band: LightBand, time: number): [number, number, number] {
  const count = band.times.length;
  let next = band.times.findIndex((t) => t > time);
  if (next === -1) {
    next = 0;
  }
  const previous = (next - 1 + count) % count;
  const start = band.times[previous];
  const span = (band.times[next] - start + DAY_LENGTH) % DAY_LENGTH;
  const elapsed = (time - start + DAY_LENGTH) % DAY_LENGTH;
  return [previous, next, span === 0 ? 0 : elapsed / span];
}

export function sampleFloat(band: LightBand, time: number, fallback = 0): number {
  if (band.times.length === 0) {
    return fallback;
  }
  const [a, b, t] = keyframes(band, time);
  return band.values[a] + (band.values[b] - band.values[a]) * t;
}

export function sampleColor(band: LightBand, time: number): Rgb {
  if (band.times.length === 0) {
    return [0, 0, 0];
  }
  const [a, b, t] = keyframes(band, time);
  const channel = (value: number, shift: number) => ((value >> shift) & 0xff) / 255;
  return [16, 8, 0].map((shift) => channel(band.values[a], shift) * (1 - t) + channel(band.values[b], shift) * t) as Rgb;
}

function sampleOne(light: ZoneLight, time: number): LightSample {
  const color = (band: number) => sampleColor(light.colors[band], time);
  const fogEnd = sampleFloat(light.floats[0], time, LIGHT_UNITS * 500) / LIGHT_UNITS;
  return {
    diffuse: color(0),
    ambient: color(1),
    skyTop: color(2),
    skyMiddle: color(3),
    skyHorizon: color(6),
    fog: color(7),
    water: color(16),
    ocean: color(14),
    fogStart: fogEnd * sampleFloat(light.floats[1], time, 0.25),
    fogEnd,
  };
}

/** How much a light applies at a position: 1 inside `inner`, fading to 0 at `outer`. */
function influence(light: ZoneLight, position: WorldPosition): number {
  const center = light.position as WorldPosition;
  const distance = Math.hypot(position.x - center.x, position.y - center.y, position.z - center.z);
  if (distance <= light.inner) {
    return 1;
  }
  return distance >= light.outer ? 0 : 1 - (distance - light.inner) / (light.outer - light.inner);
}

/**
 * Blends the zone lights of a map at a position, as the client does: each local light weighs by its falloff, the
 * map's default light fills the rest. Undefined when the map has no light at all.
 */
export function sampleZoneLight(lights: ZoneLight[], position: WorldPosition, time = NOON): LightSample | undefined {
  const weighted: [ZoneLight, number][] = [];
  let total = 0;
  for (const light of lights) {
    if (light.position) {
      const weight = Math.min(influence(light, position), 1 - total);
      if (weight > 0) {
        weighted.push([light, weight]);
        total += weight;
      }
    }
  }
  const global = lights.find((light) => !light.position);
  if (global && total < 1) {
    weighted.push([global, 1 - total]);
    total = 1;
  }
  if (weighted.length === 0) {
    return undefined;
  }
  const samples = weighted.map(([light, weight]) => [sampleOne(light, time), weight / total] as const);
  const mixColor = (key: 'diffuse' | 'ambient' | 'skyTop' | 'skyMiddle' | 'skyHorizon' | 'fog' | 'water' | 'ocean'): Rgb =>
    [0, 1, 2].map((i) => samples.reduce((sum, [sample, weight]) => sum + sample[key][i] * weight, 0)) as Rgb;
  const mixNumber = (key: 'fogStart' | 'fogEnd'): number => samples.reduce((sum, [sample, weight]) => sum + sample[key] * weight, 0);
  return {
    diffuse: mixColor('diffuse'),
    ambient: mixColor('ambient'),
    skyTop: mixColor('skyTop'),
    skyMiddle: mixColor('skyMiddle'),
    skyHorizon: mixColor('skyHorizon'),
    fog: mixColor('fog'),
    water: mixColor('water'),
    ocean: mixColor('ocean'),
    fogStart: mixNumber('fogStart'),
    fogEnd: mixNumber('fogEnd'),
  };
}
