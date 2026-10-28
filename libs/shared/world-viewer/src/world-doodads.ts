import {
  M2Mesh,
  m2Path,
  ModelPlacement,
  TILE_SIZE,
  TileCoord,
  tileKey,
  tilesAround,
  tilesInBounds,
  WorldBounds,
  WorldPosition,
  worldToTile,
  perfTime,
} from '@keira/shared/wow-data';
import { Group, InstancedMesh, Object3D } from 'three';
import { insideBounds } from './bounds';
import { COLLISION_LAYER, COLLISION_MATERIAL } from './collision-object';
import { buildM2Template, disposeM2Template, M2Template } from './m2-object';
import { TextureCache } from './texture-cache';
import { applyPlacement } from './wmo-object';

/** What the doodad streamer needs from `WowClientService`. */
export interface DoodadSource {
  getTilePlacements(directory: string, tile: TileCoord): Promise<{ wmos: ModelPlacement[]; doodads: ModelPlacement[] } | undefined>;
  getM2(path: string): Promise<M2Mesh | undefined>;
}

export interface WorldDoodadsOptions {
  show: boolean;
  /** Large doodads (trees, big rocks…) farther than this from the camera target (in yards) aren't drawn. */
  distance: number;
  /** Same for small doodads (bushes, grass tufts, barrels…). */
  smallDistance: number;
}

/** Doodads whose placed bounding radius is below this many yards count as small. */
export const SMALL_DOODAD_RADIUS = 4;

/**
 * Draws the doodads (trees, rocks, fences, props…) placed by the ADT tiles near the camera target, up to a distance.
 * Each model is drawn as one instanced mesh, so a forest of the same tree costs a single draw call per material.
 */
export class WorldDoodads {
  /** Which way the camera looks (server x/y): tiles in front load first. */
  facing?: { x: number; y: number };
  private directory?: string;
  private generation = 0;
  private center?: WorldPosition;
  private centerTile: TileCoord = { tx: 32, ty: 32 };
  private options: WorldDoodadsOptions = { show: true, distance: 250, smallDistance: 250 };
  private readonly tiles = new Map<string, ModelPlacement[]>();
  private readonly loading = new Set<string>();
  /** Model templates by lower-case `.m2` path; undefined once loaded means the model is missing or unreadable. */
  private readonly templates = new Map<string, Promise<M2Template | undefined>>();
  private readonly ready = new Map<string, M2Template | undefined>();
  private readonly meshes = new Map<string, InstancedMesh>();
  /** The collision of the models that have one, instanced like the models. */
  private readonly collisions = new Map<string, InstancedMesh>();
  private readonly dummy = new Object3D();
  /** The instances last placed per model (unique ids), so an unchanged model isn't placed again. */
  private readonly placedIds = new Map<string, string>();
  /** Also draw every doodad inside this area (Load the whole zone), whatever the distance. */
  private region?: WorldBounds;
  private regionKeys = new Set<string>();
  private refreshQueued = false;
  private readonly modelKeys = new Map<string, string>();

  constructor(
    private readonly source: DoodadSource,
    private readonly group: Group,
    private readonly textures: TextureCache,
    private readonly onChange: () => void,
  ) {}

  /** Number of doodads currently drawn. */
  get drawnCount(): number {
    let count = 0;
    this.meshes.forEach((mesh) => (count += mesh.count));
    return count;
  }

  /** Tiles and models still being loaded. */
  get pendingCount(): number {
    return this.loading.size + this.templates.size - this.ready.size;
  }

  get loadedTiles(): string[] {
    return [...this.tiles.keys()];
  }

  setMap(directory: string | undefined): void {
    this.directory = directory;
    this.clear();
  }

  /** Also loads and draws every doodad of `bounds` (until set to undefined); takes effect at the next update(). */
  setRegion(bounds: WorldBounds | undefined): void {
    this.region = bounds;
  }

  configure(options: WorldDoodadsOptions): void {
    if (
      options.show === this.options.show &&
      options.distance === this.options.distance &&
      options.smallDistance === this.options.smallDistance
    ) {
      return;
    }
    this.options = { ...options };
    if (this.enabled) {
      this.refresh();
    } else {
      this.clear();
    }
  }

