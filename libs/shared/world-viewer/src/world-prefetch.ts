import { ModelPlacement, TerrainDetail, TerrainMeshData, TileCoord, tileKey, WorldPosition, worldToTile } from '@keira/shared/wow-data';

/** What reading ahead needs from `WowClientService`. */
export interface PrefetchSource {
  getMapTiles(directory: string): Promise<TileCoord[]>;
  getTerrain(directory: string, tile: TileCoord): Promise<TerrainMeshData | undefined>;
  getTerrainDetail(directory: string, tile: TileCoord): Promise<TerrainDetail | undefined>;
  getTilePlacements(directory: string, tile: TileCoord): Promise<{ wmos: ModelPlacement[]; doodads: ModelPlacement[] } | undefined>;
}

/** Where what's read ahead is kept ready (the view's texture, building and model caches). */
export interface PrefetchTargets {
  texture(path: string): Promise<unknown>;
  building(path: string): Promise<unknown>;
  model(path: string): void;
  /** False while the view is still loading what's in sight: reading ahead waits for it. */
  idle(): boolean;
}

export interface WorldPrefetchOptions {
  /** Rings of tiles read ahead beyond those drawn (0 = off). */
  rings: number;
  /** Tiles drawn around the camera in each direction. */
  radius: number;
  /** Textured terrain (otherwise the low-poly one). */
  detailed: boolean;
}

/** How long to wait (ms) for the view to finish loading what's in sight before reading ahead again. */
const BUSY_WAIT = 150;

/**
 * Reads the tiles just beyond the drawn ones ahead of time: their terrain (parsed, and kept in the disk cache), its
 * textures, their buildings and their trees and props, so they're ready when the camera gets there. One tile at a
 * time, nearest first, and only while the view isn't busy loading what's in sight.
 */
export class WorldPrefetch {
  private directory?: string;
  private available = new Set<string>();
  private options: WorldPrefetchOptions = { rings: 0, radius: 1, detailed: true };
  private queue: TileCoord[] = [];
  private readonly done = new Set<string>();
  private generation = 0;
  private running = false;
  /** Which way the camera looks (server x/y): tiles in front are read first. */
  facing?: { x: number; y: number };

  constructor(
    private readonly source: PrefetchSource,
    private readonly targets: PrefetchTargets,
  ) {}

  /** Tiles still waiting to be read ahead. */
  get pendingCount(): number {
    return this.queue.length;
  }

  async setMap(directory: string | undefined): Promise<void> {
    const generation = ++this.generation;
    this.directory = directory;
    this.available.clear();
    this.done.clear();
    this.queue = [];
    if (!directory) {
      return;
    }
    const tiles = await this.source.getMapTiles(directory).catch((): TileCoord[] => []);
    if (generation === this.generation) {
      this.available = new Set(tiles.map(tileKey));
    }
  }

  configure(options: WorldPrefetchOptions): void {
    if (options.detailed !== this.options.detailed) {
      // the other kind of terrain wasn't read yet
      this.done.clear();
    }
    this.options = { ...options };
    if (options.rings <= 0) {
      this.queue = [];
    }
  }

  /** The camera moved: the tiles around it, beyond those drawn, are read next (nearest first). */
  update(center: WorldPosition): void {
    const { rings, radius } = this.options;
    if (!this.directory || rings <= 0) {
      return;
    }
    const at = worldToTile(center.x, center.y);
    const reach = radius + rings;
    const ring: { tile: TileCoord; distance: number }[] = [];
    for (let dx = -reach; dx <= reach; dx++) {
      for (let dy = -reach; dy <= reach; dy++) {
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        const tile = { tx: at.tx + dx, ty: at.ty + dy };
        if (distance > radius && this.available.has(tileKey(tile)) && !this.done.has(tileKey(tile))) {
          ring.push({ tile, distance });
        }
      }
    }
    const facing = this.facing ?? { x: 0, y: 0 };
    // tiles go west as tx grows and south as ty grows: their offset in server x/y is (−dty, −dtx)
    const ahead = (t: TileCoord) => -(t.ty - at.ty) * facing.x - (t.tx - at.tx) * facing.y;
    this.queue = ring.sort((a, b) => a.distance - b.distance || ahead(b.tile) - ahead(a.tile)).map(({ tile }) => tile);
    void this.run();
  }

  private async run(): Promise<void> {
    if (this.running) {
      return;
    }
    this.running = true;
    try {
      while (this.queue.length > 0) {
        if (!this.targets.idle()) {
          await new Promise((resolve) => setTimeout(resolve, BUSY_WAIT));
          continue;
        }
        const tile = this.queue.shift() as TileCoord;
        const key = tileKey(tile);
        if (this.done.has(key)) {
          continue;
        }
        this.done.add(key);
        await this.fetch(this.directory as string, tile).catch((error: Error) =>
          console.warn(`[World Editor] Could not read ahead ${this.directory}_${key}: ${error.message}`),
        );
      }
    } finally {
      this.running = false;
    }
  }

  private async fetch(directory: string, tile: TileCoord): Promise<void> {
    const generation = this.generation;
    if (this.options.detailed) {
      const detail = await this.source.getTerrainDetail(directory, tile);
      const textures = [...new Set((detail?.chunks ?? []).flatMap((chunk) => chunk.textures))];
      await Promise.all(textures.map((path) => this.targets.texture(path)));
    } else {
      await this.source.getTerrain(directory, tile);
    }
    const placements = await this.source.getTilePlacements(directory, tile);
    if (generation !== this.generation) {
      return;
    }
    for (const path of new Set((placements?.wmos ?? []).map((wmo) => wmo.path))) {
      await this.targets.building(path);
    }
    new Set((placements?.doodads ?? []).map((doodad) => doodad.path)).forEach((path) => this.targets.model(path));
  }
}
