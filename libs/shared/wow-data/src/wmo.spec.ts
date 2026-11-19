import { ModelPlacement, parseWmoDoodads, parseWmoGroup, parseWmoRoot, toSceneAxes, wmoDoodadPlacements, wmoGroupPath } from './wmo';

/** A chunk as stored in WoW files: reversed magic, size, data. */
const chunk = (magic: string, data: Uint8Array): Uint8Array => {
  const out = new Uint8Array(8 + data.length);
  out.set([...magic].reverse().map((c) => c.charCodeAt(0)));
  new DataView(out.buffer).setUint32(4, data.length, true);
  out.set(data, 8);
  return out;
};
const concat = (...parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  parts.forEach((p) => (out.set(p, at), (at += p.length)));
  return out;
};

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
        { texture: 'a.blp', twoSided: true, unlit: true, blend: 0 },
        { texture: undefined, twoSided: false, unlit: false, blend: 0 },
      ],
      groups: [{ indoor: true }, { indoor: false }],
    });

    // blend modes come from the MOMT chunk itself (here after a MVER chunk)
    const bytes = new Uint8Array(12 + 8 + 2 * 64);
    const view = new DataView(bytes.buffer);
    bytes.set(
      [...'REVM'].map((c) => c.charCodeAt(0)),
      0,
    );
    view.setUint32(4, 4, true);
    bytes.set(
      [...'TMOM'].map((c) => c.charCodeAt(0)),
      12,
    );
    view.setUint32(16, 128, true);
    view.setUint32(20 + 8, 1, true);
    view.setUint32(20 + 64 + 8, 2, true);
    expect(parseWmoRoot(bytes).materials.map((m) => m.blend)).toEqual([1, 2]);
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

  it('reads the doodads and doodad sets of a root file', () => {
    const mods = new Uint8Array(64);
    const sets = new DataView(mods.buffer);
    sets.setUint32(20, 0, true);
    sets.setUint32(24, 1, true);
    sets.setUint32(32 + 20, 1, true);
    sets.setUint32(32 + 24, 1, true);
    const modn = new Uint8Array(
      [...'Barrel.mdx']
        .map((c) => c.charCodeAt(0))
        .concat(
          [0],
          [...'Table.mdx'].map((c) => c.charCodeAt(0)),
        ),
    );
    const modd = new Uint8Array(80);
    const doodads = new DataView(modd.buffer);
    doodads.setUint32(0, 0x01000000, true); // name offset 0 (flags in the high byte)
    [1, 2, 3, 0, 0, 0, 1, 1.5].forEach((value, i) => doodads.setFloat32(4 + i * 4, value, true));
    doodads.setUint32(40, 11, true); // the unterminated last name
    doodads.setUint32(40 + 4 + 7 * 4, 0, true);
    const bytes = concat(chunk('MVER', new Uint8Array(4)), chunk('MODS', mods), chunk('MODN', modn), chunk('MODD', modd));
    const parsed = parseWmoDoodads(bytes);
    expect(parsed.sets).toEqual([
      { start: 0, count: 1 },
      { start: 1, count: 1 },
    ]);
    expect(parsed.doodads[0]).toEqual({ path: 'Barrel.mdx', position: [1, 2, 3], rotation: [0, 0, 0, 1], scale: 1.5 });
    expect(parsed.doodads[1].path).toBe('Table.mdx');

    // a name past the end, and a root without doodads
    doodads.setUint32(40, 999, true);
    expect(parseWmoDoodads(concat(chunk('MODN', modn), chunk('MODD', modd))).doodads[1].path).toBe('');
    expect(parseWmoDoodads(chunk('MODD', modd)).doodads[0].path).toBe('');
    expect(parseWmoDoodads(new Uint8Array())).toEqual({ sets: [], doodads: [] });
  });

  it('places the default and the chosen doodad set of a building in the world', () => {
    const info = {
      sets: [
        { start: 0, count: 1 },
        { start: 1, count: 2 },
        { start: 3, count: 5 },
      ],
      doodads: [
        { path: 'Barrel.mdx', position: [1, 0, 0], rotation: [0, 0, 0, 1], scale: 1 },
        { path: 'Table.mdx', position: [0, 2, 0], rotation: [0, 0, 0, 1], scale: 2 },
        { path: 'Chair.mdx', position: [0, 0, 3], rotation: [0, 0, 0, 1], scale: 1 },
        { path: 'Lamp.mdx', position: [0, 0, 0], rotation: [0, 0, 0, 1], scale: 1 },
      ],
    };
    // a quarter turn around z (up): x → y
    const s = Math.SQRT1_2;
    const building: ModelPlacement = { uniqueId: 7, path: 'Inn.wmo', position: [100, 200, 50], rotation: [0, 0, s, s], scale: 1 };
    const round = (values: number[]) => values.map((v) => Math.round(v * 1000) / 1000 + 0);

    const defaults = wmoDoodadPlacements(building, info);
    expect(defaults).toHaveLength(1);
    expect(defaults[0].uniqueId).toBe(-700001);
    expect(round(defaults[0].position)).toEqual([100, 201, 50]);
    expect(round(defaults[0].rotation)).toEqual(round([0, 0, s, s]));

    const furnished = wmoDoodadPlacements({ ...building, doodadSet: 1, scale: 2 }, info);
    expect(furnished.map((p) => p.path)).toEqual(['Barrel.mdx', 'Table.mdx', 'Chair.mdx']);
    expect(round(furnished[1].position)).toEqual([96, 200, 50]);
    expect(round(furnished[2].position)).toEqual([100, 200, 56]);
    expect(furnished[1].scale).toBe(4);
    // a set that runs past the doodads, or doesn't exist
    expect(wmoDoodadPlacements({ ...building, doodadSet: 2 }, info).map((p) => p.path)).toEqual(['Barrel.mdx', 'Lamp.mdx']);
    expect(wmoDoodadPlacements({ ...building, doodadSet: 9 }, info)).toHaveLength(1);
    expect(wmoDoodadPlacements(building, { sets: [], doodads: [] })).toEqual([]);
  });
});