  async update(center: WorldPosition): Promise<void> {
    const directory = this.directory;
    if (!directory || !this.enabled) {
      return;
    }
    const generation = this.generation;
    this.center = center;
    this.centerTile = worldToTile(center.x, center.y);
    const regionTiles = this.region ? tilesInBounds(this.region, this.centerTile) : [];
    this.regionKeys = new Set(regionTiles.map(tileKey));
    for (const key of [...this.tiles.keys()]) {
      if (!this.isNear(key)) {
        this.tiles.delete(key);
      }
    }
    this.refresh();

    for (const tile of [...tilesAround(this.centerTile, this.tileRadius, this.facing), ...regionTiles]) {
      const key = tileKey(tile);
      if (this.tiles.has(key) || this.loading.has(key)) {
        continue;
      }
      this.loading.add(key);
      try {
        const placements = (await this.source.getTilePlacements(directory, tile))?.doodads ?? [];
        if (generation !== this.generation) {
          return;
        }
        if (this.isNear(key)) {
          this.tiles.set(key, placements);
          this.queueRefresh();
        }
      } catch (error) {
        console.warn(`[World Editor] Could not load the doodads of ${directory}_${key}: ${(error as Error).message}`);
      } finally {
        this.loading.delete(key);
      }
    }
  }

  /** Loads a model ahead of time (kept for when a tile places it). */
  prefetch(path: string): void {
    this.loadTemplate(m2Path(path).toLowerCase(), path);
  }

  dispose(): void {
    this.directory = undefined;
    this.clear();
    this.templates.forEach((template) => void template.then((t) => t && disposeM2Template(t)));
    this.templates.clear();
    this.ready.clear();
  }

  private get enabled(): boolean {
    return this.options.show && this.reach > 0;
  }

  /** The farthest any doodad is drawn. */
  private get reach(): number {
    return Math.max(this.options.distance, this.options.smallDistance);
  }

  /** Tiles that can hold doodads within the draw distance. */
  private get tileRadius(): number {
    return Math.ceil(this.reach / TILE_SIZE);
  }

  /**
   * Many tiles and models finish loading in a row: the instances are rebuilt once for all of them, on the next frame,
   * instead of once each (which made loading stutter).
   */
  private queueRefresh(): void {
    if (this.refreshQueued) {
      return;
    }
    this.refreshQueued = true;
    requestAnimationFrame(() => {
      this.refreshQueued = false;
      this.refresh();
    });
  }

  /** Rebuilds the instances from the loaded tiles: what's within the distance, grouped by model. */
  private refresh(): void {
    perfTime('doodads refresh', () => this.refreshNow());
  }

  private refreshNow(): void {
    const center = this.center;
    if (!center) {
      return;
    }
    const byModel = new Map<string, ModelPlacement[]>();
    const seen = new Set<number>();
    for (const placements of this.tiles.values()) {
      for (const placement of placements) {
        const key = this.modelKey(placement.path);
        if (seen.has(placement.uniqueId) || !this.inRange(placement, center, this.ready.get(key))) {
          continue;
        }
        seen.add(placement.uniqueId);
        const list = byModel.get(key) ?? [];
        list.push(placement);
        byModel.set(key, list);
      }
    }

    for (const [key, mesh] of [...this.meshes]) {
      if (!byModel.has(key)) {
        this.removeMesh(key, mesh);
      }
    }
    for (const [key, placements] of byModel) {
      if (!this.ready.has(key)) {
        this.loadTemplate(key, placements[0].path);
        continue;
      }
      const template = this.ready.get(key);
      if (template) {
        this.placeInstances(key, template, placements);
      }
    }
    this.onChange();
  }

  /** The model a placement uses (as `.m2`, lower case): worked out once per path, this runs for every placement. */
  private modelKey(path: string): string {
    let key = this.modelKeys.get(path);
    if (key === undefined) {
      key = m2Path(path).toLowerCase();
      this.modelKeys.set(path, key);
    }
    return key;
  }

