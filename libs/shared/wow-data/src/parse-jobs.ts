import { CollisionMesh, parseWmoGroupCollision } from './collision';
import { TileCoord } from './coords';
import { decodeBlp, decodeBlpForGpu, GpuTexture, LayerSplatDepth, parseAdt, ParsedAdt, RgbaImage } from './formats';
import { LiquidMesh, parseLiquids } from './liquid';
import { M2Mesh, parseM2, parseM2SkeletonFiles } from './m2';
import { M2SequenceRef, M2Skeleton } from './m2-animation';
import { buildTerrainChunkMeshes, buildTerrainMesh, TerrainChunk, TerrainChunkMesh, TerrainMeshData } from './terrain-mesh';
import { neighbourParts, Ring, traceRegions, TraceRegion } from './zone-tracer';
import { parseWmoDoodads, parseWmoGroup, parseWmoRoot, WmoDoodads, WmoGroupMesh, WmoMaterialInfo } from './wmo';

/** The heavy parsing work, as plain data in and out, so it can run in a background worker. */
export type ParseJob =
  | { kind: 'adt'; bytes: Uint8Array; depth: LayerSplatDepth }
  | { kind: 'terrain'; tile: TileCoord; chunks: TerrainChunk[] }
  | { kind: 'terrainDetail'; chunks: TerrainChunk[] }
  | { kind: 'm2'; model: Uint8Array; skin: Uint8Array }
  | { kind: 'm2Skeleton'; model: Uint8Array; skin: Uint8Array; refs: M2SequenceRef[]; anims: Map<number, Uint8Array> }
  | { kind: 'wmoRoot'; bytes: Uint8Array }
  | { kind: 'wmoGroup'; bytes: Uint8Array; rootFlags: number; indoor: boolean }
  | { kind: 'wmoDoodads'; bytes: Uint8Array }
  | { kind: 'blp'; bytes: Uint8Array }
  | { kind: 'blpGpu'; bytes: Uint8Array }
  | { kind: 'trace'; regions: TraceRegion[] }
  | {
      kind: 'neighbours';
      frame: [number, number, number, number];
      own: Ring[];
      subs: Ring[][];
      others: [string, Ring[]][];
    };

/** What each job gives back. */
export interface ParseResults {
  adt: ParsedAdt & { liquids: LiquidMesh[] };
  terrain: TerrainMeshData;
  terrainDetail: TerrainChunkMesh[];
  m2: M2Mesh;
  m2Skeleton: M2Skeleton | undefined;
  wmoRoot: { materials: WmoMaterialInfo[]; groups: { indoor: boolean }[]; flags: number };
  wmoGroup: WmoGroupMesh & { collision: CollisionMesh };
  wmoDoodads: WmoDoodads;
  blp: RgbaImage;
  blpGpu: GpuTexture;
  trace: [string, Ring[]][];
  neighbours: [string, Ring[]][];
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
    case 'm2Skeleton':
      return parseM2SkeletonFiles(job.model, job.skin, job.refs, job.anims);
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
    case 'trace':
      return [...traceRegions(job.regions)];
    case 'neighbours':
      return [...neighbourParts(job.frame, job.own, job.subs, new Map(job.others))];
  }
}

/**
 * The buffers of the typed arrays in a result (each once), handed over with it instead of copied: the window then
 * gets a parsed tile without spending time copying it. Empty ones are left out: there's nothing to save, and they
 * may be shared constants (like `EMPTY_COLLISION`'s) that, handed over once, would be gone for every later result.
 */
export function transferables(value: unknown, found = new Set<ArrayBuffer>()): ArrayBuffer[] {
  if (ArrayBuffer.isView(value)) {
    if (value.buffer instanceof ArrayBuffer && value.buffer.byteLength > 0) {
      found.add(value.buffer);
    }
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((child) => transferables(child, found));
  }
  return [...found];
}
