import { Service, signal } from '@angular/core';

/** What the 3D view draws and how far; every heavier feature can be switched off or limited in range. */
export interface WorldRenderSettings {
  /** Low-poly terrain coloured with the minimap images instead of the real blended ground textures. */
  lowDetailTerrain: boolean;
  /** Terrain tiles (533 yards each) loaded around the camera in each direction. */
  terrainRadius: number;
  /** Buildings, caves and bridges (WMO). */
  showBuildings: boolean;
  /** Trees, rocks, fences and other props placed by the map (M2 doodads). */
  showDoodads: boolean;
  doodadDistance: number;
  /** Real creature/gameobject models instead of pins (pins are always used beyond the distance). */
  showModels: boolean;
  modelDistance: number;
  /** Zone lighting, fog and sky colours (otherwise a fixed neutral light). */
  zoneLighting: boolean;
}

export const DEFAULT_WORLD_RENDER_SETTINGS: WorldRenderSettings = {
  lowDetailTerrain: false,
  terrainRadius: 1,
  showBuildings: true,
  showDoodads: true,
  doodadDistance: 250,
  showModels: true,
  modelDistance: 150,
  zoneLighting: true,
};

export const WORLD_RENDER_SETTINGS_KEY = 'keira3.worldEditor.render';

/** Render settings of the 3D world editor, saved on this computer. */
@Service()
export class WorldRenderSettingsService {
  private readonly _settings = signal<WorldRenderSettings>(this.load());
  readonly settings = this._settings.asReadonly();

  update(changes: Partial<WorldRenderSettings>): void {
    const next = { ...this._settings(), ...changes };
    this._settings.set(next);
    localStorage.setItem(WORLD_RENDER_SETTINGS_KEY, JSON.stringify(next));
  }

  reset(): void {
    this.update(DEFAULT_WORLD_RENDER_SETTINGS);
  }

  private load(): WorldRenderSettings {
    try {
      const stored = JSON.parse(localStorage.getItem(WORLD_RENDER_SETTINGS_KEY) ?? '{}') as Record<string, unknown>;
      const result: Record<string, unknown> = { ...DEFAULT_WORLD_RENDER_SETTINGS };
      for (const [key, fallback] of Object.entries(DEFAULT_WORLD_RENDER_SETTINGS)) {
        if (typeof stored[key] === typeof fallback) {
          result[key] = stored[key];
        }
      }
      return result as unknown as WorldRenderSettings;
    } catch {
      return { ...DEFAULT_WORLD_RENDER_SETTINGS };
    }
  }
}
