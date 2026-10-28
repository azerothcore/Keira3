import {
  CreatureDisplay,
  EMPTY_COLLISION,
  M2Blend,
  M2Mesh,
  tileCenter,
  WmoModel,
  WorldPosition,
  worldToScene,
} from '@keira/shared/wow-data';
import { Mesh, MeshLambertMaterial, Texture } from 'three';
import { COLLISION_LAYER } from './collision-object';
import { SpawnModels, SpawnModelSource } from './spawn-models';
import { TextureCache } from './texture-cache';
import { WorldScene } from './world-scene';
import { WorldSpawn } from './world-viewer.model';

const CENTER = tileCenter({ tx: 32, ty: 48 });
const at = (east: number): WorldPosition => ({ x: CENTER.x, y: CENTER.y - east, z: 0 });
const batch = (overrides: Partial<M2Mesh['batches'][number]>): M2Mesh['batches'][number] => ({
  start: 0,
  count: 3,
  textureType: 0,
  blend: M2Blend.Opaque,
  geoset: 0,
  twoSided: false,
  unlit: false,
  ...overrides,
});
const mesh = (batches: M2Mesh['batches']): M2Mesh => ({
  positions: new Float32Array(9),
  normals: new Float32Array(9),
  uvs: new Float32Array(6),
  indices: new Uint16Array([0, 1, 2]),
  batches,
  collision: EMPTY_COLLISION,
});
const spawn = (key: string, kind: WorldSpawn['kind'], east: number, displayId?: number, scale?: number): WorldSpawn => ({
  key,
  kind,
  guid: 1,
  entry: 1,
  label: key,
  position: at(east),
  orientation: 0,
  displayId,
  scale,
});
/** Loads finish, then the refresh they queued for the next frame runs. */
const flush = async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise((resolve) => setTimeout(resolve));
  }
};

const WMO: WmoModel = {
  materials: [
    { texture: 'Elevator.blp', twoSided: false, unlit: false, blend: 0 },
    { twoSided: false, unlit: false, blend: 0 },
  ],
  groups: [
    {
      positions: new Float32Array(9),
      normals: new Float32Array(9),
      uvs: new Float32Array(6),
      indices: new Uint16Array([0, 1, 2]),
      batches: [{ start: 0, count: 3, material: 0 }],
      indoor: false,
    },
  ],
};

const DISPLAYS: Record<number, CreatureDisplay> = {
  1: { model: 'Creature\\Wolf\\Wolf.mdx', scale: 2, textures: { 11: 'Creature\\Wolf\\WolfGrey.blp' } },
  2: { model: 'Character\\Human\\Male\\HumanMale.mdx', scale: 1, textures: { 1: 'Baked.blp' }, hairGeoset: 3 },
  3: { model: 'Creature\\Missing.mdx', scale: 1, textures: {} },
};

