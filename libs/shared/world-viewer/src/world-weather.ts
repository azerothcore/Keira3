import { BufferAttribute, BufferGeometry, Camera, Color, LineBasicMaterial, LineSegments, Object3D, Points, PointsMaterial } from 'three';

/** Weather drawn around the camera: rain, snow, or a sandstorm (the server's WEATHER_TYPE_STORM). */
export type WeatherKind = 'rain' | 'snow' | 'storm';

export interface WorldWeather {
  kind: WeatherKind;
  /** 0..1 (the server's weather grade). */
  intensity: number;
}

/** Yards around the camera filled with weather, sideways and up and down. */
const AREA = 60;
const HEIGHT = 40;
/** Particles at full intensity. */
const MAX_PARTICLES: Record<WeatherKind, number> = { rain: 6000, snow: 4000, storm: 5000 };
/** Fall (z) and drift (x, y) in yards per second. */
const MOTION: Record<WeatherKind, { fall: number; drift: number; wobble: number }> = {
  rain: { fall: 28, drift: 1, wobble: 0 },
  snow: { fall: 2.5, drift: 0.6, wobble: 1.2 },
  storm: { fall: 1, drift: 16, wobble: 3 },
};
const COLORS: Record<WeatherKind, number> = { rain: 0xaab8c8, snow: 0xffffff, storm: 0xc8a878 };
/** Length of a rain streak (yards). */
const STREAK = 0.9;

/** A field of particles that falls around the camera and wraps round it, so it never runs out. */
export class WeatherEffect {
  readonly group = new Object3D();
  private kind?: WeatherKind;
  private object?: Points | LineSegments;
  /** Particle positions relative to the area's corner (0..AREA, 0..AREA, 0..HEIGHT), and a phase each. */
  private offsets = new Float32Array(0);
  private phases = new Float32Array(0);
  private time = 0;

  constructor() {
    this.group.name = 'weather';
    this.group.renderOrder = 10;
  }

  get active(): boolean {
    return !!this.object;
  }

  /** Shows the weather (or none); a new kind or intensity scatters the particles again. */
  set(weather: WorldWeather | undefined, random: () => number = Math.random): void {
    this.clear();
    const count = weather ? Math.round(MAX_PARTICLES[weather.kind] * Math.min(1, Math.max(0, weather.intensity))) : 0;
    if (!weather || count === 0) {
      return;
    }
    this.kind = weather.kind;
    this.offsets = new Float32Array(count * 3);
    this.phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      this.offsets.set([random() * AREA, random() * AREA, random() * HEIGHT], i * 3);
      this.phases[i] = random() * Math.PI * 2;
    }
    const geometry = new BufferGeometry();
    const rain = weather.kind === 'rain';
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3 * (rain ? 2 : 1)), 3));
    const color = new Color(COLORS[weather.kind]);
    this.object = rain
      ? new LineSegments(geometry, new LineBasicMaterial({ color, transparent: true, opacity: 0.55, depthWrite: false }))
      : new Points(
          geometry,
          new PointsMaterial({ color, size: weather.kind === 'snow' ? 0.18 : 0.12, transparent: true, opacity: 0.8, depthWrite: false }),
        );
    // (always around the camera: never culled)
    this.object.frustumCulled = false;
    this.group.add(this.object);
  }

  /** Moves the particles on by `seconds` and wraps them round the camera. */
  update(camera: Camera, seconds: number): void {
    const object = this.object;
    if (!object) {
      return;
    }
    this.time += seconds;
    const motion = MOTION[this.kind as WeatherKind];
    const rain = this.kind === 'rain';
    const positions = object.geometry.getAttribute('position') as BufferAttribute;
    const array = positions.array as Float32Array;
    const { x: cx, y: cy, z: cz } = camera.position;
    // the area's corner, so the camera stays in its middle
    const [ox, oy, oz] = [cx - AREA / 2, cy - AREA / 2, cz - HEIGHT / 2];
    const wrap = (value: number, size: number) => ((value % size) + size) % size;
    const count = this.phases.length;
    for (let i = 0; i < count; i++) {
      const wobble = Math.sin(this.time * 1.7 + this.phases[i]) * motion.wobble * seconds;
      const o = i * 3;
      this.offsets[o] += motion.drift * seconds + wobble;
      this.offsets[o + 1] += motion.drift * 0.4 * seconds;
      this.offsets[o + 2] -= motion.fall * seconds;
      // (world positions wrapped around the camera: particles stay put in the world as the camera moves)
      const x = ox + wrap(this.offsets[o] - ox, AREA);
      const y = oy + wrap(this.offsets[o + 1] - oy, AREA);
      const z = oz + wrap(this.offsets[o + 2] - oz, HEIGHT);
      if (rain) {
        array.set([x, y, z, x - 0.03, y - 0.01, z + STREAK], i * 6);
      } else {
        array.set([x, y, z], o);
      }
    }
    positions.needsUpdate = true;
  }

  dispose(): void {
    this.clear();
  }

  private clear(): void {
    if (this.object) {
      this.group.remove(this.object);
      this.object.geometry.dispose();
      (this.object.material as LineBasicMaterial | PointsMaterial).dispose();
      this.object = undefined;
      this.kind = undefined;
    }
  }
}
