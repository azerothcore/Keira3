import {
  ANIM_STAND,
  ANIM_WALK,
  CreatureDisplay,
  isDefaultCharacterGeoset,
  ItemDisplay,
  M2Mesh,
  M2Skeleton,
  ModelAttachment,
  WmoModel,
  WorldBounds,
  WorldPosition,
  perfTime,
  weaponAttachment,
} from '@keira/shared/wow-data';
import { BufferAttribute, BufferGeometry, Group, Mesh, Object3D, SkinnedMesh, Sphere } from 'three';
import { M2Animator } from './m2-animator';
import { insideBounds } from './bounds';
import { collisionMesh } from './collision-object';
import { buildM2Template, disposeM2Template, M2Template } from './m2-object';
import { TextureCache } from './texture-cache';
import { buildWmoObject, disposeWmoObject } from './wmo-object';
import { WorldScene } from './world-scene';
import { SpawnKind, WorldSpawn } from './world-viewer.model';

/** What spawn models need from `WowClientService`. */
export interface SpawnModelSource {
  getCreatureDisplay(displayId: number): Promise<CreatureDisplay | undefined>;
  getGameObjectDisplay(displayId: number): Promise<string | undefined>;
  getM2(path: string): Promise<M2Mesh | undefined>;
  /** Gameobjects whose model is a building (ships, elevators, some doors). */
  getWmo(path: string): Promise<WmoModel | undefined>;
  /** Bones and the standing / walking animations of a model (for animated creatures). */
  getM2Skeleton(path: string): Promise<M2Skeleton | undefined>;
  /** How a held item looks (weapons, shields). */
  getItemDisplay(itemId: number): Promise<{ display: ItemDisplay; shield: boolean } | undefined>;
}

export interface SpawnModelsOptions {
  show: boolean;
  /** Creatures / gameobjects farther than this from the camera target (yards) keep their pin; 0 = always pins. */
  creatureDistance: number;
  gameobjectDistance: number;
  /** Creatures wear their equipment: helmet, shoulders, weapons, and the geosets of their clothes. */
  equipment?: boolean;
  /** Creatures play their standing animation, and those that move (paths, wandering) their walking one. */
  idle?: boolean;
  walk?: boolean;
}

/** A model worn at a bone of a display's model (helmet, shoulders, weapons), in the model's bind pose. */
export interface WornModel {
  template: M2Template;
  bone: number;
  position: [number, number, number];
}

/** A display's model, ready to be placed: geometry and materials shared by every spawn using it. */
export interface DisplayModel {
  template: M2Template;
  /** Size of the model itself (CreatureDisplayInfo × CreatureModelData scales); the spawn's own scale multiplies it. */
  scale: number;
  worn?: WornModel[];
  /** Animated copies: the geometries with their bones' weights, and one skeleton per animation playing. */
  animated?: { geometry: BufferGeometry; worn: BufferGeometry[]; animators: Map<number, M2Animator> };
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
  /** Spawns drawn animated now (spawn keys): while any is, the view keeps drawing. */
  private readonly animatedShown = new Set<string>();
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

  /** Whether some creatures are playing an animation (the view then draws every frame). */
  get animating(): boolean {
    return this.animatedShown.size > 0;
  }

  configure(options: SpawnModelsOptions): void {
    const looks = (o: SpawnModelsOptions) => `${!!o.equipment}:${!!o.idle}:${!!o.walk}`;
    if (
      options.show === this.options.show &&
      options.creatureDistance === this.options.creatureDistance &&
      options.gameobjectDistance === this.options.gameobjectDistance &&
      looks(options) === looks(this.options)
    ) {
      return;
    }
    const reload = looks(options) !== looks(this.options);
    this.options = { ...options };
    if (reload) {
      // models are built for the equipment and animations asked for: built again
      this.shown.forEach((_display, key) => this.scene.setSpawnModel(key, undefined));
      this.shown.clear();
      this.animatedShown.clear();
      this.models.forEach((model) => void model.then((m) => m && disposeSpawnModel(m)));
      this.models.clear();
      this.ready.clear();
    }
    this.refresh();
  }

  /** Poses the animated models at `time` (ms). */
  animate(time: number): void {
    for (const model of this.ready.values()) {
      if (model && 'animated' in model && model.animated) {
        model.animated.animators.forEach((animator) => animator.update(time));
      }
    }
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
    this.animatedShown.clear();
    this.models.forEach((model) => void model.then((m) => m && disposeSpawnModel(m)));
    this.models.clear();
    this.ready.clear();
  }

