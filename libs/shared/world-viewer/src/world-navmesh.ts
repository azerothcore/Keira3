import { NavMeshTile, TileCoord, tileKey, tilesAround, WorldPosition, worldToTile } from '@keira/shared/wow-data';
import { BufferAttribute, BufferGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial } from 'three';

/** What the navigation mesh layer needs from `WowClientService`. */
export interface NavMeshSource {
  getNavMeshTile(directory: string, tile: TileCoord): Promise<NavMeshTile | undefined>;
}

export interface WorldNavMeshOptions {
  show: boolean;
  /** Tiles drawn around the camera target in each direction. */
  radius: number;
}

/**
 * Draws the server's navigation mesh (mmaps) around the camera target: where creatures can walk, coloured by terrain,
 * see-through over the ground with its triangle edges.
 */
export class WorldNavMesh {
  private directory?: string;
  private generation = 0;
  private options: WorldNavMeshOptions = { show: false, radius: 1 };
  private centerTile?: TileCoord;
  private readonly tiles = new Map<string, Group>();
  /** What was read for each tile around: its mesh, or null when there's no mmtile there. */
  private readonly read = new Map<string, NavMeshTile | null>();
  private readonly loading = new Set<string>();
  private readonly fill = new MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    side: DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  private readonly edges = new MeshBasicMaterial({ vertexColors: true, wireframe: true, transparent: true, opacity: 0.5 });

  constructor(
    private readonly source: NavMeshSource,
    private readonly group: Group,
    private readonly onChange: () => void,
  ) {}

  /** Tiles still being read. */
  get pendingCount(): number {
    return this.loading.size;
  }

  get loadedTiles(): string[] {
    return [...this.tiles.keys()];
  }

  setMap(directory: string | undefined): void {
    this.directory = directory;
    this.clear();
  }

  configure(options: WorldNavMeshOptions): void {
    if (options.show === this.options.show && options.radius === this.options.radius) {
      return;
    }
    this.options = { ...options };
    if (!options.show) {
      this.clear();
    }
  }

  async update(center: WorldPosition): Promise<void> {
    const directory = this.directory;
    if (!directory || !this.options.show) {
      return;
    }
    const generation = this.generation;
    const centerTile = worldToTile(center.x, center.y);
    this.centerTile = centerTile;
    for (const [key, tile] of [...this.tiles]) {
      if (!this.isNear(key)) {
        this.remove(key, tile);
      }
    }
    for (const key of [...this.read.keys()]) {
      if (!this.isNear(key)) {
        this.read.delete(key);
      }
    }
    for (const tile of tilesAround(centerTile, this.options.radius)) {
      const key = tileKey(tile);
      if (this.read.has(key) || this.loading.has(key)) {
        continue;
      }
      this.loading.add(key);
      try {
        const mesh = await this.source.getNavMeshTile(directory, tile);
        if (generation !== this.generation) {
          return;
        }
        if (this.isNear(key)) {
          this.read.set(key, mesh ?? null);
          if (mesh && mesh.positions.length > 0) {
            this.add(key, mesh);
          }
        }
      } finally {
        this.loading.delete(key);
      }
    }
  }

  /** The tile read at a key (`tx_ty`): its data, null when it has no mmtile, undefined when not read (yet). */
  tileAt(key: string): NavMeshTile | null | undefined {
    return this.read.get(key);
  }

  dispose(): void {
    this.clear();
    this.fill.dispose();
    this.edges.dispose();
  }

  private add(key: string, tile: NavMeshTile): void {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(tile.positions, 3));
    geometry.setAttribute('color', new BufferAttribute(tile.colors, 3));
    geometry.computeBoundingSphere();
    const group = new Group();
    group.name = `navmesh:${key}`;
    for (const material of [this.fill, this.edges]) {
      const mesh = new Mesh(geometry, material);
      mesh.renderOrder = 1;
      mesh.raycast = () => undefined;
      group.add(mesh);
    }
    this.group.add(group);
    this.tiles.set(key, group);
    this.onChange();
  }

  private remove(key: string, tile: Group): void {
    this.group.remove(tile);
    (tile.children[0] as Mesh).geometry.dispose();
    this.tiles.delete(key);
    this.read.delete(key);
  }

  private clear(): void {
    this.generation++;
    this.loading.clear();
    this.tiles.forEach((tile, key) => this.remove(key, tile));
    this.read.clear();
    this.onChange();
  }

  private isNear(key: string): boolean {
    const [tx, ty] = key.split('_').map(Number);
    const center = this.centerTile as TileCoord;
    return Math.max(Math.abs(tx - center.tx), Math.abs(ty - center.ty)) <= this.options.radius;
  }
}
