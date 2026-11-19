import { inject, Injector, Service, signal } from '@angular/core';
import { WorldBounds } from './coords';
import { gameMapPages, GameMapTransform, GamePage, onContinent } from './game-map';
import { minimapCacheKey } from './minimap';
import { WowClientService } from './wow-client.service';
import { cacheFileName, WowDataCacheService } from './wow-data-cache.service';
import { WowDataSettingsService } from './wow-data-settings.service';

/** How long Keira is left alone after it starts before the maps are read (ms). */
export const MAP_PRELOAD_DELAY = 8000;

/**
 * Reads every map's pictures in the background and keeps them in the disk cache, so the world map, the in-game map and
 * its seamless view open at once: each map's minimaps and thumbnail, and each in-game map page's picture and outlines.
 * Only what isn't cached yet is read, one thing at a time.
 */
@Service()
export class WowMapPreloadService {
  private readonly injector = inject(Injector);
  private readonly cache = inject(WowDataCacheService);
  private readonly settings = inject(WowDataSettingsService);
  private readonly _progress = signal<{ done: number; total: number } | undefined>(undefined);
  /** How far it got (undefined until it has counted what to read). */
  readonly progress = this._progress.asReadonly();
  private readonly _running = signal(false);
  readonly running = this._running.asReadonly();
  private stopped = false;

  /** When Keira starts: after a while, when asked to. */
  startup(): void {
    setTimeout(() => {
      if (this.cache.preloadMaps()) {
        void this.run();
      }
    }, MAP_PRELOAD_DELAY);
  }

  /** Reads what isn't cached yet (not while it runs, without a client, or with the maps' cache off). */
  async run(): Promise<void> {
    if (this._running() || !this.settings.isConfigured() || !this.cache.isOn('minimap')) {
      return;
    }
    this._running.set(true);
    this.stopped = false;
    try {
      const jobs = await this.jobs();
      this._progress.set({ done: 0, total: jobs.length });
      for (const [i, job] of jobs.entries()) {
        if (this.stopped) {
          break;
        }
        await job().catch((error: Error) => console.warn('[World Editor] Could not preload a map picture:', error));
        this._progress.set({ done: i + 1, total: jobs.length });
        // (the window stays free)
        await new Promise((resolve) => setTimeout(resolve));
      }
    } catch (error) {
      console.warn('[World Editor] Could not preload the maps:', error);
    } finally {
      this._running.set(false);
    }
  }

  /** The client, once needed (not made, nor its parsing worker, when Keira starts without one). */
  private get client(): WowClientService {
    return this.injector.get(WowClientService);
  }

  stop(): void {
    this.stopped = true;
  }

  /** What to read: the in-game map's pages first (pictures, outlines), then every map's minimaps and thumbnail. */
  private async jobs(): Promise<(() => Promise<unknown>)[]> {
    const cached = await this.client.cachedMapKeys();
    const missing = (keys: Set<string>, key: string) => !keys.has(cacheFileName(key));
    const jobs: (() => Promise<unknown>)[] = [];
    const data = await this.client.getGameMap();
    const pages = gameMapPages(data);
    const continents = [...pages.values()].filter((page) => page.kind === 'continent');
    for (const page of pages.values()) {
      const overlays = page.kind === 'zone' ? data.overlays.filter((o) => o.mapAreaId === page.mapAreaId) : [];
      if (missing(cached.pictures, page.prefix)) {
        jobs.push(() => this.client.getGameMapPicture(page, overlays));
      }
      if (page.regions.length && missing(cached.outlines, `regions-${page.key}`)) {
        jobs.push(() => this.client.getGameMapOutlines(page));
      }
      if (page.kind === 'zone') {
        if (missing(cached.outlines, `subzones-${page.key}`)) {
          jobs.push(() => this.client.getGameMapSubzones(page, overlays));
        }
        const continent = this.continentOf(page, continents, data.transforms);
        if (continent && missing(cached.outlines, `neighbours-${page.key}`)) {
          jobs.push(() => this.client.getGameMapNeighbours(page, continent, overlays));
        }
      }
    }
    for (const map of await this.client.getMaps()) {
      const tiles = await this.client.getMapTiles(map.directory).catch(() => []);
      for (const tile of tiles) {
        if (missing(cached.minimaps, minimapCacheKey(map.directory, tile))) {
          jobs.push(() => this.client.getMinimap(map.directory, tile));
        }
      }
      if (tiles.length && missing(cached.thumbnails, map.directory)) {
        jobs.push(() => this.client.getMapThumbnail(map.directory));
      }
    }
    return jobs;
  }

  /** The continent a zone is drawn on (for its neighbours there). */
  private continentOf(page: GamePage, continents: GamePage[], transforms: GameMapTransform[]): GamePage | undefined {
    const placed = onContinent({ mapId: page.mapId, bounds: page.bounds as WorldBounds }, transforms);
    return continents.find((continent) => continent.mapId === placed.mapId);
  }
}
