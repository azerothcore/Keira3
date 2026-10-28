import { Service, signal } from '@angular/core';

/** What the 3D view draws and how far; every heavier feature can be switched off or limited in range. */
export interface WorldRenderSettings {
  /** Low-poly terrain coloured with the minimap images instead of the real blended ground textures. */
  lowDetailTerrain: boolean;
  /** Terrain tiles (533 yards each) loaded around the camera in each direction. */
  terrainRadius: number;
  /** Load every tile of the selected zone, not only the ones around the camera. */
  loadWholeZone: boolean;
  /** Buildings, caves and bridges (WMO). */
  showBuildings: boolean;
  /** Building roofs (hide them to look and click inside). */
  showRoofs: boolean;
  /** Trees, rocks, fences and other props placed by the map (M2 doodads). */
  showDoodads: boolean;
  /** Real creature/gameobject models instead of pins (pins are always used beyond the draw distance). */
  showModels: boolean;
  /** An arrow through the middle of NPC and object models, pointing where they face. */
  showFacingArrows: boolean;
  /** A circle around wandering creatures showing how far they roam. */
  showWanderRadius: boolean;
  /** Circles around creatures: their bounding radius and combat reach (creature_model_info). */
  showBounds: boolean;
  /** What the server collides with (buildings' and models' collision, what vmaps are made of), as a red wireframe. */
  showCollision: boolean;
  /** The server's navigation mesh (mmaps from the server data folder): where creatures can walk. */
  showNavMesh: boolean;
  /** Zone lighting, fog and sky colours (otherwise a fixed neutral light). */
  zoneLighting: boolean;
  /** How far from the camera target (yards) doodads and models are drawn. */
  drawDistance: number;
  /** Use the per-group distances below instead of `drawDistance` (0 = don't draw that group). */
  advancedDistances: boolean;
  /** Trees, big rocks and other large props. */
  largeDoodadDistance: number;
  /** Bushes, grass tufts, barrels and other small props. */
  smallDoodadDistance: number;
  creatureDistance: number;
  gameobjectDistance: number;
  /**
   * Share of the screen's resolution drawn (1 = full, 0.5 = half): lower is much faster on big or high-DPI screens,
   * a bit blurrier.
   */
  renderScale: number;
  /** Rings of tiles read ahead beyond those drawn, so moving on finds them ready (0 = off). */
  loadAhead: number;
  /** The marker (Space) as a player character, `race:sex` (e.g. `1:0` human male); '' = the beam only. */
  markerModel: string;
  /** The selected spawn's pin drawn over its model (otherwise an outline around the model, which keeps its size visible). */
  solidSelection: boolean;
  /** Frames per second, draw calls, graphics memory and what's loading, in a corner of the view. */
  showStats: boolean;
  /** Writes world-editor-perf.log (in the cache folder): what held up the window, and for how long. */
  perfLog: boolean;
}

export const RENDER_SCALES = [1, 0.75, 0.5];

/** Draw distance of each group, in yards (0 = not drawn). */
export interface DrawDistances {
  largeDoodads: number;
  smallDoodads: number;
  creatures: number;
  gameobjects: number;
}

export function drawDistances(settings: WorldRenderSettings): DrawDistances {
  if (!settings.advancedDistances) {
    const all = settings.drawDistance;
    return { largeDoodads: all, smallDoodads: all, creatures: all, gameobjects: all };
  }
  return {
    largeDoodads: settings.largeDoodadDistance,
    smallDoodads: settings.smallDoodadDistance,
    creatures: settings.creatureDistance,
    gameobjects: settings.gameobjectDistance,
  };
}

export const DEFAULT_WORLD_RENDER_SETTINGS: WorldRenderSettings = {
  lowDetailTerrain: false,
  terrainRadius: 1,
  loadWholeZone: false,
  showBuildings: true,
  showRoofs: true,
  showDoodads: true,
  showModels: true,
  showFacingArrows: true,
  showWanderRadius: false,
  showBounds: false,
  showCollision: false,
  showNavMesh: false,
  zoneLighting: false,
  drawDistance: 250,
  advancedDistances: false,
  largeDoodadDistance: 500,
  smallDoodadDistance: 150,
  creatureDistance: 250,
  gameobjectDistance: 250,
  renderScale: 1,
  loadAhead: 1,
  markerModel: '',
  solidSelection: false,
  showStats: false,
  perfLog: false,
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
