import { TileCoord, tileKey, tilesAround, VmapGroup, VmapSpawn, WorldPosition, worldToTile } from '@keira/shared/wow-data';
import { BufferAttribute, BufferGeometry, DoubleSide, Group, Matrix4, Mesh, MeshBasicMaterial } from 'three';
import { SERVER_COLLISION_LAYER } from './collision-object';
import { vmapToWorld } from './server-geometry';

/** What the server collision layer needs from `WowClientService`. */
export interface VmapSource {
  getVmapTile(mapId: number, tile: TileCoord): Promise<VmapSpawn[] | undefined>;
  getVmapModel(name: string): Promise<VmapGroup[] | undefined>;
}

export interface WorldVmapsOptions {
  enabled: boolean;
  /** Tiles loaded around the camera target in each direction. */
  radius: number;
}

/**
 * The server's collision (vmaps) around the camera target: the models of each vmap tile, placed like the server
 * places them, for the line of sight (and drawn in orange with the hitboxes). Models placed on several tiles are added
 * once.
 */
export class WorldVmaps {
  private mapId?: number;
  private generation = 0;
  private options: WorldVmapsOptions = { enabled: false, radius: 1 };
  private centerTile?: TileCoord;
  /** Spawn ids placed by each tile read (empty when the tile has no vmtile). */
  private readonly tiles = new Map<string, number[]>();
  private readonly spawns = new Map<number, { mesh: Mesh; tiles: Set<string> }>();
  private readonly geometries = new Map<string, Promise<BufferGeometry | undefined>>();
  private readonly loading = new Set<string>();
  private readonly material = new MeshBasicMaterial({
    color: 0xff9f1c,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
    side: DoubleSide,
  });
  /** A vmtile was found for this map: the server's collision is the one to use. */
  private found = false;

  constructor(
    private readonly source: VmapSource,
    private readonly group: Group,
    /** The server's collision changed: of one tile (its key), or any. */
    private readonly onChange: (key?: string) => void,
  ) {}

  /** The server's collision is loaded for this map (it has vmaps). */
  get active(): boolean {
    return this.found;
  }

  get pendingCount(): number {
    return this.loading.size;
  }

  get spawnCount(): number {
    return this.spawns.size;
  }

  setMap(mapId: number | undefined): void {
    if (mapId === this.mapId) {
      return;
    }
    this.mapId = mapId;
    this.clear();
  }

  configure(options: WorldVmapsOptions): void {
    if (options.enabled === this.options.enabled && options.radius === this.options.radius) {
      return;
    }
    this.options = { ...options };
    if (!options.enabled) {
      this.clear();
    }
  }

  async update(center: WorldPosition): Promise<void> {
    const mapId = this.mapId;
    if (mapId === undefined || !this.options.enabled) {
      return;
    }
    const generation = this.generation;
    this.centerTile = worldToTile(center.x, center.y);
    for (const key of [...this.tiles.keys()]) {
      if (!this.isNear(key)) {
        this.removeTile(key);
      }
    }
    for (const tile of tilesAround(this.centerTile, this.options.radius)) {
      const key = tileKey(tile);
      if (this.tiles.has(key) || this.loading.has(key)) {
        continue;
      }
      this.loading.add(key);
      try {
        const spawns = (await this.source.getVmapTile(mapId, tile)) ?? [];
        if (generation !== this.generation) {
          return;
        }
        const placed: number[] = [];
        for (const spawn of spawns) {
          const geometry = await this.geometryOf(spawn.name);
          if (generation !== this.generation) {
            return;
          }
          if (geometry) {
            this.place(key, spawn, geometry);
            placed.push(spawn.id);
          }
        }
        if (!this.isNear(key)) {
          placed.forEach((id) => this.release(id, key));
          continue;
        }
        this.found ||= spawns.length > 0;
        this.tiles.set(key, placed);
        this.onChange(key);
      } finally {
        this.loading.delete(key);
      }
    }
  }

