import { CHUNK_SIZE, TILE_SIZE, tileOrigin, UNIT_SIZE } from './coords';
import {
  buildTerrainChunkMeshes,
  buildTerrainMesh,
  CHUNK_VERTEX_COUNT,
  isHole,
  mergeSplats,
  SPLAT_SIZE,
  TerrainChunk,
} from './terrain-mesh';

describe('terrain-mesh', () => {
  const tile = { tx: 32, ty: 48 };
  const origin = tileOrigin(tile);

  const flatChunk = (height: number, holes = 0, x = origin.x, y = origin.y): TerrainChunk => ({
    position: [x, y, 100],
    vertexHeights: new Float32Array(CHUNK_VERTEX_COUNT).fill(height),
    holes,
  });

  it('detects holes per 2x2 block of cells, row by row', () => {
    expect(isHole(0b1, 0, 0)).toBe(true);
    expect(isHole(0b1, 1, 1)).toBe(true);
    expect(isHole(0b1, 0, 2)).toBe(false);
    expect(isHole(1 << 5, 2, 2)).toBe(true);
    // bit 1 = second block of columns in the first block of rows (east of the NW block)
    expect(isHole(0b10, 0, 2)).toBe(true);
    expect(isHole(0b10, 2, 0)).toBe(false);
  });

  it('merges the alpha maps of layers 2..4 into RGB channels', () => {
    expect(mergeSplats([{ texture: 'a' }])).toBeUndefined();
    const second = new Uint8Array(SPLAT_SIZE * SPLAT_SIZE).fill(10);
    const merged = mergeSplats([{ texture: 'a' }, { texture: 'b', splat: second }, { texture: 'c', splat: null }]) as Uint8Array;
    expect(Array.from(merged.slice(0, 4))).toEqual([10, 0, 0, 255]);
  });

  it('builds textured chunk meshes with client texture coordinates and MCNR normals', () => {
    const normals = new Int8Array(CHUNK_VERTEX_COUNT * 3);
    normals.set([127, 0, 0], 0); // vertex 0 leans north (server +x)
    const chunk: TerrainChunk = {
      position: [origin.x, origin.y, 100],
      vertexHeights: new Float32Array(CHUNK_VERTEX_COUNT).fill(5),
      holes: 0b1,
      vertexNormals: normals,
      layers: [
        { texture: 'base.blp' },
        { texture: 'second.blp', splat: new Uint8Array(SPLAT_SIZE * SPLAT_SIZE) },
        { texture: 'third.blp', splat: new Uint8Array(SPLAT_SIZE * SPLAT_SIZE) },
        { texture: 'fourth.blp', splat: new Uint8Array(SPLAT_SIZE * SPLAT_SIZE) },
        { texture: 'ignored.blp', splat: new Uint8Array(SPLAT_SIZE * SPLAT_SIZE) },
      ],
    };
    const [mesh] = buildTerrainChunkMeshes([chunk]);

    expect(mesh.textures).toEqual(['base.blp', 'second.blp', 'third.blp', 'fourth.blp']);
    expect(mesh.splat?.length).toBe(SPLAT_SIZE * SPLAT_SIZE * 4);
    expect(mesh.indices.length).toBe((64 - 4) * 4 * 3);
    expect(Array.from(mesh.positions.slice(0, 3))).toEqual([-origin.y, 105, -origin.x].map(Math.fround));
    // north in server space is −z in the scene
    expect(Array.from(mesh.normals.slice(0, 3))).toEqual([-0, 0, -1]);
    // vertex 1: zero normal → straight up
    expect(Array.from(mesh.normals.slice(3, 6))).toEqual([0, 1, 0]);
    // last outer vertex: far corner of the chunk → layer uv (8, 8), splat uv (1, 1)
    const last = 8 * 17 + 8;
    expect(mesh.layerUvs[last * 2]).toBeCloseTo(8);
    expect(mesh.layerUvs[last * 2 + 1]).toBeCloseTo(8);
    expect(mesh.splatUvs[last * 2]).toBeCloseTo(1);
    // first inner vertex: half a cell in, splat (col, row)
    expect(mesh.splatUvs[9 * 2]).toBeCloseTo(UNIT_SIZE / 2 / CHUNK_SIZE);
  });

  it('builds untextured chunks without normals or layers', () => {
    const [mesh] = buildTerrainChunkMeshes([{ position: [0, 0, 0], vertexHeights: [], holes: 0, vertexNormals: [] }]);
    expect(mesh.textures).toEqual([]);
    expect(mesh.splat).toBeUndefined();
    expect(mesh.positions[1]).toBe(0);
    expect(Array.from(mesh.normals.slice(0, 3))).toEqual([0, 1, 0]);
    const [plain] = buildTerrainChunkMeshes([{ position: [0, 0, 0], vertexHeights: [], holes: 0 }]);
    expect(plain.normals[1]).toBe(1);
  });

  it('builds 4 triangles per cell, in scene coordinates, with tile-relative UVs', () => {
    const mesh = buildTerrainMesh(tile, [flatChunk(5)]);

    expect(mesh.tile).toBe(tile);
    expect(mesh.positions.length).toBe(CHUNK_VERTEX_COUNT * 3);
    expect(mesh.indices.length).toBe(8 * 8 * 4 * 3);
    expect(mesh.minHeight).toBe(105);
    expect(mesh.maxHeight).toBe(105);

    // vertex 0 = NW outer corner
    expect(Array.from(mesh.positions.slice(0, 3))).toEqual([-origin.y, 105, -origin.x].map(Math.fround));
    // vertex 1 = one unit east (−y): scene x grows
    expect(mesh.positions[3]).toBeCloseTo(-origin.y + UNIT_SIZE, 3);
    // vertex 9 = first inner vertex, half a unit south-east
    expect(mesh.positions[9 * 3]).toBeCloseTo(-origin.y + UNIT_SIZE / 2, 3);
    expect(mesh.positions[9 * 3 + 2]).toBeCloseTo(-origin.x + UNIT_SIZE / 2, 3);
    expect(mesh.uvs[0]).toBe(0);
    expect(mesh.uvs[1]).toBe(0);
    expect(mesh.uvs[2]).toBeCloseTo(UNIT_SIZE / TILE_SIZE);
  });

  it('winds triangles counter-clockwise seen from above (normals point up)', () => {
    const { positions, indices } = buildTerrainMesh(tile, [flatChunk(0)]);
    for (let t = 0; t < 4; t++) {
      const [a, b, c] = [indices[t * 3], indices[t * 3 + 1], indices[t * 3 + 2]].map((i) => [
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2],
      ]);
      const ab = [b[0] - a[0], b[2] - a[2]];
      const ac = [c[0] - a[0], c[2] - a[2]];
      // y component of (b − a) × (c − a)
      expect(ab[1] * ac[0] - ab[0] * ac[1]).toBeGreaterThan(0);
    }
  });

  it('skips cells under holes and treats missing heights as 0', () => {
    const chunk: TerrainChunk = { position: [origin.x, origin.y, 10], vertexHeights: [], holes: 0xffff };
    const mesh = buildTerrainMesh(tile, [chunk, flatChunk(1, 0b1)]);
    expect(mesh.indices.length).toBe((64 - 4) * 4 * 3);
    expect(mesh.minHeight).toBe(10);
    expect(mesh.maxHeight).toBe(101);
  });

  it('handles an empty tile', () => {
    const mesh = buildTerrainMesh(tile, []);
    expect(mesh.positions.length).toBe(0);
    expect(mesh.minHeight).toBe(0);
    expect(mesh.maxHeight).toBe(0);
  });
});
