import {
  buildTerrainChunkMeshes,
  buildTerrainMesh,
  CHUNK_VERTEX_COUNT,
  TerrainChunk,
  TerrainDetail,
  TerrainMeshData,
  TileCoord,
} from '@keira/shared/wow-data';

function flatChunks(height: number, tile: TileCoord): TerrainChunk[] {
  const origin = { x: (32 - tile.ty) * (1600 / 3), y: (32 - tile.tx) * (1600 / 3) };
  const chunks: TerrainChunk[] = [];
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      chunks.push({
        position: [origin.x - (row * 100) / 3, origin.y - (col * 100) / 3, height],
        vertexHeights: new Float32Array(CHUNK_VERTEX_COUNT),
        holes: 0,
        layers: [{ texture: 'base.blp' }, { texture: 'second.blp', splat: new Uint8Array(64 * 64) }],
      });
    }
  }
  return chunks;
}

/** A flat low-detail tile at the given height. */
export function flatTile(height = 50, tile: TileCoord = { tx: 32, ty: 48 }): TerrainMeshData {
  return buildTerrainMesh(tile, flatChunks(height, tile));
}

/** A flat textured tile (two layers per chunk) with an optional liquid surface. */
export function flatDetail(height = 50, tile: TileCoord = { tx: 32, ty: 48 }, liquids: TerrainDetail['liquids'] = []): TerrainDetail {
  return { chunks: buildTerrainChunkMeshes(flatChunks(height, tile)), liquids };
}
