import { TestBed } from '@angular/core/testing';
import { GameMapData } from './game-map';
import { MAP_PRELOAD_DELAY, WowMapPreloadService } from './map-preload.service';
import { WowClientService } from './wow-client.service';
import { WowDataCacheService } from './wow-data-cache.service';
import { WowDataSettingsService } from './wow-data-settings.service';

const bounds = (minX: number, maxX: number, minY: number, maxY: number) => ({ minX, maxX, minY, maxY });
const area = (id: number, mapId: number, areaId: number, folder: string, b = bounds(0, 0, 0, 0)) => ({
  id,
  mapId,
  areaId,
  folder,
  bounds: b,
  parent: 0,
  defaultFloor: 0,
});

/** The Eastern Kingdoms with Elwynn Forest and Eversong Woods (Outland's, drawn on it), and a dungeon of no continent. */
const data = (): GameMapData => ({
  areas: [
    area(14, 0, 0, 'Azeroth', bounds(-16000, 12000, -22000, 18000)),
    area(30, 0, 12, 'Elwynn', bounds(-10000, -8000, -2000, 1500)),
    area(462, 530, 3430, 'EversongWoods', bounds(7700, 11000, -9400, -4500)),
    area(529, 603, 4273, 'Ulduar', bounds(-1000, 1200, -1700, 1600)),
  ],
  overlays: [
    {
      mapAreaId: 30,
      areaIds: [87],
      texture: 'Goldshire',
      width: 10,
      height: 10,
      x: 0,
      y: 0,
      hit: { left: 0, top: 0, right: 0, bottom: 0 },
    },
  ],
  floors: [],
  transforms: [{ mapId: 530, region: bounds(4800, 16000, -10000, -2600), newMapId: 0, offsetX: -2400, offsetY: 2400 }],
  zones: new Map(),
});

describe('WowMapPreloadService', () => {
  const client = {
    cachedMapKeys: vi.fn(),
    getGameMap: vi.fn(),
    getGameMapPicture: vi.fn(),
    getGameMapOutlines: vi.fn(),
    getGameMapSubzones: vi.fn(),
    getGameMapNeighbours: vi.fn(),
    getMaps: vi.fn(),
    getMapTiles: vi.fn(),
    getMinimap: vi.fn(),
    getMapThumbnail: vi.fn(),
  };
  const cache = { isOn: vi.fn(), preloadMaps: vi.fn() };
  const settings = { isConfigured: vi.fn() };

  beforeEach(() => {
    Object.values(client).forEach((fn) => fn.mockReset().mockResolvedValue(undefined));
    client.cachedMapKeys.mockResolvedValue({
      // Elwynn's picture and Azeroth's first minimap are cached already
      pictures: new Set(['elwynn_elwynn']),
      outlines: new Set(['regions-area_14', 'subzones-area_462']),
      minimaps: new Set(['azeroth_32_48']),
      thumbnails: new Set(['blind']),
    });
    client.getGameMap.mockResolvedValue(data());
    client.getMaps.mockResolvedValue([
      { id: 0, directory: 'Azeroth', name: 'Eastern Kingdoms', instanceType: 0 },
      { id: 36, directory: 'Deadmines', name: 'Deadmines', instanceType: 1 },
      { id: 1, directory: 'Broken', name: 'Broken', instanceType: 0 },
      { id: 2, directory: 'Blind', name: 'Blind', instanceType: 0 },
    ]);
    client.getMapTiles.mockImplementation((directory: string) =>
      directory === 'Azeroth'
        ? Promise.resolve([
            { tx: 32, ty: 48 },
            { tx: 32, ty: 49 },
          ])
        : directory === 'Broken'
          ? Promise.reject(new Error('bad wdt'))
          : Promise.resolve(directory === 'Blind' ? [{ tx: 1, ty: 1 }] : []),
    );
    cache.isOn.mockReturnValue(true);
    cache.preloadMaps.mockReturnValue(true);
    settings.isConfigured.mockReturnValue(true);
    TestBed.configureTestingModule({
      providers: [
        { provide: WowClientService, useValue: client },
        { provide: WowDataCacheService, useValue: cache },
        { provide: WowDataSettingsService, useValue: settings },
      ],
    });
  });

  it('reads every map picture not cached yet, one at a time, saying how far it got', async () => {
    const preload = TestBed.inject(WowMapPreloadService);
    client.getMinimap.mockRejectedValueOnce(new Error('bad blp'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const run = preload.run();
    expect(preload.running()).toBe(true);
    // (not twice at once)
    await preload.run();
    await run;
    expect(preload.running()).toBe(false);
    // the pages: pictures (not Elwynn's), outlines (not the continent's), Elwynn's sub-zones and neighbours
    expect(client.getGameMapPicture.mock.calls.map(([page]) => page.prefix)).not.toContain('Elwynn\\Elwynn');
    expect(client.getGameMapPicture.mock.calls.map(([page]) => page.key)).toContain('area:14');
    expect(client.getGameMapOutlines.mock.calls.map(([page]) => page.key)).toEqual(['cosmic', 'world']);
    expect(client.getGameMapSubzones.mock.calls.map(([page, overlays]) => [page.key, overlays.length])).toEqual([
      ['area:30', 1],
      ['area:529', 0],
    ]);
    // (Eversong on the Eastern Kingdoms; Ulduar on no continent)
    expect(client.getGameMapNeighbours.mock.calls.map(([page, continent]) => [page.key, continent.key])).toEqual([
      ['area:30', 'area:14'],
      ['area:462', 'area:14'],
    ]);
    // the minimaps not cached, then each map's thumbnail (none for maps without tiles, nor cached)
    expect(client.getMinimap.mock.calls).toEqual([
      ['Azeroth', { tx: 32, ty: 49 }],
      ['Blind', { tx: 1, ty: 1 }],
    ]);
    expect(client.getMapThumbnail.mock.calls).toEqual([['Azeroth']]);
    expect(warn).toHaveBeenCalledWith('[World Editor] Could not preload a map picture:', expect.any(Error));
    const progress = preload.progress();
    expect(progress?.done).toBe(progress?.total);
  });

  it('stops when asked, and says when it cannot start', async () => {
    const preload = TestBed.inject(WowMapPreloadService);
    const run = preload.run();
    preload.stop();
    await run;
    expect(preload.progress()?.done).toBe(0);

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    client.getGameMap.mockRejectedValueOnce(new Error('no client'));
    await preload.run();
    expect(warn).toHaveBeenCalledWith('[World Editor] Could not preload the maps:', expect.any(Error));
    expect(preload.running()).toBe(false);

    // no client, or the maps not cached: nothing
    client.cachedMapKeys.mockClear();
    settings.isConfigured.mockReturnValueOnce(false);
    await preload.run();
    cache.isOn.mockReturnValueOnce(false);
    await preload.run();
    expect(client.cachedMapKeys).not.toHaveBeenCalled();
  });

  it('starts a while after Keira does, when asked to', () => {
    vi.useFakeTimers();
    const preload = TestBed.inject(WowMapPreloadService);
    const run = vi.spyOn(preload, 'run').mockResolvedValue(undefined);
    cache.preloadMaps.mockReturnValueOnce(false);
    preload.startup();
    vi.advanceTimersByTime(MAP_PRELOAD_DELAY);
    expect(run).not.toHaveBeenCalled();
    preload.startup();
    vi.advanceTimersByTime(MAP_PRELOAD_DELAY);
    expect(run).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