describe('SpawnModels', () => {
  // the next frame comes right away
  beforeEach(() => vi.stubGlobal('requestAnimationFrame', (callback: () => void) => setTimeout(callback)));
  afterEach(() => vi.unstubAllGlobals());

  const setup = () => {
    const source = {
      getCreatureDisplay: vi.fn().mockImplementation((id: number) => Promise.resolve(DISPLAYS[id])),
      getGameObjectDisplay: vi
        .fn()
        .mockImplementation((id: number) =>
          Promise.resolve(id === 7 ? 'World\\Mailbox.mdx' : id === 8 ? 'World\\wmo\\Elevator.wmo' : id === 9 ? 'Gone.wmo' : undefined),
        ),
      getWmo: vi.fn().mockImplementation((path: string) => Promise.resolve(path.includes('Elevator') ? WMO : undefined)),
      getM2: vi.fn().mockImplementation((path: string) => {
        if (path.includes('Wolf')) {
          return Promise.resolve(
            mesh([batch({ textureType: 11 }), batch({ texture: 'Creature\\Wolf\\Eyes.blp' }), batch({ textureType: 12 })]),
          );
        }
        if (path.includes('HumanMale')) {
          return Promise.resolve(
            mesh([batch({ textureType: 1 }), batch({ geoset: 3, textureType: 6 }), batch({ geoset: 4 }), batch({ geoset: 702 })]),
          );
        }
        return Promise.resolve(path.includes('Mailbox') ? mesh([batch({ texture: 'World\\Mailbox.blp' })]) : undefined);
      }),
    } satisfies SpawnModelSource;
    const world = new WorldScene();
    const loaded = new Map<string, Texture>();
    const textures = new TextureCache(() => Promise.resolve({ width: 1, height: 1, data: new Uint8Array(4) }));
    const get = textures.get.bind(textures);
    vi.spyOn(textures, 'get').mockImplementation((path: string) => get(path).then((t) => (loaded.set(path, t), t)));
    const onChange = vi.fn();
    const models = new SpawnModels(source, world, textures, onChange);
    models.configure({ show: true, creatureDistance: 100, gameobjectDistance: 50 });
    return { source, world, models, onChange, textures, loaded };
  };
  const modelOf = (world: WorldScene, key: string) => world.getObject(key)?.getObjectByName('model') as Mesh | undefined;
  const show = async (models: SpawnModels, world: WorldScene, spawns: WorldSpawn[]) => {
    world.setSpawns(spawns);
    models.setSpawns(spawns);
    models.update(CENTER);
    await flush();
  };

  it('draws the spawns within distance with their display model, textures and size', async () => {
    const { models, world, source, onChange, textures, loaded } = setup();
    await show(models, world, [
      spawn('creature:1', 'creature', 0, 1, 1.5),
      spawn('creature:2', 'creature', 10, 1),
      spawn('creature:3', 'creature', 500, 1),
      spawn('creature:4', 'creature', 0),
      spawn('creature:5', 'creature', 0, 3),
      spawn('creature:6', 'creature', 0, 99),
      spawn('gameobject:1', 'gameobject', 40, 7),
      spawn('gameobject:2', 'gameobject', 80, 7),
      spawn('gameobject:3', 'gameobject', 0, 10),
    ]);

    expect(source.getCreatureDisplay).toHaveBeenCalledTimes(3);
    expect(models.shownCount).toBe(3);
    expect(modelOf(world, 'creature:1')?.scale.x).toBe(1);
    const p = worldToScene(CENTER);
    world.camera.position.set(p.x, p.y + 10, p.z);
    world.updateMarkerScale();
    expect(modelOf(world, 'creature:1')?.scale.x).toBeCloseTo(3);
    expect(modelOf(world, 'creature:2')?.scale.x).toBeCloseTo(2);
    expect(modelOf(world, 'creature:3')).toBeUndefined();
    expect(modelOf(world, 'gameobject:1')).toBeDefined();
    expect(modelOf(world, 'gameobject:2')).toBeUndefined();
    expect(onChange).toHaveBeenCalled();

    const wolf = modelOf(world, 'creature:1') as Mesh;
    const maps = (wolf.material as MeshLambertMaterial[]).map((m) => m.map);
    expect(maps).toEqual([loaded.get('Creature\\Wolf\\WolfGrey.blp'), loaded.get('Creature\\Wolf\\Eyes.blp'), textures.fallback]);
  });

  it('gives a copy of a display model, loaded once, for previews', async () => {
    const { models, source } = setup();
    const first = await models.instance('creature', 1);
    expect(first?.object).toBeInstanceOf(Mesh);
    expect(await models.instance('creature', 1)).toBeDefined();
    expect(source.getCreatureDisplay).toHaveBeenCalledTimes(1);
    expect(await models.instance('gameobject', 99)).toBeUndefined();
  });

  it('adds the collision of gameobject models that have one, on the collision layer', async () => {
    const { models, world, source } = setup();
    source.getM2.mockResolvedValue({
      ...mesh([batch()]),
      collision: { positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: new Uint16Array([0, 1, 2]) },
    });
    await show(models, world, [spawn('gameobject:1', 'gameobject', 0, 7), spawn('creature:1', 'creature', 0, 1)]);
    const collision = modelOf(world, 'gameobject:1')?.getObjectByName('collision') as Mesh;
    expect(collision.layers.isEnabled(COLLISION_LAYER)).toBe(true);
    // creatures never collide on the server
    expect(modelOf(world, 'creature:1')?.getObjectByName('collision')).toBeUndefined();
  });

  it('dresses humanoid NPCs with their default geosets', async () => {
    const { models, world } = setup();
    await show(models, world, [spawn('creature:1', 'creature', 0, 2)]);
    const human = modelOf(world, 'creature:1') as Mesh;
    expect(human.geometry.groups).toHaveLength(2);
  });

  it('puts pins back when spawns leave the distance or models are turned off', async () => {
    const { models, world, onChange } = setup();
    await show(models, world, [spawn('creature:1', 'creature', 0, 1)]);
    expect(models.shownCount).toBe(1);

    models.update(at(1000));
    expect(models.shownCount).toBe(0);
    models.update(CENTER);
    expect(models.shownCount).toBe(1);

    onChange.mockClear();
    models.configure({ show: true, creatureDistance: 100, gameobjectDistance: 50 });
    models.configure({ show: false, creatureDistance: 100, gameobjectDistance: 50 });
    expect(models.shownCount).toBe(0);
    expect(onChange).toHaveBeenCalledTimes(1);
    models.configure({ show: false, creatureDistance: 0, gameobjectDistance: 50 });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('shows the models of every spawn inside the region, whatever the distance', async () => {
    const { models, world } = setup();
    await show(models, world, [spawn('creature:1', 'creature', 500, 1)]);
    expect(models.shownCount).toBe(0);
    const far = at(500);
    models.setRegion({ minX: far.x - 10, maxX: far.x + 10, minY: far.y - 10, maxY: far.y + 10 });
    await flush();
    expect(models.shownCount).toBe(1);
    models.setRegion(undefined);
    expect(models.shownCount).toBe(0);
  });

  it('re-attaches models after the pins were recreated', async () => {
    const { models, world } = setup();
    const spawns = [spawn('creature:1', 'creature', 0, 1)];
    await show(models, world, spawns);
    await show(models, world, spawns);
    expect(modelOf(world, 'creature:1')).toBeDefined();
  });

  it('draws nothing before knowing where the camera is', async () => {
    const { models, world, source } = setup();
    const spawns = [spawn('creature:1', 'creature', 0, 1)];
    world.setSpawns(spawns);
    models.setSpawns(spawns);
    await flush();
    expect(source.getCreatureDisplay).not.toHaveBeenCalled();
  });

  it('reports models that fail to load', async () => {
    const { models, world, source } = setup();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    source.getCreatureDisplay.mockRejectedValueOnce(new Error('bad dbc'));
    await show(models, world, [spawn('creature:1', 'creature', 0, 1)]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('bad dbc'));
    expect(models.shownCount).toBe(0);
  });

  it('draws gameobjects whose model is a building (elevators, ships) with that building', async () => {
    const { models, world, loaded } = setup();
    await show(models, world, [spawn('gameobject:1', 'gameobject', 0, 8), spawn('gameobject:2', 'gameobject', 0, 9)]);
    const building = modelOf(world, 'gameobject:1');
    expect(building?.children.length).toBeGreaterThan(0);
    expect(loaded.has('Elevator.blp')).toBe(true);
    // a building that can't be read keeps its pin
    expect(modelOf(world, 'gameobject:2')).toBeUndefined();
    models.dispose();
    expect(modelOf(world, 'gameobject:1')).toBeUndefined();
  });

  it('disposes its models, including those still loading', async () => {
    const { models, world } = setup();
    await show(models, world, [spawn('creature:1', 'creature', 0, 1)]);
    models.dispose();
    expect(modelOf(world, 'creature:1')).toBeUndefined();

    const late = setup();
    const pending: (() => void)[] = [];
    late.source.getCreatureDisplay.mockImplementation((id: number) => new Promise((resolve) => pending.push(() => resolve(DISPLAYS[id]))));
    const spawns = [spawn('creature:1', 'creature', 0, 1), spawn('creature:2', 'creature', 0, 3)];
    late.world.setSpawns(spawns);
    late.models.setSpawns(spawns);
    late.models.update(CENTER);
    late.models.dispose();
    pending.forEach((resolve) => resolve());
    await flush();
    expect(late.models.shownCount).toBe(0);
  });
});
