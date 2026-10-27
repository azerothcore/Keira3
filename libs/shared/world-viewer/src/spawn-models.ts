import { CreatureDisplay, isDefaultCharacterGeoset, M2Mesh, WorldPosition } from '@keira/shared/wow-data';
import { Mesh } from 'three';
import { collisionMesh } from './collision-object';
import { buildM2Template, disposeM2Template, M2Template } from './m2-object';
import { TextureCache } from './texture-cache';
import { WorldScene } from './world-scene';
import { WorldSpawn } from './world-viewer.model';

/** What spawn models need from `WowClientService`. */
export interface SpawnModelSource {
  getCreatureDisplay(displayId: number): Promise<CreatureDisplay | undefined>;
  getGameObjectDisplay(displayId: number): Promise<string | undefined>;
  getM2(path: string): Promise<M2Mesh | undefined>;
}

export interface SpawnModelsOptions {
  show: boolean;
  /** Creatures / gameobjects farther than this from the camera target (yards) keep their pin; 0 = always pins. */
  creatureDistance: number;
  gameobjectDistance: number;
}

/** A display's model, ready to be placed: geometry and materials shared by every spawn using it. */
interface DisplayModel {
  template: M2Template;
  /** Size of the model itself (CreatureDisplayInfo × CreatureModelData scales); the spawn's own scale multiplies it. */
  scale: number;
}

/**
 * Draws creatures and gameobjects near the camera target with their real models (by display id), and as pins farther
 * away. Models load once per display id; humanoid NPCs show their baked skin, hair and default geosets.
 */
export class SpawnModels {
  private options: SpawnModelsOptions = { show: true, creatureDistance: 250, gameobjectDistance: 250 };
  private spawns: WorldSpawn[] = [];
  private center?: WorldPosition;
  private readonly models = new Map<string, Promise<DisplayModel | undefined>>();
  private readonly ready = new Map<string, DisplayModel | undefined>();
  /** Spawns drawn with a model: spawn key → display key. */
  private readonly shown = new Map<string, string>();

  constructor(
    private readonly source: SpawnModelSource,
    private readonly scene: WorldScene,
    private readonly textures: TextureCache,
    private readonly onChange: () => void,
  ) {}

  /** Models still being loaded. */
  get pendingCount(): number {
    return this.models.size - this.ready.size;
  }

  get shownCount(): number {
    return this.shown.size;
  }

  configure(options: SpawnModelsOptions): void {
    if (
      options.show === this.options.show &&
      options.creatureDistance === this.options.creatureDistance &&
      options.gameobjectDistance === this.options.gameobjectDistance
    ) {
      return;
    }
    this.options = { ...options };
    this.refresh();
  }

  /** Call after `WorldScene.setSpawns` (which recreates the pins). */
  setSpawns(spawns: WorldSpawn[]): void {
    this.spawns = spawns;
    this.shown.clear();
    this.refresh();
  }

  update(center: WorldPosition): void {
    this.center = center;
    this.refresh();
  }

  dispose(): void {
    this.spawns = [];
    this.shown.forEach((_display, key) => this.scene.setSpawnModel(key, undefined));
    this.shown.clear();
    this.models.forEach((model) => void model.then((m) => m && disposeM2Template(m.template)));
    this.models.clear();
    this.ready.clear();
  }

  private refresh(): void {
    const center = this.center;
    let changed = false;
    for (const spawn of this.spawns) {
      const displayKey = spawn.displayId ? `${spawn.kind}:${spawn.displayId}` : undefined;
      const wanted = !!center && !!displayKey && this.inRange(spawn, center);
      if (!wanted || !this.ready.has(displayKey as string)) {
        if (wanted) {
          this.load(displayKey as string, spawn);
        }
        changed = this.hide(spawn.key) || changed;
        continue;
      }
      const model = this.ready.get(displayKey as string);
      if (!model) {
        changed = this.hide(spawn.key) || changed;
      } else if (this.shown.get(spawn.key) !== displayKey) {
        const mesh = new Mesh(model.template.geometry, model.template.materials);
        if (model.template.collision) {
          mesh.add(collisionMesh(model.template.collision));
        }
        this.scene.setSpawnModel(spawn.key, mesh, model.scale * (spawn.scale ?? 1));
        this.shown.set(spawn.key, displayKey as string);
        changed = true;
      }
    }
    if (changed) {
      this.onChange();
    }
  }

  private inRange(spawn: WorldSpawn, center: WorldPosition): boolean {
    const distance = spawn.kind === 'creature' ? this.options.creatureDistance : this.options.gameobjectDistance;
    const dx = spawn.position.x - center.x;
    const dy = spawn.position.y - center.y;
    return this.options.show && dx * dx + dy * dy <= distance * distance;
  }

  private hide(key: string): boolean {
    if (!this.shown.has(key)) {
      return false;
    }
    this.scene.setSpawnModel(key, undefined);
    this.shown.delete(key);
    return true;
  }

  private load(displayKey: string, spawn: WorldSpawn): void {
    if (this.models.has(displayKey)) {
      return;
    }
    const model = this.loadModel(spawn).catch((error) => {
      console.warn(`[World Editor] Could not load the model of ${spawn.kind} display ${spawn.displayId}: ${(error as Error).message}`);
      return undefined;
    });
    this.models.set(displayKey, model);
    void model.then((loaded) => {
      if (this.models.get(displayKey) === model) {
        this.ready.set(displayKey, loaded);
        this.refresh();
      } else if (loaded) {
        disposeM2Template(loaded.template);
      }
    });
  }

  private async loadModel(spawn: WorldSpawn): Promise<DisplayModel | undefined> {
    const displayId = spawn.displayId as number;
    const display: CreatureDisplay | undefined =
      spawn.kind === 'creature'
        ? await this.source.getCreatureDisplay(displayId)
        : await this.source.getGameObjectDisplay(displayId).then((model) => (model ? { model, scale: 1, textures: {} } : undefined));
    const mesh = display && (await this.source.getM2(display.model));
    if (!display || !mesh) {
      return undefined;
    }
    const hairGeoset = display.hairGeoset;
    const batches = hairGeoset === undefined ? mesh.batches : mesh.batches.filter((b) => isDefaultCharacterGeoset(b.geoset, hairGeoset));
    const textures = await Promise.all(
      batches.map((batch) => {
        const path = batch.texture ?? display.textures[batch.textureType];
        return path ? this.textures.get(path) : Promise.resolve(this.textures.fallback);
      }),
    );
    return { template: buildM2Template({ ...mesh, batches }, textures, this.textures.fallback), scale: display.scale };
  }
}