  dispose(): void {
    this.clear();
    this.material.dispose();
  }

  /** One geometry per model, in its own axes (all groups merged), shared by its spawns. */
  private geometryOf(name: string): Promise<BufferGeometry | undefined> {
    let geometry = this.geometries.get(name);
    if (!geometry) {
      geometry = this.source.getVmapModel(name).then((groups) => {
        const withTriangles = (groups ?? []).filter((group) => group.indices.length > 0);
        if (withTriangles.length === 0) {
          return undefined;
        }
        // (copied in place: spreading a big model's vertices into a call overflows the stack)
        const positions = new Float32Array(withTriangles.reduce((sum, group) => sum + group.vertices.length, 0));
        const indices = new Uint32Array(withTriangles.reduce((sum, group) => sum + group.indices.length, 0));
        let [vertex, index] = [0, 0];
        for (const group of withTriangles) {
          const offset = vertex / 3;
          positions.set(group.vertices, vertex);
          for (let i = 0; i < group.indices.length; i++) {
            indices[index + i] = group.indices[i] + offset;
          }
          vertex += group.vertices.length;
          index += group.indices.length;
        }
        const merged = new BufferGeometry();
        merged.setAttribute('position', new BufferAttribute(positions, 3));
        merged.setIndex(new BufferAttribute(indices, 1));
        merged.computeBoundingSphere();
        return merged;
      });
      this.geometries.set(name, geometry);
    }
    return geometry;
  }

  private place(key: string, spawn: VmapSpawn, geometry: BufferGeometry): void {
    const existing = this.spawns.get(spawn.id);
    if (existing) {
      existing.tiles.add(key);
      return;
    }
    // the placement is affine: from where the origin and the axes land (server → scene: (−y, z, −x))
    const toWorld = vmapToWorld(spawn);
    const scene = (x: number, y: number, z: number) => {
      const [wx, wy, wz] = toWorld(x, y, z);
      return [-wy, wz, -wx];
    };
    const origin = scene(0, 0, 0);
    const [ax, ay, az] = [scene(1, 0, 0), scene(0, 1, 0), scene(0, 0, 1)].map((p) => p.map((v, i) => v - origin[i]));
    const mesh = new Mesh(geometry, this.material);
    mesh.name = `vmap:${spawn.name}`;
    mesh.layers.set(SERVER_COLLISION_LAYER);
    mesh.matrixAutoUpdate = false;
    mesh.matrix.copy(
      new Matrix4().set(ax[0], ay[0], az[0], origin[0], ax[1], ay[1], az[1], origin[1], ax[2], ay[2], az[2], origin[2], 0, 0, 0, 1),
    );
    mesh.updateMatrixWorld(true);
    this.group.add(mesh);
    this.spawns.set(spawn.id, { mesh, tiles: new Set([key]) });
  }

  /** The spawn isn't placed by that tile any more; removed when no tile places it. */
  private release(id: number, key: string): void {
    const spawn = this.spawns.get(id) as { mesh: Mesh; tiles: Set<string> };
    spawn.tiles.delete(key);
    if (spawn.tiles.size === 0) {
      this.group.remove(spawn.mesh);
      this.spawns.delete(id);
    }
  }

  private removeTile(key: string): void {
    (this.tiles.get(key) as number[]).forEach((id) => this.release(id, key));
    this.tiles.delete(key);
    this.onChange();
  }

  private clear(): void {
    this.generation++;
    this.loading.clear();
    this.found = false;
    this.group.clear();
    this.spawns.clear();
    this.tiles.clear();
    this.geometries.forEach((geometry) => void geometry.then((g) => g?.dispose()));
    this.geometries.clear();
    this.onChange();
  }

  private isNear(key: string): boolean {
    const [tx, ty] = key.split('_').map(Number);
    const center = this.centerTile as TileCoord;
    return Math.max(Math.abs(tx - center.tx), Math.abs(ty - center.ty)) <= this.options.radius;
  }
}
