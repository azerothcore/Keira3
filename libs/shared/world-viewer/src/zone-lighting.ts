import { DAY_LENGTH, NOON, Rgb, sampleZoneLight, WorldPosition, ZoneLight } from '@keira/shared/wow-data';
import { WorldScene } from './world-scene';

/**
 * How bright the zone lights are at a time of day (half-minutes), from the brightness of each part of the day (1 = as
 * the game): night at midnight, morning at 6:00, midday at noon, evening at 18:00, blended in between.
 */
export function brightnessAt(time: number, [night, morning, day, evening]: [number, number, number, number]): number {
  const marks = [night, morning, day, evening, night];
  const quarter = DAY_LENGTH / 4;
  const at = (((time % DAY_LENGTH) + DAY_LENGTH) % DAY_LENGTH) / quarter;
  const part = Math.floor(at);
  return marks[part] + (marks[part + 1] - marks[part]) * (at - part);
}

/** What zone lighting needs from `WowClientService`. */
export interface ZoneLightSource {
  getZoneLights(directory: string): Promise<ZoneLight[]>;
}

/** Lights the scene like the zone the camera looks at (Light.dbc at a time of day), or neutrally when turned off. */
export class ZoneLighting {
  private lights: ZoneLight[] = [];
  private enabled = false;
  /** Half-minutes since midnight (0..2880), as Light.dbc counts them. */
  private time = NOON;
  /** The skybox of the zone lights where the camera looks (with zone lighting on). */
  skybox?: string;
  private center?: WorldPosition;
  private generation = 0;

  constructor(
    private readonly source: ZoneLightSource,
    private readonly scene: WorldScene,
    private readonly onChange: () => void,
  ) {}

  async setMap(directory: string | undefined): Promise<void> {
    const generation = ++this.generation;
    this.lights = [];
    this.apply();
    if (!directory) {
      return;
    }
    try {
      const lights = await this.source.getZoneLights(directory);
      if (generation === this.generation) {
        this.lights = lights;
        this.apply();
      }
    } catch (error) {
      console.warn(`[World Editor] Could not load the zone lights of ${directory}: ${(error as Error).message}`);
    }
  }

  /** Brightness of the sun and ambient light (1: as the game). */
  private brightness = 1;

  configure(enabled: boolean, time = NOON, brightness = 1): void {
    if (enabled !== this.enabled || time !== this.time || brightness !== this.brightness) {
      this.enabled = enabled;
      this.time = time;
      this.brightness = brightness;
      this.apply();
    }
  }

  update(center: WorldPosition): void {
    this.center = center;
    this.apply();
  }

  private apply(): void {
    const sample = this.enabled && this.center ? sampleZoneLight(this.lights, this.center, this.time) : undefined;
    if (sample) {
      const scale = (rgb: Rgb): Rgb => rgb.map((value) => value * this.brightness) as Rgb;
      sample.diffuse = scale(sample.diffuse);
      sample.ambient = scale(sample.ambient);
    }
    this.skybox = sample?.skybox;
    this.scene.applyLighting(sample);
    this.onChange();
  }
}
