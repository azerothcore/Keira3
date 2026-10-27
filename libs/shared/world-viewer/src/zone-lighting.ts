import { sampleZoneLight, WorldPosition, ZoneLight } from '@keira/shared/wow-data';
import { WorldScene } from './world-scene';

/** What zone lighting needs from `WowClientService`. */
export interface ZoneLightSource {
  getZoneLights(directory: string): Promise<ZoneLight[]>;
}

/** Lights the scene like the zone the camera looks at (Light.dbc at noon), or neutrally when turned off. */
export class ZoneLighting {
  private lights: ZoneLight[] = [];
  private enabled = false;
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

  configure(enabled: boolean): void {
    if (enabled !== this.enabled) {
      this.enabled = enabled;
      this.apply();
    }
  }

  update(center: WorldPosition): void {
    this.center = center;
    this.apply();
  }

  private apply(): void {
    this.scene.applyLighting(this.enabled && this.center ? sampleZoneLight(this.lights, this.center) : undefined);
    this.onChange();
  }
}
