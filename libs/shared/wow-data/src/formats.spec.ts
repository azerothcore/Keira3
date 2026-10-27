import { decodeBlp, parseAdt, parseAdtChunks, parseWdt, toArrayBuffer } from './formats';

const mocks = vi.hoisted(() => ({
  chunks: [] as {
    position: number[];
    vertexHeights: Float32Array;
    vertexNormals: Int8Array;
    holes: number;
    areaId: number;
    layers: { texture: string; splat: Uint8Array | null; effectId: number }[];
  }[],
  available: new Uint8Array(64 * 64),
  image: { width: 2, height: 1, data: [1, 2, 3, 4, 5, 6, 7, 8] },
  getImage: vi.fn(),
  depth: 0,
  objDefs: [] as unknown[],
  doodadDefs: [] as unknown[],
}));

vi.mock('@wowserhq/format', () => ({
  BLP_IMAGE_FORMAT: { IMAGE_ABGR8888: 2 },
  MapArea: class {
    constructor(readonly depth: number) {
      mocks.depth = depth;
    }
    load(): { chunks: typeof mocks.chunks; objDefs: unknown[]; doodadDefs: unknown[] } {
      return { chunks: mocks.chunks, objDefs: mocks.objDefs, doodadDefs: mocks.doodadDefs };
    }
  },
  Map: class {
    load(): { availableAreas: Uint8Array; layerSplatDepth: number } {
      return { availableAreas: mocks.available, layerSplatDepth: 8 };
    }
  },
  Blp: class {
    load(): { getImage: typeof mocks.getImage } {
      return { getImage: mocks.getImage };
    }
  },
}));

describe('formats', () => {
  it('extracts terrain chunks from an ADT', () => {
    const heights = new Float32Array(145);
    const normals = new Int8Array(145 * 3);
    const splat = new Uint8Array(4096);
    mocks.chunks = [
      {
        position: [1, 2, 3],
        vertexHeights: heights,
        vertexNormals: normals,
        holes: 4,
        areaId: 12,
        layers: [
          { texture: 'Tileset\\A.blp', splat: null, effectId: 0 },
          { texture: 'Tileset\\B.blp', splat, effectId: 3 },
        ],
      },
    ];
    expect(parseAdtChunks(new Uint8Array(), 4)).toEqual([
      {
        position: [1, 2, 3],
        vertexHeights: heights,
        vertexNormals: normals,
        holes: 4,
        layers: [
          { texture: 'Tileset\\A.blp', splat: null },
          { texture: 'Tileset\\B.blp', splat },
        ],
      },
    ]);
    expect(mocks.depth).toBe(4);
  });

  it('lists the buildings and doodads placed by an ADT', () => {
    mocks.chunks = [];
    mocks.objDefs = [{ id: 7, name: 'Abbey.wmo', position: [1, 2, 3], rotation: [0, 0, 0, 1] }];
    mocks.doodadDefs = [{ id: 8, name: 'Tree.mdx', position: [4, 5, 6], rotation: [0, 0, 0, 1], scale: 2048 }];
    expect(parseAdt(new Uint8Array(), 8)).toEqual({
      chunks: [],
      wmos: [{ uniqueId: 7, path: 'Abbey.wmo', position: [1, 2, 3], rotation: [0, 0, 0, 1], scale: 1, doodadSet: 0 }],
      doodads: [{ uniqueId: 8, path: 'Tree.mdx', position: [4, 5, 6], rotation: [0, 0, 0, 1], scale: 2 }],
    });
    // the doodad set comes from the raw MODF entry of the building
    const modf = new Uint8Array(8 + 64);
    const view = new DataView(modf.buffer);
    modf.set([...'FDOM'].map((c) => c.charCodeAt(0)));
    view.setUint32(4, 64, true);
    view.setUint32(8 + 4, 7, true);
    view.setUint16(8 + 58, 3, true);
    expect(parseAdt(modf, 8).wmos[0].doodadSet).toBe(3);
    mocks.objDefs = [];
    mocks.doodadDefs = [];
  });

  it('lists the tiles flagged in a WDT and its alpha map depth', () => {
    mocks.available.fill(0);
    mocks.available[48 * 64 + 32] = 1;
    mocks.available[0] = 1;
    expect(parseWdt(new Uint8Array())).toEqual({
      tiles: [
        { tx: 0, ty: 0 },
        { tx: 32, ty: 48 },
      ],
      layerSplatDepth: 8,
    });
  });

  it('decodes the top mip level of a BLP as RGBA', () => {
    mocks.getImage.mockReturnValue(mocks.image);
    const image = decodeBlp(new Uint8Array());
    expect(mocks.getImage).toHaveBeenCalledWith(0, 2);
    expect(image).toEqual({ width: 2, height: 1, data: Uint8Array.from(mocks.image.data) });
  });

  it('passes whole buffers through and copies views', () => {
    const whole = new Uint8Array([1, 2, 3]);
    expect(toArrayBuffer(whole)).toBe(whole.buffer);
    const view = whole.subarray(1);
    const copy = toArrayBuffer(view);
    expect(copy).not.toBe(whole.buffer);
    expect(Array.from(new Uint8Array(copy))).toEqual([2, 3]);
  });
});
