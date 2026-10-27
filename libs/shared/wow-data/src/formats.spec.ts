import { decodeBlp, decodeBlpForGpu, parseAdt, parseAdtChunks, parseWdt, toArrayBuffer } from './formats';

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
  getImages: vi.fn(),
  blp: { colorFormat: 2, alphaSize: 0, width: 8, height: 4 },
  depth: 0,
  objDefs: [] as unknown[],
  doodadDefs: [] as unknown[],
}));

vi.mock('@wowserhq/format', () => ({
  BLP_IMAGE_FORMAT: { IMAGE_ABGR8888: 2, IMAGE_DXT1: 4, IMAGE_DXT3: 5, IMAGE_DXT5: 6 },
  BLP_COLOR_FORMAT: { COLOR_PAL: 1, COLOR_DXT: 2 },
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
    load(): object {
      return { getImage: mocks.getImage, getImages: mocks.getImages, ...mocks.blp };
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

  it('reads the one building of a WDT (dungeons), placed in server axes', () => {
    mocks.available.fill(0);
    const chunk = (magic: string, body: number[]) => {
      const header = new Uint8Array(8);
      header.set(Array.from(magic.split('').reverse().join(''), (c) => c.charCodeAt(0)));
      new DataView(header.buffer).setUint32(4, body.length, true);
      return [...header, ...body];
    };
    const name = Array.from('World\\wmo\\Dungeon.wmo\0', (c) => c.charCodeAt(0));
    const modf = new Uint8Array(64);
    const view = new DataView(modf.buffer);
    view.setUint32(4, 99, true);
    [100, 50, 200, 0, 0, 0, 90, 10, 190, 110, 60, 210].forEach((value, i) => view.setFloat32(8 + i * 4, value, true));
    view.setUint16(58, 2, true);
    const wdt = parseWdt(Uint8Array.from([...chunk('MWMO', name), ...chunk('MODF', Array.from(modf))]));
    const corner = 32 * (1600 / 3);
    expect(wdt.wmo).toEqual({
      uniqueId: 99,
      path: 'World\\wmo\\Dungeon.wmo',
      position: [corner - 200, corner - 100, 50],
      rotation: [0, 0, expect.closeTo(1), expect.closeTo(0)],
      scale: 1,
      doodadSet: 2,
    });
    expect(wdt.wmoBounds).toEqual({ minX: corner - 210, maxX: corner - 190, minY: corner - 110, maxY: corner - 90, minZ: 10, maxZ: 60 });
    // placed at 0, 0 (as dungeons are): in the middle of the map, with its extents
    const centred = new Uint8Array(64);
    const centredView = new DataView(centred.buffer);
    [0, 0, 0, 0, 0, 0, -115, -140, -570, 1150, 890, 380].forEach((value, i) => centredView.setFloat32(8 + i * 4, value, true));
    const dungeon = parseWdt(Uint8Array.from([...chunk('MWMO', name), ...chunk('MODF', Array.from(centred))]));
    expect(dungeon.wmo?.position).toEqual([0, 0, 0]);
    expect(dungeon.wmoBounds).toEqual({ minX: -380, maxX: 570, minY: -1150, maxY: 115, minZ: -140, maxZ: 890 });
    // a name without its ending zero; no placement, or an empty name: no building
    expect(parseWdt(Uint8Array.from([...chunk('MWMO', [65]), ...chunk('MODF', Array.from(modf))])).wmo?.path).toBe('A');
    expect(parseWdt(Uint8Array.from(chunk('MWMO', name))).wmo).toBeUndefined();
    expect(parseWdt(Uint8Array.from([...chunk('MWMO', []), ...chunk('MODF', Array.from(modf))])).wmo).toBeUndefined();
    expect(parseWdt(Uint8Array.from([...chunk('MWMO', name), ...chunk('MODF', [1, 2])])).wmo).toBeUndefined();
  });

  it('keeps the DXT mip levels of a BLP as they are, and decodes the others', () => {
    const level = (width: number, height: number, format: number) => ({ width, height, format, data: [1, 2] });
    mocks.getImages.mockReturnValue([level(8, 4, 4), level(4, 2, 4), level(0, 0, 4)]);
    const dxt = (format: number, alphaSize = 0) => {
      mocks.getImage.mockReturnValue(level(8, 4, format));
      mocks.blp = { colorFormat: 2, alphaSize, width: 8, height: 4 };
      return decodeBlpForGpu(new Uint8Array());
    };
    expect(dxt(4)).toEqual({
      format: 'dxt1',
      width: 8,
      height: 4,
      mips: [
        { width: 8, height: 4, data: Uint8Array.from([1, 2]) },
        { width: 4, height: 2, data: Uint8Array.from([1, 2]) },
      ],
    });
    expect(dxt(4, 1).format).toBe('dxt1a');
    expect(dxt(5).format).toBe('dxt3');
    expect(dxt(6).format).toBe('dxt5');
    // a palette: decoded
    mocks.blp = { colorFormat: 1, alphaSize: 8, width: 2, height: 1 };
    mocks.getImage.mockReturnValue(mocks.image);
    expect(decodeBlpForGpu(new Uint8Array())).toEqual({ format: 'rgba', width: 2, height: 1, data: Uint8Array.from(mocks.image.data) });
    expect(mocks.getImage).toHaveBeenLastCalledWith(0, 2);
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
