import { runParseJob } from './parse-jobs';

const mocks = vi.hoisted(() => ({
  parseAdt: vi.fn().mockReturnValue({ chunks: [{ position: [1, 2, 3] }], wmos: [], doodads: [] }),
  parseLiquids: vi.fn().mockReturnValue(['liquid']),
  decodeBlp: vi.fn().mockReturnValue('rgba'),
  decodeBlpForGpu: vi.fn().mockReturnValue('gpu'),
  parseM2: vi.fn().mockReturnValue('m2'),
  buildTerrainMesh: vi.fn().mockReturnValue('terrain'),
  buildTerrainChunkMeshes: vi.fn().mockReturnValue(['chunk']),
  parseWmoRoot: vi.fn().mockReturnValue('root'),
  parseWmoGroup: vi.fn().mockReturnValue({ group: 1 }),
  parseWmoDoodads: vi.fn().mockReturnValue('doodads'),
  parseWmoGroupCollision: vi.fn().mockReturnValue('collision'),
}));
vi.mock('./formats', () => ({ parseAdt: mocks.parseAdt, decodeBlp: mocks.decodeBlp, decodeBlpForGpu: mocks.decodeBlpForGpu }));
vi.mock('./liquid', () => ({ parseLiquids: mocks.parseLiquids }));
vi.mock('./m2', () => ({ parseM2: mocks.parseM2 }));
vi.mock('./terrain-mesh', () => ({ buildTerrainMesh: mocks.buildTerrainMesh, buildTerrainChunkMeshes: mocks.buildTerrainChunkMeshes }));
vi.mock('./wmo', () => ({ parseWmoRoot: mocks.parseWmoRoot, parseWmoGroup: mocks.parseWmoGroup, parseWmoDoodads: mocks.parseWmoDoodads }));
vi.mock('./collision', () => ({ parseWmoGroupCollision: mocks.parseWmoGroupCollision }));

describe('runParseJob', () => {
  const bytes = new Uint8Array([1]);

  it('runs each kind of job with its parser', () => {
    expect(runParseJob({ kind: 'adt', bytes, depth: 8 })).toEqual({
      chunks: [{ position: [1, 2, 3] }],
      wmos: [],
      doodads: [],
      liquids: ['liquid'],
    });
    expect(mocks.parseAdt).toHaveBeenCalledWith(bytes, 8);
    expect(mocks.parseLiquids).toHaveBeenCalledWith(bytes, [[1, 2, 3]]);
    expect(runParseJob({ kind: 'terrain', tile: { tx: 1, ty: 2 }, chunks: [] })).toBe('terrain');
    expect(runParseJob({ kind: 'terrainDetail', chunks: [] })).toEqual(['chunk']);
    expect(runParseJob({ kind: 'm2', model: bytes, skin: bytes })).toBe('m2');
    expect(runParseJob({ kind: 'wmoRoot', bytes })).toBe('root');
    expect(runParseJob({ kind: 'wmoGroup', bytes, rootFlags: 3, indoor: true })).toEqual({ group: 1, collision: 'collision' });
    expect(mocks.parseWmoGroup).toHaveBeenCalledWith(bytes, 3, true);
    expect(runParseJob({ kind: 'wmoDoodads', bytes })).toBe('doodads');
    expect(runParseJob({ kind: 'blp', bytes })).toBe('rgba');
    expect(runParseJob({ kind: 'blpGpu', bytes })).toBe('gpu');
  });
});
