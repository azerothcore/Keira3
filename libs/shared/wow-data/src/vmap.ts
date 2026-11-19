import { TileCoord } from './coords';

/** A model placed in a vmap tile (`ModelSpawn`), in vmap axes (x = 32 tiles − server x, y = 32 tiles − server y). */
export interface VmapSpawn {
  flags: number;
  id: number;
  position: [number, number, number];
  /** Rotation in degrees, as stored. */
  rotation: [number, number, number];
  scale: number;
  /** Model name: its file is `<name>.vmo`. */
  name: string;
}

/** A liquid surface of a vmap model group (`WmoLiquid`): a grid of heights, with flags per square. */
export interface VmapLiquid {
  tilesX: number;
  tilesY: number;
  corner: [number, number, number];
  type: number;
  heights: Float32Array;
  flags: Uint8Array;
}

/** A group of a vmap model (`GroupModel`): its collision triangles, and its liquid if any. */
export interface VmapGroup {
  vertices: Float32Array;
  indices: Uint32Array;
  liquid?: VmapLiquid;
}

const VMAP_MAGIC = 'VMAP_4.8';
/** `MOD_HAS_BOUND`: the spawn stores its bounding box. */
const HAS_BOUND = 0x4;

/** `vmaps/MMM_XX_YY.vmtile`: map id, then the ADT tile's numbers, as the mmaps generator loads them. */
export function vmapTileName(mapId: number, tile: TileCoord): string {
  const pad = (value: number, size: number) => String(value).padStart(size, '0');
  return `${pad(mapId, 3)}_${pad(tile.tx, 2)}_${pad(tile.ty, 2)}.vmtile`;
}

class Reader {
  private readonly view: DataView;
  at = 0;

  constructor(private readonly bytes: Uint8Array) {
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  get left(): number {
    return this.bytes.length - this.at;
  }

  text(length: number): string {
    const value = String.fromCharCode(...this.bytes.subarray(this.at, this.at + length));
    this.at += length;
    return value;
  }

  u32(): number {
    const value = this.view.getUint32(this.at, true);
    this.at += 4;
    return value;
  }

  u16(): number {
    const value = this.view.getUint16(this.at, true);
    this.at += 2;
    return value;
  }

  f32(): number {
    const value = this.view.getFloat32(this.at, true);
    this.at += 4;
    return value;
  }

  vector(): [number, number, number] {
    return [this.f32(), this.f32(), this.f32()];
  }

  floats(count: number): Float32Array {
    const values = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      values[i] = this.f32();
    }
    return values;
  }

  u32s(count: number): Uint32Array {
    const values = new Uint32Array(count);
    for (let i = 0; i < count; i++) {
      values[i] = this.u32();
    }
    return values;
  }

  skip(length: number): void {
    this.at += length;
  }
}

/** The models placed in a .vmtile (every model that overlaps the tile, whole). */
export function parseVmapTile(bytes: Uint8Array): VmapSpawn[] {
  const reader = new Reader(bytes);
  if (bytes.length < 12 || reader.text(8) !== VMAP_MAGIC) {
    return [];
  }
  const count = reader.u32();
  const spawns: VmapSpawn[] = [];
  for (let i = 0; i < count && reader.left > 0; i++) {
    const flags = reader.u32();
    reader.u16(); // adt id
    const id = reader.u32();
    const position = reader.vector();
    const rotation = reader.vector();
    const scale = reader.f32();
    if (flags & HAS_BOUND) {
      reader.skip(24);
    }
    // M2 names end with a NUL, which isn't part of the file name
    const name = reader.text(reader.u32()).replace(/\0+$/, '');
    reader.u32(); // index in the map's tree
    spawns.push({ flags, id, position, rotation, scale, name });
  }
  return spawns;
}

/** The groups of a .vmo model file. */
export function parseVmapModel(bytes: Uint8Array): VmapGroup[] {
  const reader = new Reader(bytes);
  if (bytes.length < 24 || reader.text(8) !== VMAP_MAGIC || reader.text(4) !== 'WMOD') {
    return [];
  }
  reader.skip(8); // chunk size, root WMO id
  if (reader.left < 8 || reader.text(4) !== 'GMOD') {
    return [];
  }
  const groups: VmapGroup[] = [];
  const count = reader.u32();
  for (let g = 0; g < count; g++) {
    reader.skip(24 + 4 + 4); // bounds, MOGP flags, group WMO id
    reader.skip(4 + 4); // 'VERT', chunk size
    const vertexCount = reader.u32();
    if (vertexCount === 0) {
      // a group without collision ends here
      groups.push({ vertices: new Float32Array(0), indices: new Uint32Array(0) });
      continue;
    }
    const vertices = reader.floats(vertexCount * 3);
    reader.skip(4 + 4); // 'TRIM', chunk size
    const indices = reader.u32s(reader.u32() * 3);
    reader.skip(4); // 'MBIH'
    reader.skip(24); // tree bounds
    reader.skip(reader.u32() * 4); // tree nodes
    reader.skip(reader.u32() * 4); // tree objects
    reader.skip(4); // 'LIQU'
    const group: VmapGroup = { vertices, indices };
    if (reader.u32() > 0) {
      const tilesX = reader.u32();
      const tilesY = reader.u32();
      const corner = reader.vector();
      const type = reader.u32();
      const heights = reader.floats(tilesX && tilesY ? (tilesX + 1) * (tilesY + 1) : 1);
      const flags = bytes.slice(reader.at, reader.at + tilesX * tilesY);
      reader.skip(tilesX * tilesY);
      group.liquid = { tilesX, tilesY, corner, type, heights, flags };
    }
    groups.push(group);
  }
  return groups;
}