  /** Within the distance of its size group; models not loaded yet use the farthest distance, to get loaded. */
  private inRange(placement: ModelPlacement, center: WorldPosition, template: M2Template | undefined): boolean {
    if (insideBounds(this.region, placement.position[0], placement.position[1])) {
      return true;
    }
    const dx = placement.position[0] - center.x;
    const dy = placement.position[1] - center.y;
    const radius = template ? template.radius * placement.scale : undefined;
    const limit = radius === undefined ? this.reach : radius < SMALL_DOODAD_RADIUS ? this.options.smallDistance : this.options.distance;
    return dx * dx + dy * dy <= limit * limit;
  }

  private placeInstances(key: string, template: M2Template, placements: ModelPlacement[]): void {
    const ids = placements.map((p) => p.uniqueId).join(',');
    let mesh = this.meshes.get(key);
    if (mesh && this.placedIds.get(key) === ids) {
      return;
    }
    this.placedIds.set(key, ids);
    if (!mesh || mesh.instanceMatrix.count < placements.length) {
      if (mesh) {
        this.removeMesh(key, mesh);
      }
      // room to grow, so walking around doesn't recreate the mesh at every step
      const capacity = Math.ceil(placements.length * 1.5);
      mesh = new InstancedMesh(template.geometry, template.materials, capacity);
      mesh.name = `doodad:${key}`;
      this.group.add(mesh);
      this.meshes.set(key, mesh);
      if (template.collision) {
        const collision = new InstancedMesh(template.collision, COLLISION_MATERIAL, capacity);
        collision.layers.set(COLLISION_LAYER);
        this.group.add(collision);
        this.collisions.set(key, collision);
      }
    }
    const collision = this.collisions.get(key);
    for (const instanced of collision ? [mesh, collision] : [mesh]) {
      placements.forEach((placement, i) => {
        applyPlacement(this.dummy, placement);
        this.dummy.updateMatrix();
        instanced.setMatrixAt(i, this.dummy.matrix);
      });
      instanced.count = placements.length;
      instanced.instanceMatrix.needsUpdate = true;
      instanced.computeBoundingSphere();
    }
  }

  private loadTemplate(key: string, path: string): void {
    if (this.templates.has(key)) {
      return;
    }
    const template = this.source
      .getM2(path)
      .then(async (model) => {
        if (!model) {
          return undefined;
        }
        const textures = await Promise.all(
          model.batches.map((batch) => (batch.texture ? this.textures.get(batch.texture) : Promise.resolve(this.textures.fallback))),
        );
        return buildM2Template(model, textures, this.textures.fallback);
      })
      .catch((error) => {
        console.warn(`[World Editor] Could not load the model ${path}: ${(error as Error).message}`);
        return undefined;
      });
    this.templates.set(key, template);
    void template.then((loaded) => {
      // dispose() may have run meanwhile: only a template still listed is used
      if (this.templates.get(key) === template) {
        this.ready.set(key, loaded);
        this.queueRefresh();
      } else if (loaded) {
        disposeM2Template(loaded);
      }
    });
  }

  private removeMesh(key: string, mesh: InstancedMesh): void {
    this.group.remove(mesh);
    mesh.dispose();
    this.meshes.delete(key);
    this.placedIds.delete(key);
    const collision = this.collisions.get(key);
    if (collision) {
      this.group.remove(collision);
      collision.dispose();
      this.collisions.delete(key);
    }
  }

  private clear(): void {
    this.generation++;
    this.loading.clear();
    this.tiles.clear();
    this.center = undefined;
    this.meshes.forEach((mesh, key) => this.removeMesh(key, mesh));
    this.onChange();
  }

  private isNear(key: string): boolean {
    const [tx, ty] = key.split('_').map(Number);
    return (
      Math.max(Math.abs(tx - this.centerTile.tx), Math.abs(ty - this.centerTile.ty)) <= this.tileRadius + 1 || this.regionKeys.has(key)
    );
  }
}
