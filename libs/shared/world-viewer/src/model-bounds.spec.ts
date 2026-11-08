import { M2Mesh } from '@keira/shared/wow-data';
import { spawnModelBox } from './model-bounds';
import { SpawnModelSource } from './spawn-models';

const mesh = (positions: number[], collision: number[] = []): M2Mesh =>
  ({
    positions: Float32Array.from(positions),
    collision: { positions: Float32Array.from(collision), indices: new Uint16Array(0) },
  }) as M2Mesh;

describe('spawnModelBox', () => {
  const setup = (model?: M2Mesh) => {
    const source = {
      getCreatureDisplay: vi.fn().mockResolvedValue({ model: 'bear.m2', scale: 2, textures: {} }),
      getGameObjectDisplay: vi.fn().mockResolvedValue('bank.m2'),
      getM2: vi.fn().mockResolvedValue(model),
    } satisfies SpawnModelSource;
    return { source };
  };

  it('boxes a gameobject by its collision, in model axes (x forward, y left, z up), times its scale', async () => {
    // scene (−y, z, −x): (−1, 0, −2) is model (2, 1, 0); (1, 3, 2) is model (−2, −1, 3)
    const { source } = setup(mesh([9, 9, 9], [-1, 0, -2, 1, 3, 2]));
    expect(await spawnModelBox(source, 'gameobject', 5, 2)).toEqual({ min: [-4, -2, 0], max: [4, 2, 6] });
    expect(source.getGameObjectDisplay).toHaveBeenCalledWith(5);
    expect(source.getM2).toHaveBeenCalledWith('bank.m2');
  });

  it('boxes a model without collision by its mesh, times the display and spawn scales', async () => {
    const { source } = setup(mesh([-1, 0, -2, 1, 3, 2]));
    expect(await spawnModelBox(source, 'creature', 7)).toEqual({ min: [-4, -2, 0], max: [4, 2, 6] });
  });

  it('knows nothing without a display, a model or vertices', async () => {
    const { source } = setup(mesh([]));
    expect(await spawnModelBox(source, 'creature', 7)).toBeUndefined();
    source.getM2.mockResolvedValue(undefined);
    expect(await spawnModelBox(source, 'creature', 7)).toBeUndefined();
    source.getGameObjectDisplay.mockResolvedValue(undefined);
    expect(await spawnModelBox(source, 'gameobject', 7)).toBeUndefined();
    expect(source.getM2).toHaveBeenCalledTimes(2);
  });
});
