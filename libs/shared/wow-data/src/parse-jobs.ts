import { CollisionMesh, parseWmoGroupCollision } from './collision';
import { TileCoord } from './coords';
import { decodeBlp, decodeBlpForGpu, GpuTexture, LayerSplatDepth, parseAdt, ParsedAdt, RgbaImage } from './formats';
import { LiquidMesh, parseLiquids } from './liquid';
import { M2Mesh, parseM2 } from './m2';
import { buildTerrainChunkMeshes, buildTerrainMesh, TerrainChunk, TerrainChunkMesh, TerrainMeshData } from './terrain-mesh';
import { parseWmoDoodads, parseWmoGroup, parseWmoRoot, WmoDoodads, WmoGroupMesh, WmoMaterialInfo } from './wmo';

/** The heavy parsing work, as plain data in and out, so it can run in a background worker. */
export type ParseJob =
  | { kind: 'adt'; bytes: Uint8Array; depth: LayerSplatDepth }
  | { kind: 'terrain'; tile: TileCoord; chunks: TerrainChunk[] }
  | { kind: 'terrainDetail'; chunks: TerrainChunk[] }
  | { kind: 'm2'; model: Uint8Array; skin: Uint8Array }
  | { kind: 'wmoRoot'; bytes: Uint8Array }
  | { kind: 'wmoGroup'; bytes: Uint8Array; rootFlags: number; indoor: boolean }
  | { kind: 'wmoDoodads'; bytes: Uint8Array }
  | { kind: 'blp'; bytes: Uint8Array }
  | { kind: 'blpGpu'; bytes: Uint8Array };

/** What each job gives back. */
export interface ParseResults {
  adt: ParsedAdt & { liquids: LiquidMesh[] };
  terrain: TerrainMeshData;
  terrainDetail: TerrainChunkMesh[];
  m2: M2Mesh;
  wmoRoot: { materials: WmoMaterialInfo[]; groups: { indoor: boolean }[]; flags: number };
  wmoGroup: WmoGroupMesh & { collision: CollisionMesh };
  wmoDoodads: WmoDoodads;
  blp: RgbaImage;
  blpGpu: GpuTexture;
}

/** Runs a job (in the worker, or right here when there's none). */
export function runParseJob(job: ParseJob): ParseResults[ParseJob['kind']] {
  switch (job.kind) {
    case 'adt': {
      const parsed = parseAdt(job.bytes, job.depth);
      return {
        ...parsed,
        liquids: parseLiquids(
          job.bytes,
          parsed.chunks.map((chunk) => chunk.position),
        ),
      };
    }
    case 'terrain':
      return buildTerrainMesh(job.tile, job.chunks);
    case 'terrainDetail':
      return buildTerrainChunkMeshes(job.chunks);
    case 'm2':
      return parseM2(job.model, job.skin);
    case 'wmoRoot':
      return parseWmoRoot(job.bytes);
    case 'wmoGroup':
      return { ...parseWmoGroup(job.bytes, job.rootFlags, job.indoor), collision: parseWmoGroupCollision(job.bytes) };
    case 'wmoDoodads':
      return parseWmoDoodads(job.bytes);
    case 'blp':
      return decodeBlp(job.bytes);
    case 'blpGpu':
      return decodeBlpForGpu(job.bytes);
  }
}
