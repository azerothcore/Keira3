import { TileCoord } from './coords';

/**
 * A tile of the server's navigation mesh (mmaps/*.mmtile, Detour data): the triangles creatures can walk on, in world
 * scene axes, one colour per triangle corner (by terrain: ground, water, magma, slime).
 */
export interface NavMeshTile {
  positions: Float32Array;
  colors: Float32Array;
}

/** `mmaps/MMMXXYY.mmtile`: map id, then the grid's x and y, which are the ADT tile's second and first numbers. */
export function mmtileName(mapId: number, tile: TileCoord): string {
  const pad = (value: number, size: number) => String(value).padStart(size, '0');
  return `${pad(mapId, 3)}${pad(tile.ty, 2)}${pad(tile.tx, 2)}.mmtile`;
}

/** AzerothCore's MmapTileHeader (magic 'MMAP', versions, size, liquids flag, recast config) before the Detour data. */
const MMAP_HEADER_SIZE = 56;
const MMAP_MAGIC = 0x4d4d4150;
const DETOUR_MAGIC = 0x444e4156; // 'DNAV'
const DETOUR_HEADER_SIZE = 100;
const POLY_SIZE = 32;
/** dtLink with 64-bit polygon references (AzerothCore builds Detour with DT_POLYREF64). */
const LINK_SIZE = 16;
const POLY_DETAIL_SIZE = 12;
const OFF_MESH_CONNECTION = 1;

/** NavTerrain flags of the polygons → colour (RGB 0..1). */
const NAV_WATER = 0x08;
const NAV_SLIME = 0x04;
const NAV_MAGMA = 0x02;
const COLORS = {
  ground: [0.2, 0.85, 0.35],
  water: [0.2, 0.5, 1],
  magma: [1, 0.45, 0.1],
  slime: [0.7, 0.3, 0.9],
};

function colorOf(flags: number): number[] {
  if (flags & NAV_WATER) {
    return COLORS.water;
  }
  if (flags & NAV_MAGMA) {
    return COLORS.magma;
  }
  return flags & NAV_SLIME ? COLORS.slime : COLORS.ground;
}

/** The walkable triangles of an .mmtile file (its detail mesh, which follows the ground closely). */
export function parseMmtile(bytes: Uint8Array): NavMeshTile | undefined {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < MMAP_HEADER_SIZE + DETOUR_HEADER_SIZE || view.getUint32(0, true) !== MMAP_MAGIC) {
    return undefined;
  }
  const h = MMAP_HEADER_SIZE;
  if (view.getUint32(h, true) !== DETOUR_MAGIC) {
    return undefined;
  }
  const int = (offset: number) => view.getInt32(h + offset, true);
  const [polyCount, vertCount, maxLinkCount, detailMeshCount, detailVertCount] = [24, 28, 32, 36, 40].map(int);
  const vertsAt = h + DETOUR_HEADER_SIZE;
  const polysAt = vertsAt + vertCount * 12;
  const linksAt = polysAt + polyCount * POLY_SIZE;
  const detailMeshesAt = linksAt + maxLinkCount * LINK_SIZE;
  const detailVertsAt = detailMeshesAt + detailMeshCount * POLY_DETAIL_SIZE;
  const detailTrisAt = detailVertsAt + detailVertCount * 12;

  const positions: number[] = [];
  const colors: number[] = [];
  // Recast axes are (server y, z, server x); scene axes are (−y, z, −x)
  const pushVertex = (at: number, color: number[]) => {
    positions.push(-view.getFloat32(at, true), view.getFloat32(at + 4, true), -view.getFloat32(at + 8, true));
    colors.push(...color);
  };
  for (let p = 0; p < Math.min(polyCount, detailMeshCount); p++) {
    const poly = polysAt + p * POLY_SIZE;
    if (bytes[poly + 31] >> 6 === OFF_MESH_CONNECTION) {
      continue;
    }
    const polyVerts = bytes[poly + 30];
    const color = colorOf(view.getUint16(poly + 28, true));
    const detail = detailMeshesAt + p * POLY_DETAIL_SIZE;
    const vertBase = view.getUint32(detail, true);
    const triBase = view.getUint32(detail + 4, true);
    const triCount = bytes[detail + 9];
    for (let t = 0; t < triCount; t++) {
      const tri = detailTrisAt + (triBase + t) * 4;
      if (tri + 3 > bytes.length) {
        return undefined;
      }
      for (let k = 0; k < 3; k++) {
        const index = bytes[tri + k];
        const at =
          index < polyVerts
            ? vertsAt + view.getUint16(poly + 4 + index * 2, true) * 12
            : detailVertsAt + (vertBase + index - polyVerts) * 12;
        pushVertex(at, color);
      }
    }
  }
  return { positions: Float32Array.from(positions), colors: Float32Array.from(colors) };
}
