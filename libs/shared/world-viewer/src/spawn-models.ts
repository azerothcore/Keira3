import { CreatureDisplay, isDefaultCharacterGeoset, M2Mesh, WmoModel, WorldBounds, WorldPosition, perfTime } from '@keira/shared/wow-data';
import { Group, Mesh, Object3D } from 'three';
import { insideBounds } from './bounds';
import { collisionMesh } from './collision-object';
import { buildM2Template, disposeM2Template, M2Template } from './m2-object';
import { TextureCache } from './texture-cache';
import { buildWmoObject, disposeWmoObject } from './wmo-object';
import { WorldScene } from './world-scene';
import { WorldSpawn } from './world-viewer.model';

/** What spawn models need from `WowClientService`. */
export interface SpawnModelSource {
  getCreatureDisplay(displayId: number): Promise<CreatureDisplay | undefined>;
  getGameObjectDisplay(displayId: number): Promise<string | undefined>;
  getM2(path: string): Promise<M2Mesh | undefined>;
  /** Gameobjects whose model is a building (ships, elevators, some doors). */
  getWmo(path: string): Promise<WmoModel | undefined>;
}

export interface SpawnModelsOptions {
  show: boolean;
  /** Creatures / gameobjects farther than this from the camera target (yards) keep their pin; 0 = always pins. */
  creatureDistance: number;
  gameobjectDistance: number;
}

/** A display's model, ready to be placed: geometry and materials shared by every spawn using it. */
export interface DisplayModel {
  template: M2Template;
  /** Size of the model itself (CreatureDisplayInfo × CreatureModelData scales); the spawn's own scale multiplies it. */
  scale: number;
}

/** A spawn's model: a model (M2) or, for some gameobjects, a building (WMO). */
type SpawnModel = DisplayModel | { building: Group; scale: number };

/**
 * Draws creatures and gameobjects near the camera target with their real models (by display id), and as pins farther
 * away. Models load once per display id; humanoid NPCs show their baked skin, hair and default geosets.
 */
export class SpawnModels {
  private options: SpawnModelsOptions = { show: true, creatureDistance: 250, gameobjectDistance: 250 };
  private spawns: WorldSpawn[] = [];
  private center?: WorldPosition;
  private readonly models = new Map<string, Promise<SpawnModel | undefined>>();
  private readonly ready = new Map<string, SpawnModel | undefined>();
  /** Spawns drawn with a model: spawn key → display key. */
  private readonly shown = new Map<string, string>();
  /** Also show the models of every spawn inside this area (Load the whole zone), whatever the distance. */
  private region?: WorldBounds;
  private refreshQueued = false;

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

  setRegion(bounds: WorldBounds | undefined): void {
    this.region = bounds;
    this.refresh();
  }

  /** Call after `WorldScene.setSpawns`, with the keys of the pins it kept (those keep their model). */
  setSpawns(spawns: WorldSpawn[], kept: ReadonlySet<string> = new Set()): void {
    this.spawns = spawns;
    [...this.shown.keys()].filter((key) => !kept.has(key)).forEach((key) => this.shown.delete(key));
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
    this.models.forEach((model) => void model.then((m) => m && disposeSpawnModel(m)));
    this.models.clear();
    this.ready.clear();
  }

  private refresh(): void {
    perfTime('spawn models refresh', () => this.refreshNow());
  }

  private refreshNow(): void {
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
        this.scene.setSpawnModel(spawn.key, instantiate(model, spawn), model.scale * (spawn.scale ?? 1));
        this.shown.set(spawn.key, displayKey as string);
        changed = true;
      }
    }
    if (changed) {
      this.onChange();
    }
  }

  /** Models finishing in a row: placed once for all of them, on the next frame. */
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

  private inRange(spawn: WorldSpawn, center: WorldPosition): boolean {
    if (this.options.show && insideBounds(this.region, spawn.position.x, spawn.position.y)) {
      return true;
    }
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
        this.queueRefresh();
      } else if (loaded) {
        disposeSpawnModel(loaded);
      }
    });
  }

  private async loadModel(spawn: WorldSpawn): Promise<SpawnModel | undefined> {
    const displayId = spawn.displayId as number;
    const display: CreatureDisplay | undefined =
      spawn.kind === 'creature'
        ? await this.source.getCreatureDisplay(displayId)
        : await this.source.getGameObjectDisplay(displayId).then((model) => (model ? { model, scale: 1, textures: {} } : undefined));
    if (display && /\.wmo$/i.test(display.model)) {
      return this.loadBuilding(display.model);
    }
    return display && displayModel(display, this.source, this.textures);
  }

  private async loadBuilding(path: string): Promise<SpawnModel | undefined> {
    const model = await this.source.getWmo(path);
    if (!model) {
      return undefined;
    }
    const textures = await Promise.all(
      model.materials.map((material) => (material.texture ? this.textures.get(material.texture) : Promise.resolve(this.textures.fallback))),
    );
    return { building: buildWmoObject(model, textures, this.textures.fallback), scale: 1 };
  }
}

/** A spawn's own copy of its model (sharing geometry and materials); gameobjects get their collision too. */
function instantiate(model: SpawnModel, spawn: WorldSpawn): Object3D {
  if ('building' in model) {
    return model.building.clone();
  }
  const mesh = new Mesh(model.template.geometry, model.template.materials);
  // only gameobjects collide on the server (doors, chests…); creatures never do
  if (spawn.kind === 'gameobject' && model.template.collision) {
    mesh.add(collisionMesh(model.template.collision));
  }
  return mesh;
}

function disposeSpawnModel(model: SpawnModel): void {
  if ('building' in model) {
    disposeWmoObject(model.building);
  } else {
    disposeM2Template(model.template);
  }
}

/**
 * The model of a creature display (or a player character), ready to place: its mesh with the display's textures in the
 * replaceable slots and, for character models, only the default geosets with its hair. Undefined when not readable.
 */
export async function displayModel(
  display: CreatureDisplay,
  source: Pick<SpawnModelSource, 'getM2'>,
  textures: TextureCache,
): Promise<DisplayModel | undefined> {
  const mesh = await source.getM2(display.model);
  if (!mesh) {
    return undefined;
  }
  const hairGeoset = display.hairGeoset;
  const batches = hairGeoset === undefined ? mesh.batches : mesh.batches.filter((b) => isDefaultCharacterGeoset(b.geoset, hairGeoset));
  const images = await Promise.all(
    batches.map((batch) => {
      const path = batch.texture ?? display.textures[batch.textureType];
      return path ? textures.get(path) : Promise.resolve(textures.fallback);
    }),
  );
  return { template: buildM2Template({ ...mesh, batches }, images, textures.fallback), scale: display.scale };
}
