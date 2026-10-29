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
  /** Circles around creatures: how far they notice a player of their level (orange), and call for help (blue). */
  showAggroRadius: boolean;
  showAssistRadius: boolean;
  /** What the server collides with (buildings' and models' collision, what vmaps are made of), as a red wireframe. */
  showCollision: boolean;
  /** The server's navigation mesh (mmaps from the server data folder): where creatures can walk. */
  showNavMesh: boolean;
  /** Zone lighting, fog and sky colours (otherwise a fixed neutral light). */
  zoneLighting: boolean;
  /** Also every other path in the area: without a walker loaded, SmartAI ones and escort scripts' (drawn, not edited). */
  showAllPaths: boolean;
  /** A compass in the corner of the view (K): the dial turns with the camera, or stays north up with a needle. */
  compass: boolean;
  compassNorthUp: boolean;
  /** A north arrow on the dial; the compass points (N, NE, E…) every 45° instead of numbers. */
  compassNorthArrow: boolean;
  compassPoints: boolean;
  /** The bearing under it, in degrees and/or mils (6400 a turn); both follow the camera live. */
  compassDegrees: boolean;
  compassMils: boolean;
  /** How solid the compass is (%): 10..100. */
  compassOpacity: number;
  /** The time of day lit with zone lighting (minutes since midnight), or the computer's clock. */
  timeOfDay: number;
  /** Brightness of the zone lights (%) at night, in the morning, at midday and in the evening, blended in between. */
  /** Weather around the camera: none, rolled from game_weather for the zone, or always the one chosen. */
  weather: 'off' | 'database' | 'rain' | 'snow' | 'storm';
  /** Intensity (%) of the weather chosen. */
  weatherIntensity: number;
  brightnessNight: number;
  brightnessMorning: number;
  brightnessDay: number;
  brightnessEvening: number;
  timeFollowsClock: boolean;
  /** The skybox (stars, clouds, auroras): the zone's with zone lighting, or the one chosen (its .m2 path); turning slowly. */
  skybox: boolean;
  skyboxModel: string;
  skyboxSpin: boolean;
  /** The marker (Space) stands on the surface of liquids instead of the ground under them (Shift + Space: the other). */
  markerOnLiquid: boolean;
  /**
   * Limits (MB, 0 = none) on the memory Keira's window takes and on what the view puts on the graphics card: over one,
   * what isn't in use is let go and nothing is loaded ahead until back under.
   */
  memoryCapMb: number;
  gpuCapMb: number;
  /**
   * The indoor parts of buildings in the world (the client draws them only from inside or through a doorway: from
   * outside some show as flat squares). Dungeons made of one building always show them.
   */
  showIndoor: boolean;
  /** The parts of models the game never draws (invisible walls, smoke emitters' boxes), shown see-through. */
  showInvisible: boolean;
  /** A see-through red wall where the map's terrain ends. */
  showMapEdge: boolean;
  /** The liquid where the camera looks (water, ocean, magma, slime) and whether it's deep (fatigue), by its position. */
  showLiquidInfo: boolean;
  /** A line at the bottom of the view naming the building, doodad or terrain tile under the cursor. */
  showMouseOver: boolean;
  /** Over the terrain: the tile (ADT) and chunk grid, the ground too steep to walk up (red), its triangles. */
  showTileGrid: boolean;
  showSteepSlopes: boolean;
  /** Height lines every 5 yards (bolder every 25), like a topographic map. */
  showContours: boolean;
  showWireframe: boolean;
  /** A see-through plane at height 0, the oceans' level. */
  showSeaLevel: boolean;
  /** Waypoint paths: a dashed line from each walker's spawn point to the first point, and from the last point back to the first. */
  showPathToFirst: boolean;
  showPathFromLast: boolean;
  /** Creatures wear their equipment (helmet, shoulders, weapons, clothes' shapes). */
  showEquipment: boolean;
  /** Creatures play their standing animation; those that move, their walking one. */
  animateIdle: boolean;
  animateWalk: boolean;
  /** Within doodads and models: trees and the other doodads (props), NPCs and gameobjects, each on or off. */
  showTrees: boolean;
  showProps: boolean;
  showCreatureModels: boolean;
  showGameobjectModels: boolean;
  /** Fog in the distance (the zone's with zone lighting): off to see far. */
  fog: boolean;
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
  showAggroRadius: false,
  showAssistRadius: false,
  showCollision: false,
  showNavMesh: false,
  zoneLighting: false,
  fog: true,
  showTrees: true,
  showProps: true,
  showCreatureModels: true,
  showGameobjectModels: true,
  showIndoor: true,
  showInvisible: false,
  showMapEdge: true,
  showLiquidInfo: true,
  showMouseOver: true,
  showTileGrid: false,
  showSteepSlopes: false,
  showContours: false,
  showWireframe: false,
  showSeaLevel: false,
  showPathToFirst: true,
  showPathFromLast: true,
  showEquipment: true,
  animateIdle: false,
  animateWalk: false,
  memoryCapMb: 0,
  gpuCapMb: 0,
  markerOnLiquid: false,
  skybox: true,
  skyboxModel: '',
  skyboxSpin: false,
  timeOfDay: 720,
  weather: 'off',
  weatherIntensity: 60,
  brightnessNight: 100,
  brightnessMorning: 100,
  brightnessDay: 100,
  brightnessEvening: 100,
  timeFollowsClock: false,
  showAllPaths: false,
  compass: true,
  compassNorthUp: false,
  compassNorthArrow: true,
  compassPoints: true,
  compassDegrees: true,
  compassMils: false,
  compassOpacity: 100,
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
