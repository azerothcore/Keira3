import { UNIT_SIZE } from './coords';

export type LiquidKind = 'water' | 'ocean' | 'magma' | 'slime';

/** Surface of one MH2O liquid instance, in scene coordinates. */
export interface LiquidMesh {
  /** LiquidType.dbc id. */
  type: number;
  kind: LiquidKind;
  positions: Float32Array;
  indices: Uint16Array;
}

const INSTANCE_SIZE = 24;
const CHUNK_HEADER_SIZE = 12;
const CHUNK_COUNT = 256;

/** LiquidType.dbc (3.3.5a): 1..12 cycle water/ocean/magma/slime (normal, slow, fast); then WMO and special liquids. */
export function liquidKind(type: number): LiquidKind {
  if (type >= 1 && type <= 12) {
    return (['water', 'ocean', 'magma', 'slime'] as const)[(type - 1) % 4];
  }
  const special: Record<number, LiquidKind> = { 14: 'ocean', 15: 'magma', 17: 'magma', 19: 'slime', 20: 'slime' };
  return special[type] ?? 'water';
}

/** Finds a top-level chunk of an ADT/WDT by its (readable) magic, e.g. `MH2O`. */
export function findChunk(bytes: Uint8Array, magic: string): { offset: number; size: number } | undefined {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const reversed = magic.split('').reverse().join('');
  let offset = 0;
  while (offset + 8 <= bytes.length) {
    const id = String.fromCharCode(...bytes.subarray(offset, offset + 4));
    const size = view.getUint32(offset + 4, true);
    if (id === reversed) {
      return { offset: offset + 8, size };
    }
    offset += 8 + size;
  }
  return undefined;
}

/**
 * Reads the MH2O liquids of an ADT (WotLK format). Each chunk can hold several instances covering a sub-rectangle
 * of its 8 × 8 cells (x along columns, y along rows), with optional per-vertex heights and an "exists" bitmap.
 * `chunkPositions[i]` is the NW corner (server x, y, z) of MCNK `i`.
 */
export function parseLiquids(bytes: Uint8Array, chunkPositions: ArrayLike<number>[]): LiquidMesh[] {
  const chunk = findChunk(bytes, 'MH2O');
  if (!chunk) {
    return [];
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const base = chunk.offset;
  const meshes: LiquidMesh[] = [];

  for (let c = 0; c < CHUNK_COUNT && c < chunkPositions.length; c++) {
    const header = base + c * CHUNK_HEADER_SIZE;
    const instancesOffset = view.getUint32(header, true);
    const layerCount = view.getUint32(header + 4, true);
    for (let layer = 0; layer < layerCount; layer++) {
      const at = base + instancesOffset + layer * INSTANCE_SIZE;
      const type = view.getUint16(at, true);
      const vertexFormat = view.getUint16(at + 2, true);
      const minHeight = view.getFloat32(at + 4, true);
      const xOffset = view.getUint8(at + 12);
      const yOffset = view.getUint8(at + 13);
      const width = view.getUint8(at + 14);
      const height = view.getUint8(at + 15);
      const existsOffset = view.getUint32(at + 16, true);
      const vertexOffset = view.getUint32(at + 20, true);

      const vertexCount = (width + 1) * (height + 1);
      // Formats 0, 1 and 3 store float heights first; format 2 (depth only) uses the instance height.
      const hasHeights = vertexOffset !== 0 && vertexFormat !== 2;
      const heightAt = (i: number): number => (hasHeights ? view.getFloat32(base + vertexOffset + i * 4, true) : minHeight);
      const exists = (cell: number): boolean =>
        existsOffset === 0 || (view.getUint8(base + existsOffset + (cell >> 3)) & (1 << (cell & 7))) !== 0;

      const [chunkX, chunkY] = [chunkPositions[c][0], chunkPositions[c][1]];
      const positions = new Float32Array(vertexCount * 3);
      for (let row = 0; row <= height; row++) {
        for (let col = 0; col <= width; col++) {
          const i = row * (width + 1) + col;
          const x = chunkX - (yOffset + row) * UNIT_SIZE;
          const y = chunkY - (xOffset + col) * UNIT_SIZE;
          positions.set([-y, heightAt(i), -x], i * 3);
        }
      }
      const indices: number[] = [];
      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          if (!exists(row * width + col)) {
            continue;
          }
          const tl = row * (width + 1) + col;
          const tr = tl + 1;
          const bl = tl + width + 1;
          const br = bl + 1;
          indices.push(tl, bl, tr, tr, bl, br);
        }
      }
      if (indices.length) {
        meshes.push({ type, kind: liquidKind(type), positions, indices: Uint16Array.from(indices) });
      }
    }
  }
  return meshes;
}