  /**
   * A copy of a display's model (loaded once, shared with the spawns showing it) with its size, e.g. for the placing
   * preview; undefined when it can't be read.
   */
  async instance(kind: SpawnKind, displayId: number): Promise<{ object: Object3D; scale: number } | undefined> {
    const spawn = { key: 'preview', kind, displayId } as WorldSpawn;
    const displayKey = this.displayKey(spawn) as string;
    this.load(displayKey, spawn);
    const model = await this.models.get(displayKey);
    return model && { object: this.instantiate(model, spawn), scale: model.scale };
  }

  private refresh(): void {
    perfTime('spawn models refresh', () => this.refreshNow());
  }

  private refreshNow(): void {
    const center = this.center;
    let changed = false;
    for (const spawn of this.spawns) {
      const displayKey = this.displayKey(spawn);
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
        const object = this.instantiate(model, spawn);
        this.scene.setSpawnModel(spawn.key, object, model.scale * (spawn.scale ?? 1));
        this.shown.set(spawn.key, displayKey as string);
        if (object instanceof SkinnedMesh) {
          this.animatedShown.add(spawn.key);
        } else {
          this.animatedShown.delete(spawn.key);
        }
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
    this.animatedShown.delete(key);
    return true;
  }

  /** What a spawn's model is loaded under: its display, and the weapons it holds with equipment shown. */
  private displayKey(spawn: WorldSpawn): string | undefined {
    if (!spawn.displayId) {
      return undefined;
    }
    const weapons = this.options.equipment && spawn.weapons?.some(Boolean) ? `:${spawn.weapons.join(',')}` : '';
    return `${spawn.kind}:${spawn.displayId}${weapons}`;
  }

  /** The animation a spawn plays, if any: walking when it moves, else standing (as asked). */
  private animationOf(spawn: WorldSpawn): number | undefined {
    if (spawn.kind !== 'creature') {
      return undefined;
    }
    return spawn.moves && this.options.walk ? ANIM_WALK : this.options.idle ? ANIM_STAND : undefined;
  }

  /** A spawn's own copy of its model (sharing geometry and materials); gameobjects get their collision too. */
  private instantiate(model: SpawnModel, spawn: WorldSpawn): Object3D {
    if ('building' in model) {
      return model.building.clone();
    }
    const animation = this.animationOf(spawn);
    const animator = animation === undefined ? undefined : model.animated?.animators.get(animation);
    if (model.animated && animator) {
      const skinned = (geometry: BufferGeometry, materials: M2Template['materials']) => {
        const mesh = new SkinnedMesh(geometry, materials);
        mesh.bindMode = 'detached';
        mesh.bind(animator.skeleton);
        // (posed, it reaches a little farther than its bind pose)
        mesh.boundingSphere = (geometry.boundingSphere as Sphere).clone();
        mesh.boundingSphere.radius *= 1.5;
        return mesh;
      };
      const body = skinned(model.animated.geometry, model.template.materials);
      model.animated.worn.forEach((geometry, i) => body.add(skinned(geometry, (model.worn as WornModel[])[i].template.materials)));
      return body;
    }
    const mesh = new Mesh(model.template.geometry, model.template.materials);
    for (const worn of model.worn ?? []) {
      const part = new Mesh(worn.template.geometry, worn.template.materials);
      part.position.set(...worn.position);
      mesh.add(part);
    }
    // only gameobjects collide on the server (doors, chests…); creatures never do
    if (spawn.kind === 'gameobject' && model.template.collision) {
      mesh.add(collisionMesh(model.template.collision));
    }
    return mesh;
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
    if (!display) {
      return undefined;
    }
    const creature = spawn.kind === 'creature';
    const weapons = creature && this.options.equipment ? await this.weaponsOf(spawn) : [];
    return displayModel(display, this.source, this.textures, {
      equipment: creature && !!this.options.equipment,
      weapons,
      animations: creature && (this.options.idle || this.options.walk) ? [ANIM_STAND, ANIM_WALK] : [],
    });
  }

  /** The weapons in a creature's hands (its equipment's first two items). */
  private async weaponsOf(spawn: WorldSpawn): Promise<ModelAttachment[]> {
    const [right, left] = spawn.weapons ?? [];
    const held = await Promise.all(
      [right, left].map((item) => (item ? this.source.getItemDisplay(item).catch(() => undefined) : Promise.resolve(undefined))),
    );
    return held.flatMap((item, i) => {
      const attachment = item && weaponAttachment(item.display, i === 0 ? 'right' : 'left', item.shield);
      return attachment ? [attachment] : [];
    });
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

function disposeSpawnModel(model: SpawnModel): void {
  if ('building' in model) {
    disposeWmoObject(model.building);
    return;
  }
  disposeM2Template(model.template);
  model.worn?.forEach((worn) => disposeM2Template(worn.template));
  model.animated?.geometry.dispose();
  model.animated?.worn.forEach((geometry) => geometry.dispose());
  model.animated?.animators.forEach((animator) => animator.dispose());
}

/** What to build a display's model with: its equipment, the weapons it holds, the animations it may play. */
export interface DisplayModelOptions {
  equipment?: boolean;
  weapons?: ModelAttachment[];
  animations?: number[];
}

/**
 * The model of a creature display (or a player character), ready to place: its mesh with the display's textures in the
 * replaceable slots and, for character models, the geosets of its hair and (with equipment) clothes, its helmet,
 * shoulders and weapons; with animations, the geometries to skin and a skeleton per animation. Undefined when the
 * model can't be read.
 */
export async function displayModel(
  display: CreatureDisplay,
  source: Pick<SpawnModelSource, 'getM2'> & Partial<Pick<SpawnModelSource, 'getM2Skeleton'>>,
  textures: TextureCache,
  options: DisplayModelOptions = {},
): Promise<DisplayModel | undefined> {
  const mesh = await source.getM2(display.model);
  if (!mesh) {
    return undefined;
  }
  const geosets = options.equipment ? display.geosets : display.plainGeosets;
  const hairGeoset = display.hairGeoset;
  const batches = geosets
    ? mesh.batches.filter((b) => geosets.includes(b.geoset))
    : hairGeoset === undefined
      ? mesh.batches
      : mesh.batches.filter((b) => isDefaultCharacterGeoset(b.geoset, hairGeoset));
  const images = await Promise.all(
    batches.map((batch) => {
      const path = batch.texture ?? display.textures[batch.textureType];
      return path ? textures.get(path) : Promise.resolve(textures.fallback);
    }),
  );
  const model: DisplayModel = { template: buildM2Template({ ...mesh, batches }, images, textures.fallback), scale: display.scale };

  // what it wears, at its attachment points
  const wearing = [...(options.equipment ? (display.attachments ?? []) : []), ...(options.weapons ?? [])];
  const worn: WornModel[] = [];
  for (const attachment of wearing) {
    const point = mesh.attachments?.find((a) => a.id === attachment.point);
    const part = point && (await source.getM2(attachment.model));
    if (point && part) {
      // (the item's own texture in the slots the model leaves open)
      const resolved = await Promise.all(
        part.batches.map((batch) => {
          const path = batch.texture ?? attachment.texture;
          return path ? textures.get(path) : Promise.resolve(textures.fallback);
        }),
      );
      worn.push({ template: buildM2Template(part, resolved, textures.fallback), bone: point.bone, position: point.position });
    }
  }
  if (worn.length) {
    model.worn = worn;
  }

  // animated: the same geometry with each vertex's bones, and a skeleton per animation
  const skeleton = options.animations?.length && source.getM2Skeleton ? await source.getM2Skeleton(display.model) : undefined;
  if (skeleton && skeleton.animations.length) {
    const animators = new Map(
      (options.animations as number[]).flatMap((id) => {
        const animation = skeleton.animations.find((a) => a.id === id);
        return animation ? [[id, new M2Animator(skeleton, animation)] as const] : [];
      }),
    );
    model.animated = {
      geometry: skinnedGeometry(model.template.geometry, skeleton.boneIndices, skeleton.boneWeights),
      worn: worn.map((part) => riggedToBone(part)),
      animators,
    };
  }
  return model;
}

/** A copy of a model's geometry (sharing its buffers) with the bones moving each vertex. */
function skinnedGeometry(geometry: BufferGeometry, indices: Uint16Array, weights: Uint8Array): BufferGeometry {
  const skinned = geometry.clone();
  skinned.setAttribute('skinIndex', new BufferAttribute(indices, 4));
  skinned.setAttribute('skinWeight', new BufferAttribute(weights, 4, true));
  return skinned;
}

/** A worn model's geometry moved to its attachment point and moved by its bone alone (it follows that bone). */
function riggedToBone(worn: WornModel): BufferGeometry {
  const geometry = worn.template.geometry.clone();
  geometry.translate(...worn.position);
  const count = geometry.getAttribute('position').count;
  const indices = new Uint16Array(count * 4);
  const weights = new Uint8Array(count * 4);
  for (let i = 0; i < count; i++) {
    indices[i * 4] = worn.bone;
    weights[i * 4] = 255;
  }
  geometry.setAttribute('skinIndex', new BufferAttribute(indices, 4));
  geometry.setAttribute('skinWeight', new BufferAttribute(weights, 4, true));
  return geometry;
}
