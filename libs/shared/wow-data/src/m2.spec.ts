import { M2Blend, m2Path, m2SkinPath, parseM2 } from './m2';

const mocks = vi.hoisted(() => ({
  vertices: new ArrayBuffer(0),
  skin: {} as Record<string, unknown>,
}));

vi.mock('@wowserhq/format', () => ({
  M2_VERTEX_SHADER: { VERTEX_T1: 0, VERTEX_T2: 1, VERTEX_ENV: 2, VERTEX_T1_T2: 3, VERTEX_T1_ENV: 4, VERTEX_ENV_T2: 5, VERTEX_ENV_ENV: 6 },
  M2Model: class {
    get vertices(): ArrayBuffer {
      return mocks.vertices;
    }
    load(): this {
      return this;
    }
  },
  M2SkinProfile: class {
    load(): Record<string, unknown> {
      return mocks.skin;
    }
  },
}));

/** One 48-byte M2 vertex: position, bone weights/indices, normal, two uv sets. */
function vertexBuffer(vertices: { pos: number[]; normal: number[]; uv: number[] }[]): ArrayBuffer {
  const buffer = new ArrayBuffer(vertices.length * 48);
  const view = new DataView(buffer);
  vertices.forEach((vertex, i) => {
    vertex.pos.forEach((v, j) => view.setFloat32(i * 48 + j * 4, v, true));
    vertex.normal.forEach((v, j) => view.setFloat32(i * 48 + 20 + j * 4, v, true));
    vertex.uv.forEach((v, j) => view.setFloat32(i * 48 + 32 + j * 4, v, true));
  });
  return buffer;
}

const batch = (overrides: Record<string, unknown> = {}) => ({
  vertexShader: 0,
  skinSection: { indexStart: 0, indexCount: 3 },
  textures: [{ component: 0, filename: 'World\\Tree.blp' }],
  material: { blend: 1, flags: 0x4 },
  ...overrides,
});

describe('m2', () => {
  it('maps model and skin paths', () => {
    expect(m2Path('World\\Tree.mdx')).toBe('World\\Tree.m2');
    expect(m2Path('World\\Tree.MDL')).toBe('World\\Tree.m2');
    expect(m2Path('World\\Tree.M2')).toBe('World\\Tree.m2');
    expect(m2SkinPath('World\\Tree.mdx')).toBe('World\\Tree00.skin');
  });

  it('builds the skin vertices in scene axes and keeps the drawable batches', () => {
    mocks.vertices = vertexBuffer([
      { pos: [9, 9, 9], normal: [0, 0, 1], uv: [0, 0] },
      { pos: [1, 2, 3], normal: [1, 0, 0], uv: [0.25, 0.75] },
    ]);
    mocks.skin = {
      vertices: new Uint16Array([1, 0]),
      indices: new Uint16Array([0, 1, 0]),
      batches: [
        batch(),
        batch({ textures: [{ component: 11, filename: '' }], material: { blend: 0, flags: 0x1 } }),
        batch({ textures: [] }),
        batch({ vertexShader: 2 }),
        batch({ skinSection: { indexStart: 3, indexCount: 0 } }),
      ],
    };
    const mesh = parseM2(new Uint8Array(1), new Uint8Array(1));

    expect(Array.from(mesh.positions)).toEqual([-2, 3, -1, -9, 9, -9]);
    expect(Array.from(mesh.normals)).toEqual([-0, 0, -1, -0, 1, -0]);
    expect(Array.from(mesh.uvs)).toEqual([0.25, 0.75, 0, 0]);
    expect(Array.from(mesh.indices)).toEqual([0, 1, 0]);
    expect(mesh.batches).toEqual([
      { start: 0, count: 3, texture: 'World\\Tree.blp', textureType: 0, blend: M2Blend.AlphaKey, twoSided: true, unlit: false },
      { start: 0, count: 3, texture: undefined, textureType: 11, blend: M2Blend.Opaque, twoSided: false, unlit: true },
      { start: 0, count: 3, texture: undefined, textureType: 0, blend: M2Blend.AlphaKey, twoSided: true, unlit: false },
    ]);
  });
});
