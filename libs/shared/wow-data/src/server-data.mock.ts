/** Little-endian byte writer for test files. */
class Writer {
  private readonly bytes: number[] = [];

  get length(): number {
    return this.bytes.length;
  }

  u8(...values: number[]): this {
    values.forEach((value) => this.bytes.push(value & 0xff));
    return this;
  }

  u16(...values: number[]): this {
    values.forEach((value) => this.u8(value, value >> 8));
    return this;
  }

  u32(...values: number[]): this {
    values.forEach((value) => this.u8(value, value >> 8, value >> 16, value >> 24));
    return this;
  }

  f32(...values: number[]): this {
    values.forEach((value) => this.u8(...new Uint8Array(new Float32Array([value]).buffer)));
    return this;
  }

  text(value: string): this {
    return this.u8(...Array.from(value, (c) => c.charCodeAt(0)));
  }

  patch32(at: number, value: number): void {
    [0, 8, 16, 24].forEach((shift, i) => (this.bytes[at + i] = (value >> shift) & 0xff));
  }

  build(): Uint8Array {
    return Uint8Array.from(this.bytes);
  }
}

export interface ServerMapOptions {
  /** 'float' (default), 'int16', 'int8' or 'none' (no terrain). */
  heights?: 'float' | 'int16' | 'int8' | 'none';
  height?: number;
  holes?: boolean;
  /** Liquid: with types per chunk and heights for a 2 × 2 corner area, or a single level. */
  liquid?: 'typed' | 'level';
  version?: number;
}

/** A .map file (version 9): a flat terrain at `height`, optional holes and liquid. */
export function buildServerMap(options: ServerMapOptions = {}): Uint8Array {
  const { heights = 'float', height = 10, holes = false, liquid, version = 9 } = options;
  const w = new Writer().text('MAPS').u32(version, 0);
  const header = w.length;
  w.u32(0, 0, 0, 0, 0, 0, 0, 0); // area, height, liquid, holes (offset, size)
  const heightOffset = w.length;
  const count = 129 * 129 + 128 * 128;
  const flags = { float: 0, int16: 2, int8: 4, none: 1 }[heights];
  w.text('MHGT')
    .u32(flags)
    .f32(height - 1, height + 1);
  if (heights === 'float') {
    for (let i = 0; i < count; i++) {
      w.f32(height);
    }
  } else if (heights === 'int16') {
    for (let i = 0; i < count; i++) {
      w.u16(32767);
    }
  } else if (heights === 'int8') {
    for (let i = 0; i < count; i++) {
      w.u8(127);
    }
  }
  let liquidOffset = 0;
  if (liquid) {
    liquidOffset = w.length;
    if (liquid === 'typed') {
      w.text('MLIQ').u8(0, 0).u16(0).u8(0, 0, 2, 2).f32(0);
      for (let i = 0; i < 256; i++) {
        w.u16(1);
      }
      for (let i = 0; i < 256; i++) {
        w.u8(i === 0 ? 4 : 1);
      }
      w.f32(height + 2, height + 2, height + 2, height + 2);
    } else {
      w.text('MLIQ')
        .u8(3, 1)
        .u16(0)
        .u8(0, 0, 0, 0)
        .f32(height + 5);
    }
  }
  let holesOffset = 0;
  if (holes) {
    holesOffset = w.length;
    for (let i = 0; i < 256; i++) {
      w.u16(i === 0 ? 0xffff : 0);
    }
  }
  w.patch32(header + 8, heightOffset);
  w.patch32(header + 16, liquidOffset);
  w.patch32(header + 24, holesOffset);
  w.patch32(header + 28, holes ? 512 : 0);
  return w.build();
}

export interface VmapSpawnOptions {
  name: string;
  id?: number;
  flags?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/** A .vmtile file placing the given models. */
export function buildVmapTile(spawns: VmapSpawnOptions[]): Uint8Array {
  const w = new Writer().text('VMAP_4.8').u32(spawns.length);
  spawns.forEach((spawn, i) => {
    const flags = spawn.flags ?? 0;
    w.u32(flags)
      .u16(0)
      .u32(spawn.id ?? i + 1);
    w.f32(...(spawn.position ?? [0, 0, 0]), ...(spawn.rotation ?? [0, 0, 0]), spawn.scale ?? 1);
    if (flags & 4) {
      w.f32(0, 0, 0, 1, 1, 1);
    }
    w.u32(spawn.name.length).text(spawn.name).u32(i);
  });
  return w.build();
}

export interface VmapGroupOptions {
  vertices: number[];
  indices: number[];
  liquid?: { tilesX: number; tilesY: number; type: number; heights: number[]; flags: number[] };
}

/** A .vmo model file with the given groups. */
export function buildVmapModel(groups: VmapGroupOptions[]): Uint8Array {
  const w = new Writer().text('VMAP_4.8').text('WMOD').u32(8, 0).text('GMOD').u32(groups.length);
  for (const group of groups) {
    w.f32(0, 0, 0, 1, 1, 1).u32(0, 0);
    w.text('VERT')
      .u32(0, group.vertices.length / 3)
      .f32(...group.vertices);
    if (group.vertices.length === 0) {
      continue;
    }
    w.text('TRIM')
      .u32(0, group.indices.length / 3)
      .u32(...group.indices);
    w.text('MBIH').f32(0, 0, 0, 1, 1, 1).u32(1, 0).u32(1, 0);
    w.text('LIQU');
    const liquid = group.liquid;
    if (!liquid) {
      w.u32(0);
      continue;
    }
    w.u32(1)
      .u32(liquid.tilesX, liquid.tilesY)
      .f32(0, 0, 0)
      .u32(liquid.type)
      .f32(...liquid.heights)
      .u8(...liquid.flags);
  }
  return w.build();
}
