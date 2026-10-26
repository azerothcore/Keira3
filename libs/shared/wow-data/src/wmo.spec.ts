import { parseWmoGroup, parseWmoRoot, toSceneAxes, wmoGroupPath } from './wmo';

const mocks = vi.hoisted(() => ({
  root: {} as Record<string, unknown>,
  group: {} as Record<string, unknown>,
  groupFlags: [] as number[],
  failFirst: false,
}));

vi.mock('@wowserhq/format', () => ({
  MapObj: class {
    load(): Record<string, unknown> {
      return mocks.root;
    }
  },
  MapObjGroup: class {
    constructor(readonly flags: number) {
      mocks.groupFlags.push(flags);
    }
    load(): Record<string, unknown> {
      if (mocks.failFirst && mocks.groupFlags.length === 1) {
        throw new TypeError("Cannot read properties of undefined (reading 'lastVertex')");
      }
      return mocks.group;
    }
  },
}));

describe('wmo', () => {
  beforeEach(() => {
    mocks.groupFlags = [];
    mocks.failFirst = false;
  });

  it('builds group file paths', () => {
    expect(wmoGroupPath('World\\wmo\\Abbey.wmo', 3)).toBe('World\\wmo\\Abbey_003.wmo');
    expect(wmoGroupPath('World\\wmo\\Abbey.WMO', 12)).toBe('World\\wmo\\Abbey_012.wmo');
  });

  it('converts server axes to scene axes', () => {
    expect(Array.from(toSceneAxes([1, 2, 3, 4, 5, 6]))).toEqual([-2, 3, -1, -5, 6, -4]);
  });

  it('reads root materials and indoor groups', () => {
    mocks.root = {
      flags: 1,
      materials: [
        { flags: 0x5, textures: ['a.blp', 'b.blp'] },
        { flags: 0, textures: [] },
      ],
      groupInfo: [{ flags: 0x2000 }, { flags: 0x8 }],
    };
    expect(parseWmoRoot(new Uint8Array(4))).toEqual({
      flags: 1,
      materials: [
        { texture: 'a.blp', twoSided: true, unlit: true },
        { texture: undefined, twoSided: false, unlit: false },
      ],
      groups: [{ indoor: true }, { indoor: false }],
    });
  });

  it('reads group geometry in scene axes, with BGRA vertex colours for indoor groups', () => {
    mocks.group = {
      vertices: new Float32Array([1, 2, 3]),
      normals: new Float32Array([0, 0, 1]),
      textureCoords: new Float32Array([0.5, 0.25]),
      colors: new Uint8Array([255, 128, 0, 255]),
      indices: new Uint16Array([0, 0, 0]),
      batches: [{ indexStart: 0, indexCount: 3, materialIndex: 1 }],
    };
    const group = parseWmoGroup(new Uint8Array(4), 0, true);
    expect(Array.from(group.positions)).toEqual([-2, 3, -1]);
    expect(Array.from(group.normals)).toEqual([-0, 1, -0]);
    expect(Array.from(group.uvs)).toEqual([0.5, 0.25]);
    expect(Array.from(group.colors as Float32Array)).toEqual([0, 128 / 255, 1].map(Math.fround));
    expect(group.batches).toEqual([{ start: 0, count: 3, material: 1 }]);
    expect(group.indoor).toBe(true);

    expect(parseWmoGroup(new Uint8Array(4), 0, false).colors).toBeUndefined();
  });

  it('fills in missing chunks', () => {
    mocks.group = { vertices: new Float32Array([1, 2, 3]), batches: [] };
    const group = parseWmoGroup(new Uint8Array(4), 0, true);
    expect(Array.from(group.normals)).toEqual([-0, 0, -0]);
    expect(Array.from(group.uvs)).toEqual([0, 0]);
    expect(group.colors).toBeUndefined();
    expect(group.indices.length).toBe(0);
  });

  it('retries without the vertex colour fix-up when the parser trips on it', () => {
    mocks.failFirst = true;
    mocks.group = { vertices: new Float32Array(0), batches: [] };
    parseWmoGroup(new Uint8Array(4), 0x1, false);
    expect(mocks.groupFlags).toEqual([0x1, 0x9]);
  });
});
