import {
  ModelPlacement,
  TileCoord,
  tileKey,
  tilesAround,
  tilesInBounds,
  WmoModel,
  WorldBounds,
  WorldPosition,
  worldToTile,
  perfTime,
} from '@keira/shared/wow-data';
import { Group, Object3D } from 'three';
import { TextureCache } from './texture-cache';
import { applyPlacement, buildWmoObject, disposeWmoObject, setWmoIndoorVisible } from './wmo-object';

/** What the object streamer needs from `WowClientService`. */
export interface ObjectSource {
  getTilePlacements(directory: string, tile: TileCoord): Promise<{ wmos: ModelPlacement[]; doodads: ModelPlacement[] } | undefined>;
  getWmo(path: string): Promise<WmoModel | undefined>;
}

export interface WorldObjectsOptions {
  showBuildings: boolean;
  radius: number;
}

/** A building placed by key (not by a map tile), at a server position, facing `orientation`. */
export interface ExtraBuilding {
  key: string;
  path: string;
  position: WorldPosition;
  orientation: number;
}

interface Placed {
  object: Object3D;
  tiles: Set<string>;
}

/**
 * Streams the buildings (WMO) placed by the ADT tiles around the camera into `group`. A building listed by several
 * tiles is placed once and kept while any of them is loaded; each WMO file is loaded once and cloned per placement.
 */
export class WorldObjects {
  /** Which way the camera looks (server x/y): tiles in front load first. */
  facing?: { x: number; y: number };
  private directory?: string;
  private generation = 0;
  private centerTile: TileCoord = { tx: 32, ty: 32 };
  private options: WorldObjectsOptions = { showBuildings: true, radius: 1 };
  private readonly tiles = new Map<string, number[]>();
  private readonly loading = new Set<string>();
  private readonly placed = new Map<number, Placed>();
  private readonly templates = new Map<string, Promise<Group | undefined>>();
  /** An area whose buildings are all loaded (e.g. the selected zone). */
  private region?: WorldBounds;
  private regionKeys = new Set<string>();
  private readonly extras = new Map<string, Object3D>();
  private extrasGeneration = 0;
  private indoorVisible = true;

  constructor(
    private readonly source: ObjectSource,
    private readonly group: Group,
    private readonly textures: TextureCache,
    private readonly onChange: () => void,
  ) {}

  get placedCount(): number {
    return this.placed.size;
  }

  /** Tiles whose buildings are still being loaded. */
  get pendingCount(): number {
    return this.loading.size;
  }

  get loadedTiles(): string[] {
    return [...this.tiles.keys()];
  }

  setMap(directory: string | undefined): void {
    this.directory = directory;
    this.clear();
  }

  configure(options: WorldObjectsOptions): void {
    if (options.showBuildings === this.options.showBuildings && options.radius === this.options.radius) {
      return;
    }
    this.options = { ...options };
    this.clear();
  }

  /** Shows or hides the indoor parts of the buildings (see `setWmoIndoorVisible`), loaded and to come. */
  setIndoorVisible(visible: boolean): void {
    if (visible !== this.indoorVisible) {
      this.indoorVisible = visible;
      this.templates.forEach((template) => void template.then((t) => t && setWmoIndoorVisible(t, visible)));
      this.onChange();
    }
  }

  /** Also keeps the buildings of every tile of `bounds` (until set to undefined); takes effect at the next update(). */
  setRegion(bounds: WorldBounds | undefined): void {
    this.region = bounds;
  }

  async update(center: WorldPosition): Promise<void> {
    const directory = this.directory;
    if (!directory || !this.options.showBuildings) {
      return;
    }
    const generation = this.generation;
    this.centerTile = worldToTile(center.x, center.y);
    const regionTiles = this.region ? tilesInBounds(this.region, this.centerTile) : [];
    this.regionKeys = new Set(regionTiles.map(tileKey));

    for (const key of [...this.tiles.keys()]) {
      if (!this.isNear(key)) {
        this.removeTile(key);
      }
    }
    for (const tile of [...tilesAround(this.centerTile, this.options.radius, this.facing), ...regionTiles]) {
      const key = tileKey(tile);
      if (this.tiles.has(key) || this.loading.has(key)) {
        continue;
      }
      this.loading.add(key);
      try {
        await this.loadTile(directory, tile, key, generation);
      } catch (error) {
        console.warn(`[World Editor] Could not load the buildings of ${directory}_${key}: ${(error as Error).message}`);
      } finally {
        this.loading.delete(key);
      }
    }
  }

