import { UNIT_SIZE } from './coords';
import { findChunk, liquidKind, parseLiquids } from './liquid';

/** Builds a minimal ADT: an MVER chunk, then an MH2O chunk with the given instances for chunk 0 (and chunk 1). */
function adtWithLiquids(
  instances: {
    type?: number;
    format?: number;
    min?: number;
    x?: number;
    y?: number;
    w: number;
    h: number;
    exists?: number[];
    heights?: number[];
  }[],
  chunkIndex = 0,
): Uint8Array {
  const headerSize = 256 * 12;
  const cursor = headerSize + instances.length * 24;
  const instanceBytes = new DataView(new ArrayBuffer(instances.length * 24));
  const extra: number[] = [];
  instances.forEach((inst, i) => {
    let existsOffset = 0;
    let vertexOffset = 0;
    if (inst.exists) {
      existsOffset = cursor + extra.length;
      extra.push(...inst.exists);
    }
    if (inst.heights) {
      while ((cursor + extra.length) % 4) {
        extra.push(0);
      }
      vertexOffset = cursor + extra.length;
      const f = new DataView(new ArrayBuffer(inst.heights.length * 4));
      inst.heights.forEach((h, k) => f.setFloat32(k * 4, h, true));
      extra.push(...new Uint8Array(f.buffer));
    }
    const o = i * 24;
    instanceBytes.setUint16(o, inst.type ?? 1, true);
    instanceBytes.setUint16(o + 2, inst.format ?? 0, true);
    instanceBytes.setFloat32(o + 4, inst.min ?? 50, true);
    instanceBytes.setFloat32(o + 8, inst.min ?? 50, true);
    instanceBytes.setUint8(o + 12, inst.x ?? 0);
    instanceBytes.setUint8(o + 13, inst.y ?? 0);
    instanceBytes.setUint8(o + 14, inst.w);
    instanceBytes.setUint8(o + 15, inst.h);
    instanceBytes.setUint32(o + 16, existsOffset, true);
    instanceBytes.setUint32(o + 20, vertexOffset, true);
  });
  const header = new DataView(new ArrayBuffer(headerSize));
  header.setUint32(chunkIndex * 12, headerSize, true);
  header.setUint32(chunkIndex * 12 + 4, instances.length, true);
  const body = new Uint8Array([...new Uint8Array(header.buffer), ...new Uint8Array(instanceBytes.buffer), ...extra]);

  const chunk = (magic: string, data: Uint8Array): number[] => {
    const size = new DataView(new ArrayBuffer(4));
    size.setUint32(0, data.length, true);
    return [...new TextEncoder().encode(magic.split('').reverse().join('')), ...new Uint8Array(size.buffer), ...data];
  };
  return Uint8Array.from([...chunk('MVER', new Uint8Array([18, 0, 0, 0])), ...chunk('MH2O', body)]);
}

describe('liquid', () => {
  const positions = [
    [100, 200, 0],
    [100, 166, 0],
  ];

  it('classifies liquid types', () => {
    expect([1, 2, 3, 4, 5, 8, 11].map(liquidKind)).toEqual(['water', 'ocean', 'magma', 'slime', 'water', 'slime', 'magma']);
    expect([13, 14, 15, 17, 19, 20, 99, 0].map(liquidKind)).toEqual([
      'water',
      'ocean',
      'magma',
      'magma',
      'slime',
      'slime',
      'water',
      'water',
    ]);
  });

  it('finds top-level chunks', () => {
    const bytes = adtWithLiquids([]);
    expect(findChunk(bytes, 'MVER')).toEqual({ offset: 8, size: 4 });
    expect(findChunk(bytes, 'MH2O')?.offset).toBe(20);
    expect(findChunk(bytes, 'MCNK')).toBeUndefined();
  });

  it('returns nothing without MH2O', () => {
    expect(parseLiquids(Uint8Array.from([0x52, 0x45, 0x56, 0x4d, 0, 0, 0, 0]), positions)).toEqual([]);
  });

  it('builds a flat surface over a sub-rectangle of a chunk', () => {
    const [mesh] = parseLiquids(adtWithLiquids([{ type: 3, x: 2, y: 1, w: 2, h: 1, min: 42 }]), positions);
    expect(mesh.type).toBe(3);
    expect(mesh.kind).toBe('magma');
    expect(mesh.positions.length).toBe(3 * 2 * 3);
    // first vertex: column 2, row 1 of chunk 0
    expect(mesh.positions[0]).toBeCloseTo(-(200 - 2 * UNIT_SIZE));
    expect(mesh.positions[1]).toBe(42);
    expect(mesh.positions[2]).toBeCloseTo(-(100 - 1 * UNIT_SIZE));
    expect(Array.from(mesh.indices)).toEqual([0, 3, 1, 1, 3, 4, 1, 4, 2, 2, 4, 5]);
  });

  it('uses per-vertex heights, the exists bitmap, and skips empty instances', () => {
    const meshes = parseLiquids(
      adtWithLiquids(
        [
          { w: 2, h: 1, exists: [0b10], heights: [1, 2, 3, 4, 5, 6] },
          { w: 1, h: 1, exists: [0] },
          { format: 2, w: 1, h: 1, min: 7, heights: [99, 99, 99, 99] },
        ],
        1,
      ),
      positions,
    );
    expect(meshes.length).toBe(2);
    expect(meshes[0].indices.length).toBe(6);
    expect(meshes[0].positions[4]).toBe(2);
    expect(meshes[0].positions[0]).toBeCloseTo(-166);
    // format 2 (depth only) ignores the heights
    expect(meshes[1].positions[1]).toBe(7);
  });

  it('ignores chunks beyond the known chunk positions', () => {
    expect(parseLiquids(adtWithLiquids([{ w: 1, h: 1 }], 1), [positions[0]])).toEqual([]);
  });
});
