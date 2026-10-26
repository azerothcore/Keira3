import { CHUNK_SIZE, TILE_SIZE, TileCoord, UNIT_SIZE, tileOrigin } from './coords';

/** A texture layer of a chunk: tileset texture path and, except for the base layer, its 64 × 64 alpha map. */
export interface TerrainLayer {
  texture: string;
  splat?: Uint8Array | null;
}

/** One MCNK of an ADT: NW corner in server coordinates, the 145 MCVT heights (relative to position[2]) and hole bits. */
export interface TerrainChunk {
  position: ArrayLike<number>;
  vertexHeights: ArrayLike<number>;
  holes: number;
  /** MCNR normals, 3 signed bytes per vertex in server axes (x north, y west, z up). */
  vertexNormals?: ArrayLike<number>;
  layers?: TerrainLayer[];
}

/** One chunk of textured terrain in scene coordinates, ready to be drawn with its texture layers blended. */
export interface TerrainChunkMesh {
  positions: Float32Array;
  normals: Float32Array;
  /** Tileset texture coordinates: textures repeat 8 times across a chunk. */
  layerUvs: Float32Array;
  /** Alpha map coordinates: 0..1 across the chunk. */
  splatUvs: Float32Array;
  indices: Uint16Array;
  /** Up to 4 tileset texture paths, base layer first. */
  textures: string[];
  /** 64 × 64 RGBA alpha map: R, G, B = alpha of layers 2, 3, 4; undefined for single-layer chunks. */
  splat?: Uint8Array;
}

export const SPLAT_SIZE = 64;
const LAYER_REPEAT = 8;

/** Geometry of a whole ADT tile in scene coordinates, with UVs spanning the tile (for its minimap texture). */
export interface TerrainMeshData {
  tile: TileCoord;
  positions: Float32Array;
  uvs: Float32Array;
  indices: Uint32Array;
  minHeight: number;
  maxHeight: number;
}

const OUTER = 9;
const INNER = 8;
const ROW_STRIDE = OUTER + INNER;
export const CHUNK_VERTEX_COUNT = OUTER * OUTER + INNER * INNER;

const outerIndex = (row: number, col: number): number => row * ROW_STRIDE + col;
const innerIndex = (row: number, col: number): number => row * ROW_STRIDE + OUTER + col;

/** Low-resolution MCNK holes: 16 bits, one per 2 × 2 block of the chunk's 8 × 8 cells, column-major. */
export function isHole(holes: number, row: number, col: number): boolean {
  return (holes & (1 << ((col >> 1) * 4 + (row >> 1)))) !== 0;
}

/** Vertex `i` of a chunk: its row/column offsets (in cells) from the chunk's north-west corner. */
function vertexCell(i: number): { row: number; col: number } {
  const row = Math.floor(i / ROW_STRIDE);
  const inRow = i % ROW_STRIDE;
  return inRow >= OUTER ? { row: row + 0.5, col: inRow - OUTER + 0.5 } : { row, col: inRow };
}

function chunkIndices(holes: number, base: number, out: number[]): void {
  for (let row = 0; row < INNER; row++) {
    for (let col = 0; col < INNER; col++) {
      if (isHole(holes, row, col)) {
        continue;
      }
      const c = base + innerIndex(row, col);
      const tl = base + outerIndex(row, col);
      const tr = base + outerIndex(row, col + 1);
      const bl = base + outerIndex(row + 1, col);
      const br = base + outerIndex(row + 1, col + 1);
      out.push(c, tr, tl, c, br, tr, c, bl, br, c, tl, bl);
    }
  }
}

/** Merges the alpha maps of layers 2..4 into the R, G, B channels of one RGBA image. */
export function mergeSplats(layers: TerrainLayer[]): Uint8Array | undefined {
  if (layers.length < 2) {
    return undefined;
  }
  const merged = new Uint8Array(SPLAT_SIZE * SPLAT_SIZE * 4);
  for (let i = 0; i < SPLAT_SIZE * SPLAT_SIZE; i++) {
    merged[i * 4 + 3] = 255;
  }
  layers.slice(1, 4).forEach((layer, channel) => {
    const splat = layer.splat;
    for (let i = 0; splat && i < SPLAT_SIZE * SPLAT_SIZE; i++) {
      merged[i * 4 + channel] = splat[i];
    }
  });
  return merged;
}

/**
 * Builds one textured mesh per chunk. Normals come from MCNR when present (converted to scene axes), heights and
 * holes as in {@link buildTerrainMesh}; texture coordinates follow the client: tileset textures repeat 8 times per
 * chunk along (rows, columns), alpha maps cover the chunk once along (columns, rows).
 */