  /**
   * Buildings placed from the database rather than by the map's tiles (a transport's ship at the middle of its own
   * map): replaces the previous ones. They're ground like the others (snapping, line of sight).
   */
  async setExtras(extras: ExtraBuilding[]): Promise<void> {
    const generation = ++this.extrasGeneration;
    this.extras.forEach((object) => this.group.remove(object));
    this.extras.clear();
    for (const extra of extras) {
      const template = await this.getTemplate(extra.path).catch(() => undefined);
      if (generation !== this.extrasGeneration) {
        return;
      }
      if (template) {
        const object = template.clone();
        object.name = extra.key;
        const { x, y, z } = extra.position;
        const half = extra.orientation / 2;
        applyPlacement(object, {
          uniqueId: 0,
          path: extra.path,
          position: [x, y, z],
          rotation: [0, 0, Math.sin(half), Math.cos(half)],
          scale: 1,
        });
        this.group.add(object);
        this.extras.set(extra.key, object);
      }
    }
    this.onChange();
  }

  /** Loads a building ahead of time (kept for when a tile places it). */
  prefetch(path: string): Promise<unknown> {
    return this.getTemplate(path).catch(() => undefined);
  }

  dispose(): void {
    this.directory = undefined;
    this.clear();
    void this.setExtras([]);
    this.templates.forEach((template) => void template.then((t) => t && disposeWmoObject(t)));
    this.templates.clear();
  }

  private async loadTile(directory: string, tile: TileCoord, key: string, generation: number): Promise<void> {
    const placements = (await this.source.getTilePlacements(directory, tile))?.wmos ?? [];
    // another map (or other options) meanwhile: this tile isn't one of its tiles
    if (generation !== this.generation) {
      return;
    }
    const ids: number[] = [];
    for (const placement of placements) {
      const template = await this.getTemplate(placement.path);
      if (generation !== this.generation) {
        return;
      }
      if (!this.isNear(key)) {
        // the camera left while loading: drop what this tile already placed
        this.tiles.set(key, ids);
        this.removeTile(key);
        return;
      }
      if (!template) {
        continue;
      }
      ids.push(placement.uniqueId);
      const existing = this.placed.get(placement.uniqueId);
      if (existing) {
        existing.tiles.add(key);
        continue;
      }
      const object = perfTime('building clone', () => template.clone());
      object.name = `wmo:${placement.uniqueId}`;
      applyPlacement(object, placement);
      this.group.add(object);
      this.placed.set(placement.uniqueId, { object, tiles: new Set([key]) });
    }
    this.tiles.set(key, ids);
    this.onChange();
  }

  private getTemplate(path: string): Promise<Group | undefined> {
    const key = path.toLowerCase();
    let template = this.templates.get(key);
    if (!template) {
      template = this.source.getWmo(path).then(async (model) => {
        if (!model) {
          return undefined;
        }
        const textures = await Promise.all(
          model.materials.map((material) =>
            material.texture ? this.textures.get(material.texture) : Promise.resolve(this.textures.fallback),
          ),
        );
        const built = perfTime('building build', () => buildWmoObject(model, textures, this.textures.fallback));
        setWmoIndoorVisible(built, this.indoorVisible);
        return built;
      });
      template.catch(() => this.templates.delete(key));
      this.templates.set(key, template);
    }
    return template;
  }

  private removeTile(key: string): void {
    for (const id of this.tiles.get(key) as number[]) {
      const placed = this.placed.get(id) as Placed;
      placed.tiles.delete(key);
      if (placed.tiles.size === 0) {
        this.group.remove(placed.object);
        this.placed.delete(id);
      }
    }
    this.tiles.delete(key);
  }

  private clear(): void {
    this.generation++;
    this.loading.clear();
    this.tiles.clear();
    this.placed.forEach(({ object }) => this.group.remove(object));
    this.placed.clear();
    this.onChange();
  }

  private isNear(key: string): boolean {
    const [tx, ty] = key.split('_').map(Number);
    const near = Math.max(Math.abs(tx - this.centerTile.tx), Math.abs(ty - this.centerTile.ty)) <= this.options.radius + 1;
    return near || this.regionKeys.has(key);
  }
}