export function buildTerrainChunkMeshes(chunks: TerrainChunk[]): TerrainChunkMesh[] {
  return chunks.map((chunk) => {
    const positions = new Float32Array(CHUNK_VERTEX_COUNT * 3);
    const normals = new Float32Array(CHUNK_VERTEX_COUNT * 3);
    const layerUvs = new Float32Array(CHUNK_VERTEX_COUNT * 2);
    const splatUvs = new Float32Array(CHUNK_VERTEX_COUNT * 2);
    for (let i = 0; i < CHUNK_VERTEX_COUNT; i++) {
      const { row, col } = vertexCell(i);
      const x = chunk.position[0] - row * UNIT_SIZE;
      const y = chunk.position[1] - col * UNIT_SIZE;
      positions.set([-y, chunk.position[2] + (chunk.vertexHeights[i] ?? 0), -x], i * 3);

      const n = chunk.vertexNormals;
      const [nx, ny, nz] = n ? [n[i * 3] ?? 0, n[i * 3 + 1] ?? 0, n[i * 3 + 2] ?? 0] : [0, 0, 1];
      const length = Math.hypot(nx, ny, nz);
      // Missing or zero normals point straight up.
      normals.set(length ? [-ny / length, nz / length, -nx / length] : [0, 1, 0], i * 3);

      const rowDistance = row * UNIT_SIZE;
      const colDistance = col * UNIT_SIZE;
      layerUvs.set([(rowDistance * LAYER_REPEAT) / CHUNK_SIZE, (colDistance * LAYER_REPEAT) / CHUNK_SIZE], i * 2);
      splatUvs.set([colDistance / CHUNK_SIZE, rowDistance / CHUNK_SIZE], i * 2);
    }
    const indices: number[] = [];
    chunkIndices(chunk.holes, 0, indices);
    const layers = (chunk.layers ?? []).slice(0, 4);
    return {
      positions,
      normals,
      layerUvs,
      splatUvs,
      indices: Uint16Array.from(indices),
      textures: layers.map((layer) => layer.texture),
      splat: mergeSplats(layers),
    };
  });
}

/**
 * Builds the terrain of one tile. Each MCVT stores 17 interleaved rows (9 outer vertices, then 8 inner ones at
 * cell centres); rows step south (−x) and columns step west→east (−y). Each cell becomes 4 triangles around its
 * centre, wound counter-clockwise when seen from above.
 */
export function buildTerrainMesh(tile: TileCoord, chunks: TerrainChunk[]): TerrainMeshData {
  const origin = tileOrigin(tile);
  const positions = new Float32Array(chunks.length * CHUNK_VERTEX_COUNT * 3);
  const uvs = new Float32Array(chunks.length * CHUNK_VERTEX_COUNT * 2);
  const indices: number[] = [];
  let minHeight = Infinity;
  let maxHeight = -Infinity;

  chunks.forEach((chunk, chunkIndex) => {
    const base = chunkIndex * CHUNK_VERTEX_COUNT;
    const [chunkX, chunkY, chunkZ] = [chunk.position[0], chunk.position[1], chunk.position[2]];

    for (let i = 0; i < CHUNK_VERTEX_COUNT; i++) {
      const row = Math.floor(i / ROW_STRIDE);
      const inRow = i % ROW_STRIDE;
      const inner = inRow >= OUTER;
      const offset = inner ? 0.5 : 0;
      const col = inner ? inRow - OUTER : inRow;

      const x = chunkX - (row + offset) * UNIT_SIZE;
      const y = chunkY - (col + offset) * UNIT_SIZE;
      const z = chunkZ + (chunk.vertexHeights[i] ?? 0);
      minHeight = Math.min(minHeight, z);
      maxHeight = Math.max(maxHeight, z);

      const p = (base + i) * 3;
      positions[p] = -y;
      positions[p + 1] = z;
      positions[p + 2] = -x;
      const t = (base + i) * 2;
      uvs[t] = (origin.y - y) / TILE_SIZE;
      uvs[t + 1] = (origin.x - x) / TILE_SIZE;
    }

    chunkIndices(chunk.holes, base, indices);
  });

  return {
    tile,
    positions,
    uvs,
    indices: Uint32Array.from(indices),
    minHeight: chunks.length ? minHeight : 0,
    maxHeight: chunks.length ? maxHeight : 0,
  };
}
