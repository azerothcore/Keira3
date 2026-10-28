// eslint-disable-next-line @nx/enforce-module-boundaries
import packageInfo from '../../../../package.json';
import { Component, input, output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import {
  ContextRequest,
  DEFAULT_WORLD_CONTROLS_SETTINGS,
  DEFAULT_WORLD_RENDER_SETTINGS,
  WorldControlsSettings,
  GizmoMode,
  NavMeshRebuildRequest,
  NavMeshRebuildState,
  NavMeshTileInfo,
  WaypointCheck,
  WaypointCheckRequest,
  WorldLink,
  WorldBoundary,
  WorldMarker,
  MovementSimulation,
  ObjectMoved,
  PathProbeRequest,
  PathProbeResult,
  PickResult,
  WaypointPath,
  WorldAreaTrigger,
  WorldRenderSettings,
  WorldSpawn,
  WorldViewerComponent,
} from '@keira/shared/world-viewer';
import {
  flushPerfLog,
  perfLogActive,
  perfNote,
  tileCenter,
  WOW_DATA_SETTINGS_KEY,
  WowClientService,
  WowDataCacheService,
  WorldBounds,
  WorldPosition,
} from '@keira/shared/wow-data';
import { DebugHtmlElement, PageObjectModel, typeInElement } from 'ngx-page-object-model';
import { ClipboardService } from 'ngx-clipboard';
import { ElectronService } from '@keira/shared/common-services';
import { ToastrService } from 'ngx-toastr';
import { WorldEditorComponent } from './world-editor.component';
import { SpawnRecord, WaypointRecord } from './world-editor.model';
import { WorldEditorService } from './world-editor.service';
import { WORLD_EDITOR_LINKS } from '@keira/shared/constants';

/** Stands in for the WebGL viewer: exposes what the editor passes in, and lets tests emit viewer events. */
@Component({ selector: 'keira-world-viewer', template: '' })
class FakeWorldViewerComponent {
  readonly mapDirectory = input<string | undefined>(undefined);
  readonly spawns = input<WorldSpawn[]>([]);
  readonly paths = input<WaypointPath[]>([]);
  readonly selectedKey = input<string | undefined>(undefined);
  readonly editableKey = input<string | undefined>(undefined);
  readonly gizmoMode = input<GizmoMode>('translate');
  readonly snapToGround = input<boolean>(true);
  readonly snapToWall = input<boolean>(false);
  readonly groundOnly = input<boolean>(false);
  readonly renderSettings = input<WorldRenderSettings>(DEFAULT_WORLD_RENDER_SETTINGS);
  readonly focus = input<WorldPosition | undefined>(undefined);
  readonly region = input<WorldBounds | undefined>(undefined);
  readonly navigation = input<WorldControlsSettings>(DEFAULT_WORLD_CONTROLS_SETTINGS);
  readonly areaTriggers = input<WorldAreaTrigger[]>([]);
  readonly probe = input<PathProbeRequest | undefined>(undefined);
  readonly boundaries = input<WorldBoundary[]>([]);
  readonly probed = output<PathProbeResult>();
  readonly speedChanged = output<number>();
  readonly navMeshTileChanged = output<NavMeshTileInfo | undefined>();
  readonly navMeshRebuild = input<NavMeshRebuildRequest | undefined>(undefined);
  readonly hideRealNavMesh = input<boolean>(false);
  readonly navMeshRebuilt = output<NavMeshRebuildState>();
  readonly waypointCheck = input<WaypointCheckRequest | undefined>(undefined);
  readonly waypointsChecked = output<WaypointCheck[]>();
  readonly collisionSourceChanged = output<'server' | 'client'>();
  readonly links = input<WorldLink[]>([]);
  readonly markers = input<WorldMarker[]>([]);
  readonly groupKeys = input<string[]>([]);
  readonly spawnsLoading = input(false);
  readonly buildings = input<{ key: string; path: string }[]>([]);
  readonly simulation = input<MovementSimulation | undefined>(undefined);
  readonly groundQuery = input<{ key: string; position: WorldPosition }[] | undefined>(undefined);
  readonly groundHeights = output<Record<string, number | null>>();
  readonly picked = output<PickResult>();
  readonly objectMoved = output<ObjectMoved>();
  readonly centerChanged = output<WorldPosition>();
  readonly contextRequested = output<ContextRequest>();
  readonly probeMoved = output<{ which: 'from' | 'to'; position: WorldPosition }>();
}

const keyCode = (key: string): string => (/^[a-z]$/i.test(key) ? `Key${key.toUpperCase()}` : key);

class Page extends PageObjectModel<WorldEditorComponent> {
  byId<T extends HTMLElement = HTMLElement>(id: string, assert = true): DebugHtmlElement<T> {
    return this.getDebugElementByTestId(id, assert);
  }
  text(id: string): string {
    return (this.byId(id).nativeElement.textContent ?? '').trim();
  }
  click(id: string): void {
    this.byId(id).nativeElement.click();
  }
  /** Opens the zone picker and picks a zone (0: none). */
  chooseZone(id: number): void {
    const search = this.byId<HTMLInputElement>('zone-search').nativeElement;
    search.dispatchEvent(new Event('focus'));
    this.fixture.detectChanges();
    this.byId(`zone-option-${id}`).nativeElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    this.fixture.detectChanges();
  }
  /** Opens the map picker and picks a map. */
  chooseMap(id: number): void {
    const search = this.byId<HTMLInputElement>('map-search').nativeElement;
    search.dispatchEvent(new Event('focus'));
    this.fixture.detectChanges();
    this.byId(`map-option-${id}`).nativeElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    this.fixture.detectChanges();
  }
  type(id: string, value: string): void {
    typeInElement(value, this.byId<HTMLInputElement>(id).nativeElement);
  }
  submit(id: string): void {
    const form = this.byId(id).nativeElement.closest('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
  }
  /** A key press; the physical key (`code`) defaults to the one of a letter ("r" → "KeyR") or the key itself. */
  key(
    key: string,
    target: HTMLElement = this.fixture.nativeElement as HTMLElement,
    code = keyCode(key),
    init: KeyboardEventInit = {},
  ): void {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, code, bubbles: true, ...init }));
  }
  viewer(): FakeWorldViewerComponent {
    return this.getDebugElementByDirective(FakeWorldViewerComponent).componentInstance as FakeWorldViewerComponent;
  }
  pendingLines(): string[] {
    return this.fixture.debugElement.nativeElement.querySelectorAll('[data-testid="pending-list"] li').length
      ? Array.from((this.byId('pending-list').nativeElement as HTMLElement).querySelectorAll('li')).map((li) =>
          (li.textContent ?? '').trim(),
        )
      : [];
  }
  placementValue(field: string): number {
    return Number(this.byId<HTMLInputElement>(`placement-${field}`).nativeElement.value);
  }
}

const MAPS = [
  { id: 0, directory: 'Azeroth', name: 'Eastern Kingdoms', instanceType: 0 },
  { id: 1, directory: 'Kalimdor', name: 'Kalimdor', instanceType: 0 },
];
const spawn = (type: 'creature' | 'gameobject', guid: number, extra: Partial<SpawnRecord> = {}): SpawnRecord => ({
  type,
  guid,
  entry: 100 + guid,
  name: `Spawn ${guid}`,
  map: 0,
  x: -8900 - guid,
  y: -100,
  z: 80,
  o: 0,
  pathId: 0,
  ...extra,
});
const ZONES = [
  { areaId: 12, mapId: 0, name: 'Elwynn Forest', bounds: { minX: -10000, maxX: -8000, minY: -1000, maxY: 1000 } },
  { areaId: 40, mapId: 0, name: 'Westfall', bounds: { minX: -12000, maxX: -10000, minY: 0, maxY: 2000 } },
];
const SPAWNS = [
  spawn('creature', 1, { pathId: 10, name: 'Deputy Willem' }),
  spawn('creature', 2, { name: '', wanderDistance: 8 }),
  spawn('gameobject', 3, { name: 'Mailbox' }),
];
const WAYPOINTS: WaypointRecord[] = [
  { pathId: 10, point: 1, x: -8901, y: -101, z: 80, delay: 0 },
  { pathId: 10, point: 2, x: -8902, y: -102, z: 81, delay: 1000, moveType: 1, action: 50, actionChance: 100 },
];
const CENTER = { x: -8913, y: -137, z: 82 };

describe(WorldEditorComponent.name, () => {
  const mocks = {
    client: {
      isSupported: vi.fn(),
      getMaps: vi.fn(),
      getMapTiles: vi.fn(),
      getMapBuilding: vi.fn(),
      getZones: vi.fn(),
      getAreaTriggers: vi.fn(),
      preload: vi.fn(),
      cacheUsage: vi.fn(),
      close: vi.fn(),
      getCreatureDisplay: vi.fn(),
      getGameObjectDisplay: vi.fn(),
      getM2: vi.fn(),
      getTaxiNodes: vi.fn(),
      getTaxiPaths: vi.fn(),
      getBossBoundaries: vi.fn(),
      getServerCoverage: vi.fn(),
      getServerMap: vi.fn(),
      getMinimap: vi.fn(),
      getFactions: vi.fn(),
    },
    service: {
      loadSpawns: vi.fn(),
      loadWaypoints: vi.fn(),
      loadSaiPaths: vi.fn(),
      loadSpawnFields: vi.fn(),
      searchSpawns: vi.fn(),
      loadFormations: vi.fn(),
      loadPools: vi.fn(),
      loadPoolMembers: vi.fn(),
      loadTransports: vi.fn(),
      loadGraveyards: vi.fn(),
      loadTeleports: vi.fn(),
      loadScriptEntries: vi.fn(),
      loadWaypointScripts: vi.fn(),
      loadWaypointSai: vi.fn(),
      loadEventNames: vi.fn(),
      loadQuests: vi.fn(),
      loadAreaTriggerInfo: vi.fn(),
      getMaxGuid: vi.fn(),
      getFreePathId: vi.fn(),
      getEntryName: vi.fn(),
      getEntryDisplay: vi.fn(),
      searchTele: vi.fn(),
      execute: vi.fn(),
    },
    toastr: { error: vi.fn(), warning: vi.fn(), success: vi.fn() },
    clipboard: { copyFromContent: vi.fn() },
    electron: {
      isElectron: vi.fn(),
      ipcRenderer: { send: vi.fn() },
      fs: { appendFileSync: vi.fn() },
      childProcess: { execSync: vi.fn(() => 'abc1234\n') },
    },
  };

  const links = {
    openCreature: vi.fn(),
    openCreatureSai: vi.fn(),
    openGameObject: vi.fn(),
    openGameObjectSai: vi.fn(),
    openAreaTriggerSai: vi.fn(),
    openLoot: vi.fn(),
  };

  const setup = async (
    opts: { params?: Record<string, string>; configured?: boolean; lastView?: string; links?: boolean; cacheRoot?: string } = {},
  ) => {
    localStorage.clear();
    if (opts.lastView) {
      localStorage.setItem('keira3.worldEditor.lastView', opts.lastView);
    }
    if (opts.configured !== false) {
      localStorage.setItem(WOW_DATA_SETTINGS_KEY, JSON.stringify({ clientPath: '/wow', serverDataPath: '' }));
    }
    TestBed.configureTestingModule({
      imports: [WorldEditorComponent, TranslateTestingModule],
      providers: [
        { provide: WowClientService, useValue: mocks.client },
        { provide: WorldEditorService, useValue: mocks.service },
        { provide: ToastrService, useValue: mocks.toastr },
        { provide: ClipboardService, useValue: mocks.clipboard },
        { provide: ElectronService, useValue: mocks.electron },
        ...(opts.links === false ? [] : [{ provide: WORLD_EDITOR_LINKS, useValue: links }]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(opts.params ?? {}) } } },
      ],
    });
    TestBed.overrideComponent(WorldEditorComponent, {
      remove: { imports: [WorldViewerComponent] },
      add: { imports: [FakeWorldViewerComponent] },
    });
    if (opts.cacheRoot) {
      vi.spyOn(TestBed.inject(WowDataCacheService), 'root').mockReturnValue(opts.cacheRoot);
    }
    const fixture = TestBed.createComponent(WorldEditorComponent);
    const page = new Page(fixture);
    await settle(page);
    return { page, fixture };
  };

  const settle = async (page: Page): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve));
    await new Promise((resolve) => setTimeout(resolve));
    page.fixture.detectChanges();
    await page.fixture.whenStable();
    page.fixture.detectChanges();
  };

  /** Moves the camera (as the viewer would) so spawns and waypoints get loaded. */
  const loadArea = async (page: Page): Promise<void> => {
    page.viewer().centerChanged.emit(CENTER);
    await settle(page);
  };

  afterEach(() => vi.unstubAllGlobals());

  beforeEach(() => {
    vi.clearAllMocks();
    // (jsdom doesn't scroll)
    Element.prototype.scrollIntoView = vi.fn();
    // the next frame comes right away
    vi.stubGlobal('requestAnimationFrame', (callback: () => void) => setTimeout(callback));
    mocks.client.isSupported.mockReturnValue(true);
    mocks.client.getMaps.mockResolvedValue(MAPS);
    mocks.client.getMapTiles.mockResolvedValue([
      { tx: 31, ty: 48 },
      { tx: 32, ty: 48 },
    ]);
    mocks.client.close.mockResolvedValue(undefined);
    mocks.client.cacheUsage.mockResolvedValue({ maps: [], buildingBytes: 0, modelBytes: 0, textureBytes: 0, totalBytes: 0 });
    mocks.client.getZones.mockImplementation((map: number) => Promise.resolve(map === 0 ? ZONES : []));
    mocks.service.loadSpawns.mockResolvedValue(SPAWNS);
    mocks.service.loadWaypoints.mockResolvedValue(WAYPOINTS);
    mocks.service.loadSaiPaths.mockResolvedValue(new Map());
    mocks.service.loadSpawnFields.mockResolvedValue({
      spawntimesecs: 120,
      MovementType: 0,
      wander_distance: 0,
      phaseMask: 1,
      spawnMask: 1,
      equipment_id: 0,
    });
    mocks.service.searchSpawns.mockResolvedValue([]);
    mocks.client.getServerCoverage.mockReturnValue(new Map());
    mocks.client.getServerMap.mockResolvedValue(undefined);
    mocks.client.getMinimap.mockResolvedValue(undefined);
    mocks.client.getFactions.mockResolvedValue({ templates: new Map(), factions: new Map() });
    mocks.service.loadFormations.mockResolvedValue([]);
    mocks.service.loadPools.mockResolvedValue([]);
    mocks.service.loadTransports.mockResolvedValue([]);
    mocks.service.loadGraveyards.mockResolvedValue([]);
    mocks.service.loadTeleports.mockResolvedValue([]);
    mocks.client.getTaxiNodes.mockResolvedValue([]);
    mocks.client.getTaxiPaths.mockResolvedValue([]);
    mocks.client.getBossBoundaries.mockResolvedValue([]);
    mocks.client.getMapBuilding.mockResolvedValue(undefined);
    mocks.service.loadScriptEntries.mockResolvedValue(new Map());
    mocks.service.loadWaypointScripts.mockResolvedValue(new Map([[50, [{ id: 50, delay: 0, command: 0 }]]]));
    mocks.service.loadWaypointSai.mockResolvedValue([{ entryorguid: -1, point: 2, pathId: 10, actionType: 1, comment: 'Willem - Say' }]);
    mocks.service.loadEventNames.mockResolvedValue(new Map());
    mocks.service.loadQuests.mockResolvedValue([]);
    mocks.service.loadAreaTriggerInfo.mockResolvedValue(new Map([[45, ["Inn: Lion's Pride Inn"]]]));
    mocks.client.getAreaTriggers.mockImplementation((map: number) =>
      Promise.resolve(
        map === 0
          ? [
              { id: 45, mapId: 0, x: -9460, y: 30, z: 60, radius: 10 },
              { id: 46, mapId: 0, x: -9400, y: 30, z: 60, radius: 0, box: { length: 5, width: 4, height: 3, orientation: 1 } },
            ]
          : [],
      ),
    );
    mocks.service.getMaxGuid.mockResolvedValue(1000);
    mocks.service.getFreePathId.mockResolvedValue(20);
    mocks.service.getEntryName.mockResolvedValue('Marshal McBride');
    mocks.service.getEntryDisplay.mockResolvedValue({ displayId: 1, scale: 1 });
    mocks.service.searchTele.mockResolvedValue([{ id: 7, name: 'Northshire', map: 1, x: 1, y: 2, z: 3 }]);
    mocks.service.execute.mockResolvedValue(undefined);
  });

  describe('setup & navigation', () => {
    it('asks for the game data folders first, then loads the maps', async () => {
      const { page } = await setup({ configured: false });
      expect(page.byId('settings')).toBeTruthy();
      expect(mocks.client.getMaps).not.toHaveBeenCalled();

      page.type('client-path', 'C:\\WoW');
      page.type('server-data-path', 'C:\\Server\\Data');
      page.submit('settings-save');
      await settle(page);

      expect(JSON.parse(localStorage.getItem(WOW_DATA_SETTINGS_KEY) as string)).toEqual({
        clientPath: 'C:\\WoW',
        serverDataPath: 'C:\\Server\\Data',
        sourcePath: '',
      });
      expect(mocks.client.close).toHaveBeenCalled();
      expect(page.byId('settings', false)).toBeFalsy();
      page.byId('map-search').nativeElement.dispatchEvent(new Event('focus'));
      page.fixture.detectChanges();
      expect(page.byId('map-options').nativeElement.querySelectorAll('button').length).toBe(2);
    });

    it('keeps the cache where the user wants it, and manages it', async () => {
      const { page } = await setup();
      page.click('settings-toggle');
      page.fixture.detectChanges();
      expect(page.text('cache-size')).toBe('0.0 MB (0.00 GB)');
      page.type('cache-folder', 'D:\\Cache');
      page.submit('settings-save');
      await settle(page);
      expect(JSON.parse(localStorage.getItem('keira3.worldEditor.cache') as string)).toEqual({
        enabled: true,
        folder: 'D:\\Cache',
        maxBytes: 10_000_000_000,
      });

      page.click('settings-toggle');
      page.fixture.detectChanges();
      const enabled = page.byId<HTMLInputElement>('cache-enabled').nativeElement;
      enabled.checked = false;
      enabled.dispatchEvent(new Event('change'));
      page.fixture.detectChanges();
      expect(JSON.parse(localStorage.getItem('keira3.worldEditor.cache') as string).enabled).toBe(false);
      expect(page.byId<HTMLButtonElement>('preload-map').nativeElement.disabled).toBe(true);
      page.click('cache-clear');
      expect(page.text('cache-size')).toBe('0.0 MB (0.00 GB)');

      const max = page.byId<HTMLInputElement>('cache-max').nativeElement;
      expect(max.value).toBe('10');
      max.value = '25';
      max.dispatchEvent(new Event('change'));
      expect(JSON.parse(localStorage.getItem('keira3.worldEditor.cache') as string).maxBytes).toBe(25_000_000_000);
    });

    it('preloads the selected zone or the whole map into the cache, with progress', async () => {
      const { page } = await setup();
      mocks.client.getMapTiles.mockResolvedValue([
        { tx: 32, ty: 48 },
        { tx: 40, ty: 40 },
      ]);
      let report: (done: number, total: number) => void = () => undefined;
      let cancelled: () => boolean = () => false;
      let finish: () => void = () => undefined;
      mocks.client.preload.mockImplementation((_d: string, _t: unknown, progress: typeof report, isCancelled: typeof cancelled) => {
        report = progress;
        cancelled = isCancelled;
        return new Promise<boolean>((resolve) => (finish = () => resolve(true)));
      });
      page.click('settings-toggle');
      page.fixture.detectChanges();
      expect(page.byId<HTMLButtonElement>('preload-zone').nativeElement.disabled).toBe(true);

      page.chooseZone(12);
      await settle(page);
      page.click('preload-zone');
      await settle(page);
      expect(mocks.client.preload).toHaveBeenCalledWith('Azeroth', [{ tx: 32, ty: 48 }], expect.any(Function), expect.any(Function));
      expect(page.text('preload-label')).toBe('Elwynn Forest');
      expect(page.text('preload-progress')).toBe('0 / 1 (0%)');
      expect(page.byId('preload-maps', false)).toBeFalsy();
      mocks.electron.isElectron.mockReturnValue(true);
      report(1, 4);
      page.fixture.detectChanges();
      expect(page.text('preload-progress')).toBe('1 / 4 (25%)');
      // on the taskbar icon too, removed when done
      expect(mocks.electron.ipcRenderer.send).toHaveBeenLastCalledWith('keira:progress', 0.25);
      finish();
      await settle(page);
      expect(page.byId('preload-progress', false)).toBeFalsy();
      expect(mocks.electron.ipcRenderer.send).toHaveBeenLastCalledWith('keira:progress', -1);
      mocks.electron.isElectron.mockReturnValue(false);
      expect(mocks.toastr.success).toHaveBeenCalledWith('Preloaded 1 tiles.', 'World Editor');

      // the whole map, cancelled
      mocks.toastr.success.mockClear();
      page.click('preload-map');
      await settle(page);
      expect(mocks.client.preload).toHaveBeenLastCalledWith(
        'Azeroth',
        [
          { tx: 32, ty: 48 },
          { tx: 40, ty: 40 },
        ],
        expect.any(Function),
        expect.any(Function),
      );
      report(0, 0);
      page.fixture.detectChanges();
      page.click('preload-cancel');
      expect(cancelled()).toBe(true);
      finish();
      await settle(page);
      expect(mocks.toastr.success).not.toHaveBeenCalled();

      // a full cache stops everything
      mocks.client.preload.mockResolvedValueOnce(false);
      page.click('preload-all');
      await settle(page);
      // offers to double the maximum and go on
      expect(page.byId('cache-full')).toBeTruthy();
      mocks.client.preload.mockResolvedValueOnce(false);
      const calls = mocks.client.preload.mock.calls.length;
      page.click('cache-raise');
      await settle(page);
      expect(JSON.parse(localStorage.getItem('keira3.worldEditor.cache') as string).maxBytes).toBe(20_000_000_000);
      expect(mocks.client.preload.mock.calls.length).toBeGreaterThan(calls);
      page.click('cache-full-dismiss');
      page.fixture.detectChanges();
      expect(page.byId('cache-full', false)).toBeFalsy();

      mocks.client.preload.mockRejectedValueOnce(new Error('disk full'));
      page.click('preload-map');
      await settle(page);
      expect(mocks.toastr.error).toHaveBeenCalledWith('disk full', 'World Editor');
    });

    it('preloads every map with terrain, one after the other, and stops when cancelled', async () => {
      const { page } = await setup();
      mocks.client.getMapTiles.mockImplementation((directory: string) =>
        Promise.resolve(
          directory === 'Azeroth'
            ? [{ tx: 32, ty: 48 }]
            : [
                { tx: 1, ty: 1 },
                { tx: 1, ty: 2 },
              ],
        ),
      );
      let finishFirst: () => void = () => undefined;
      mocks.client.preload
        .mockImplementationOnce(() => new Promise<boolean>((resolve) => (finishFirst = () => resolve(true))))
        .mockResolvedValue(true);
      page.click('settings-toggle');
      page.fixture.detectChanges();
      page.click('preload-all');
      await settle(page);
      expect(page.text('preload-label')).toBe('1/2 Eastern Kingdoms');
      expect(page.byId('preload-maps').nativeElement.getAttribute('title')).toBe('0 / 2');
      finishFirst();
      await settle(page);
      expect(mocks.client.preload).toHaveBeenCalledTimes(2);
      expect(mocks.client.preload).toHaveBeenLastCalledWith(
        'Kalimdor',
        [
          { tx: 1, ty: 1 },
          { tx: 1, ty: 2 },
        ],
        expect.any(Function),
        expect.any(Function),
      );
      expect(mocks.toastr.success).toHaveBeenCalledWith('Preloaded 3 tiles.', 'World Editor');

      // maps without terrain are skipped; cancelling stops before the next map
      mocks.client.preload.mockClear();
      mocks.client.getMapTiles.mockImplementation((directory: string) =>
        Promise.resolve(directory === 'Azeroth' ? [] : [{ tx: 1, ty: 1 }]),
      );
      page.click('preload-all');
      await settle(page);
      expect(mocks.client.preload).toHaveBeenCalledTimes(1);

      mocks.client.preload.mockClear();
      mocks.client.getMapTiles.mockResolvedValue([{ tx: 1, ty: 1 }]);
      mocks.client.preload.mockImplementation(() => {
        page.fixture.detectChanges();
        page.click('preload-cancel');
        return Promise.resolve(true);
      });
      mocks.toastr.error.mockClear();
      page.click('preload-all');
      await settle(page);
      expect(mocks.client.preload).toHaveBeenCalledTimes(1);
      expect(mocks.toastr.error).not.toHaveBeenCalled();
    });

    it('shows which map it is looking at while finding the tiles, skips unreadable maps, and can be cancelled meanwhile', async () => {
      const { page } = await setup();
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      let finishScan: () => void = () => undefined;
      mocks.client.getMapTiles.mockImplementation((directory: string) =>
        directory === 'Azeroth'
          ? new Promise((resolve, reject) => (finishScan = () => reject(new Error('bad WDT'))))
          : Promise.resolve([{ tx: 1, ty: 1 }]),
      );
      mocks.client.preload.mockResolvedValue(true);
      page.click('settings-toggle');
      page.fixture.detectChanges();
      page.click('preload-all');
      await settle(page);
      expect(page.text('preload-label')).toBe('Eastern Kingdoms…');
      expect(page.text('preload-progress')).toBe('0 / 2 (0%)');
      finishScan();
      await settle(page);
      expect(warn).toHaveBeenCalledWith('[World Editor] Could not read the tiles of Azeroth: bad WDT');
      expect(mocks.client.preload).toHaveBeenCalledTimes(1);
      expect(mocks.client.preload.mock.calls[0][0]).toBe('Kalimdor');

      // cancelled while finding the tiles: nothing is preloaded
      mocks.client.preload.mockClear();
      page.click('preload-all');
      await settle(page);
      page.click('preload-cancel');
      finishScan();
      await settle(page);
      expect(mocks.client.preload).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('shows what each map takes in the cache', async () => {
      mocks.client.cacheUsage.mockResolvedValue({
        maps: [
          { directory: 'azeroth', tiles: 3, bytes: 3_000_000 },
          { directory: 'kalimdor', tiles: 9, bytes: 9_500_000 },
          { directory: 'custommap', tiles: 1, bytes: 100_000 },
        ],
        buildingBytes: 2_000_000,
        modelBytes: 1_000_000,
        textureBytes: 500_000,
        totalBytes: 15_600_000,
      });
      const { page } = await setup();
      page.click('settings-toggle');
      await settle(page);
      const rows = Array.from((page.byId('cache-maps').nativeElement as HTMLElement).querySelectorAll('tbody tr')).map((tr) =>
        Array.from(tr.querySelectorAll('td')).map((td) => td.textContent?.trim()),
      );
      expect(rows).toEqual([
        ['WORLD_EDITOR.TOTAL', '', '15.6 MB (0.02 GB)'],
        ['Kalimdor', '9', '9.5 MB (0.01 GB)'],
        ['Eastern Kingdoms', '3', '3.0 MB (0.00 GB)'],
        ['custommap', '1', '0.1 MB (0.00 GB)'],
        ['WORLD_EDITOR.BUILDINGS', '', '2.0 MB (0.00 GB)'],
        ['WORLD_EDITOR.TEXTURES', '', '0.5 MB (0.00 GB)'],
        ['WORLD_EDITOR.MODELS', '', '1.0 MB (0.00 GB)'],
      ]);
      expect(page.text('cache-size')).toBe('15.6 MB (0.02 GB)');

      // the fill bar turns yellow from 50%, orange from 75% and red from 90% of the maximum size
      const fill = (maxGb: string): string => {
        const max = page.byId<HTMLInputElement>('cache-max').nativeElement;
        max.value = maxGb;
        max.dispatchEvent(new Event('change'));
        page.fixture.detectChanges();
        const bar = (page.byId('cache-fill').nativeElement as HTMLElement).firstElementChild as HTMLElement;
        return `${[...bar.classList].sort().join(' ')} ${bar.style.width}`;
      };
      expect(fill('10')).toBe('fill-low progress-bar 0.156%');
      expect(fill('0.03')).toBe('fill-half progress-bar 52%');
      expect(fill('0.02')).toBe('fill-high progress-bar 78%');
      expect(fill('0.017')).toMatch(/^fill-full progress-bar 91\.76/);
      expect(fill('0')).toBe('fill-full progress-bar 100%');
      expect(page.text('cache-percent')).toBe('100%');

      // a client that can't be opened only shows the total
      mocks.client.cacheUsage.mockRejectedValue(new Error('no client'));
      page.click('cache-clear');
      await settle(page);
      expect(page.byId('cache-maps', false)).toBeFalsy();
    });

    it('does not read the cache usage without a client', async () => {
      const { page } = await setup({ configured: false });
      page.click('settings-toggle');
      page.click('settings-toggle');
      await settle(page);
      mocks.client.isSupported.mockReturnValue(false);
      page.click('settings-toggle');
      await settle(page);
      expect(mocks.client.cacheUsage).not.toHaveBeenCalled();
    });

    it('toggles the settings panel', async () => {
      const { page } = await setup();
      expect(page.byId('settings', false)).toBeFalsy();
      page.click('settings-toggle');
      page.fixture.detectChanges();
      expect(page.byId('settings')).toBeTruthy();
    });

    it('changes and remembers the view settings', async () => {
      const { page } = await setup();
      expect(page.byId('view-settings', false)).toBeFalsy();
      page.click('view-toggle');
      page.fixture.detectChanges();

      const lowDetail = page.byId<HTMLInputElement>('view-low-detail').nativeElement;
      lowDetail.checked = true;
      lowDetail.dispatchEvent(new Event('change'));
      const buildings = page.byId<HTMLInputElement>('view-buildings').nativeElement;
      buildings.checked = false;
      buildings.dispatchEvent(new Event('change'));
      const radius = page.byId<HTMLSelectElement>('view-terrain-radius').nativeElement;
      radius.value = '2';
      radius.dispatchEvent(new Event('change'));
      const drawDistance = page.byId<HTMLSelectElement>('view-draw-distance').nativeElement;
      drawDistance.value = '500';
      drawDistance.dispatchEvent(new Event('change'));
      for (const id of ['view-doodads', 'view-models', 'view-zone-lighting', 'view-roofs', 'view-facing']) {
        const toggle = page.byId<HTMLInputElement>(id).nativeElement;
        toggle.checked = false;
        toggle.dispatchEvent(new Event('change'));
      }
      const collision = page.byId<HTMLInputElement>('view-collision').nativeElement;
      collision.checked = true;
      collision.dispatchEvent(new Event('change'));
      page.fixture.detectChanges();
      expect(page.viewer().renderSettings().showCollision).toBe(true);
      const navMesh = page.byId<HTMLInputElement>('view-navmesh').nativeElement;
      navMesh.checked = true;
      navMesh.dispatchEvent(new Event('change'));
      page.fixture.detectChanges();
      expect(page.viewer().renderSettings().showNavMesh).toBe(true);
      navMesh.checked = false;
      navMesh.dispatchEvent(new Event('change'));
      collision.checked = false;
      collision.dispatchEvent(new Event('change'));
      page.fixture.detectChanges();
      expect(drawDistance.disabled).toBe(false);
      expect(page.byId('view-distances', false)).toBeFalsy();

      // per-group distances, in a table
      const advanced = page.byId<HTMLInputElement>('view-advanced').nativeElement;
      advanced.checked = true;
      advanced.dispatchEvent(new Event('change'));
      page.fixture.detectChanges();
      expect(drawDistance.disabled).toBe(true);
      const small = page.byId<HTMLSelectElement>('view-distance-smallDoodadDistance').nativeElement;
      expect(small.options[0].textContent?.trim()).toBe('WORLD_EDITOR.OFF');
      expect(small.options[2].textContent?.trim()).toBe('100 WORLD_EDITOR.YARDS');
      small.value = '0';
      small.dispatchEvent(new Event('change'));
      page.fixture.detectChanges();

      expect(page.viewer().renderSettings()).toEqual({
        ...DEFAULT_WORLD_RENDER_SETTINGS,
        lowDetailTerrain: true,
        showBuildings: false,
        terrainRadius: 2,
        showDoodads: false,
        showModels: false,
        showRoofs: false,
        showFacingArrows: false,
        zoneLighting: false,
        drawDistance: 500,
        advancedDistances: true,
        smallDoodadDistance: 0,
      });
      expect(radius.options[1].textContent?.trim()).toBe('25 WORLD_EDITOR.TILES');
      expect(JSON.parse(localStorage.getItem('keira3.worldEditor.render') as string).terrainRadius).toBe(2);
    });

    it('lets the user bind any number of keys to every action, turn keyboard navigation off and reset', async () => {
      const { page } = await setup();
      page.click('controls-toggle');
      page.fixture.detectChanges();
      const row = (action: string) => page.text('control-' + action);
      expect(page.viewer().navigation().bindings.forward).toEqual(['KeyW', 'ArrowUp']);
      expect(row('forward')).toContain('W');
      expect(row('left')).toContain('←');
      expect(row('redo')).toContain('Ctrl+Shift+Z');

      // a key with modifiers: the modifier alone waits for the key
      page.click('bind-forward');
      page.fixture.detectChanges();
      expect(page.text('bind-forward')).toBe('WORLD_EDITOR.PRESS_A_KEY');
      page.key('Shift', undefined, 'ShiftLeft', { shiftKey: true });
      page.key('I', undefined, 'KeyI', { shiftKey: true });
      page.fixture.detectChanges();
      expect(page.viewer().navigation().bindings.forward).toEqual(['KeyW', 'ArrowUp', 'Shift+KeyI']);
      expect(page.text('bind-forward')).toBe('WORLD_EDITOR.ADD_KEY');

      // Escape cancels; a key already on another action is shown red
      page.click('bind-back');
      page.key('Escape');
      page.fixture.detectChanges();
      expect(page.viewer().navigation().bindings.back).toEqual(['KeyS', 'ArrowDown']);
      page.click('bind-toggleGizmo');
      page.key('w');
      page.fixture.detectChanges();
      const clash = (page.byId('unbind-toggleGizmo-KeyW').nativeElement as HTMLElement).parentElement as HTMLElement;
      expect(clash.classList).toContain('bg-danger');
      expect(clash.getAttribute('title')).toBe('WORLD_EDITOR.CLASH');
      expect(((page.byId('unbind-toggleGizmo-KeyR').nativeElement as HTMLElement).parentElement as HTMLElement).getAttribute('title')).toBe(
        '',
      );

      page.click('unbind-forward-ArrowUp');
      page.fixture.detectChanges();
      expect(page.viewer().navigation().bindings.forward).toEqual(['KeyW', 'Shift+KeyI']);
      page.click('default-forward');
      page.fixture.detectChanges();
      expect(page.viewer().navigation().bindings.forward).toEqual(['KeyW', 'ArrowUp']);
      page.click('controls-reset');
      page.fixture.detectChanges();
      expect(page.viewer().navigation().bindings.toggleGizmo).toEqual(['KeyR']);

      const toggle = page.byId<HTMLInputElement>('controls-navigation').nativeElement;
      toggle.checked = false;
      toggle.dispatchEvent(new Event('change'));
      page.fixture.detectChanges();
      expect(page.viewer().navigation().keyboardNavigation).toBe(false);
      page.click('controls-toggle');
      page.fixture.detectChanges();
      expect(page.byId('controls', false)).toBeFalsy();
    });

    it('does not read game data outside the desktop app', async () => {
      mocks.client.isSupported.mockReturnValue(false);
      await setup();
      expect(mocks.client.getMaps).not.toHaveBeenCalled();
    });

    it('reports errors while loading maps', async () => {
      mocks.client.getMaps.mockRejectedValue(new Error('No "Data" folder'));
      await setup();
      expect(mocks.toastr.error).toHaveBeenCalledWith('No "Data" folder', 'World Editor');
    });

    it('starts at the middle of the map', async () => {
      const { page } = await setup();
      expect(page.viewer().mapDirectory()).toBe('Azeroth');
      expect(page.viewer().focus()).toEqual(tileCenter({ tx: 32, ty: 48 }));
    });

    it('starts where the link points to', async () => {
      const { page } = await setup({ params: { map: '1', x: '10', y: '20', select: 'creature:1' } });
      expect(page.viewer().mapDirectory()).toBe('Kalimdor');
      expect(page.viewer().focus()).toEqual({ x: 10, y: 20, z: 0 });
      expect(page.viewer().selectedKey()).toBe('creature:1');
      expect(mocks.client.getMapTiles).not.toHaveBeenCalled();

      TestBed.resetTestingModule();
      const second = await setup({ params: { map: 'abc', x: '1', y: '2', z: '3' } });
      expect(second.page.viewer().mapDirectory()).toBe('Azeroth');
      expect(second.page.viewer().focus()).toEqual({ x: 1, y: 2, z: 3 });

      TestBed.resetTestingModule();
      const third = await setup({ params: { x: '1', y: '2', z: 'abc' } });
      expect(third.page.viewer().focus()).toEqual({ x: 1, y: 2, z: 0 });
    });

    it('reopens where the user left off, ignoring a damaged memory', async () => {
      const { page } = await setup();
      page.viewer().centerChanged.emit({ x: 5, y: 6, z: 7 });
      await settle(page);
      const saved = localStorage.getItem('keira3.worldEditor.lastView') as string;
      expect(JSON.parse(saved)).toEqual({ mapId: 0, x: 5, y: 6, z: 7 });

      TestBed.resetTestingModule();
      const reopened = await setup({ lastView: JSON.stringify({ mapId: 1, x: 5, y: 6, z: 7 }) });
      expect(reopened.page.viewer().mapDirectory()).toBe('Kalimdor');
      expect(reopened.page.viewer().focus()).toEqual({ x: 5, y: 6, z: 7 });

      // a link wins over the memory
      TestBed.resetTestingModule();
      const linked = await setup({ lastView: saved, params: { map: '1' } });
      expect(linked.page.viewer().mapDirectory()).toBe('Kalimdor');

      for (const damaged of ['{nope', JSON.stringify({ mapId: 0, x: 'a', y: 1, z: 1 }), 'null']) {
        TestBed.resetTestingModule();
        const fresh = await setup({ lastView: damaged });
        expect(fresh.page.viewer().focus()).toEqual(tileCenter({ tx: 32, ty: 48 }));
      }
    });

    it('jumps to a zone, and loads it whole when asked', async () => {
      const { page } = await setup();
      const search = page.byId<HTMLInputElement>('zone-search').nativeElement;
      search.dispatchEvent(new Event('focus'));
      page.fixture.detectChanges();
      // with their ids, searchable by name or id
      expect(page.text('zone-options')).toContain('12 – Elwynn Forest');
      search.value = 'west';
      search.dispatchEvent(new Event('input'));
      page.fixture.detectChanges();
      expect(page.byId('zone-option-12', false)).toBeFalsy();
      search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await settle(page);
      expect(search.value).toBe('40 – Westfall');
      expect(page.viewer().focus()).toEqual({ x: -11000, y: 1000, z: 0 });
      expect(page.viewer().region()).toBeUndefined();

      page.click('view-toggle');
      page.fixture.detectChanges();
      const whole = page.byId<HTMLInputElement>('view-whole-zone').nativeElement;
      whole.checked = true;
      whole.dispatchEvent(new Event('change'));
      await settle(page);
      expect(page.viewer().region()).toEqual(ZONES[1].bounds);

      page.chooseZone(0);
      await settle(page);
      expect(page.viewer().region()).toBeUndefined();
      // nothing matching, and Enter then picks nothing
      search.dispatchEvent(new Event('focus'));
      search.value = 'nowhere';
      search.dispatchEvent(new Event('input'));
      page.fixture.detectChanges();
      expect(page.text('zone-options')).toContain('WORLD_EDITOR.NO_RESULTS');
      search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      search.dispatchEvent(new Event('focus'));
      search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await settle(page);

      // other maps have their own zones
      page.chooseMap(1);
      await settle(page);
      expect(search.disabled).toBe(true);
    });

    it('reports errors while loading zones', async () => {
      mocks.client.getZones.mockRejectedValue(new Error('bad WorldMapArea.dbc'));
      // (no factions: nothing said about who can interact)
      mocks.client.getFactions.mockRejectedValue(new Error('bad Faction.dbc'));
      const { page } = await setup();
      expect(mocks.toastr.error).toHaveBeenCalledWith('bad WorldMapArea.dbc', 'World Editor');
      expect(page.byId<HTMLInputElement>('zone-search').nativeElement.disabled).toBe(true);
    });

    it('tells the kind of each map, steps to the next and previous map, and opens the list at the map shown', async () => {
      mocks.client.getMaps.mockResolvedValue([
        ...MAPS,
        { id: 33, directory: 'Shadowfang', name: 'Shadowfang Keep', instanceType: 1 },
        { id: 249, directory: 'OnyxiaLairInstance', name: "Onyxia's Lair", instanceType: 2 },
        { id: 489, directory: 'PVPzone03', name: 'Warsong Gulch', instanceType: 3 },
        { id: 559, directory: 'PVPzone04', name: 'Nagrand Arena', instanceType: 4 },
        { id: 672, directory: 'Transport197347', name: 'Transport: The Skybreaker', instanceType: 0 },
        { id: 999, directory: 'Odd', name: 'Odd', instanceType: 9 },
      ]);
      const { page } = await setup();
      const search = page.byId<HTMLInputElement>('map-search').nativeElement;
      search.dispatchEvent(new Event('focus'));
      await settle(page);
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'center' });
      const kinds = [0, 33, 249, 489, 559, 672, 999].map((id) => page.text(`map-kind-${id}`));
      expect(kinds).toEqual(
        ['WORLD', 'DUNGEON', 'RAID', 'BATTLEGROUND', 'ARENA', 'TRANSPORT', 'WORLD'].map((kind) => `WORLD_EDITOR.MAP_KIND_${kind}`),
      );
      search.dispatchEvent(new Event('blur'));
      page.click('map-next');
      await settle(page);
      expect(page.viewer().mapDirectory()).toBe('Kalimdor');
      page.click('map-previous');
      page.click('map-previous');
      await settle(page);
      // round the start: the last map
      expect(page.viewer().mapDirectory()).toBe('Odd');
      // opened then closed right away: nothing to scroll
      search.dispatchEvent(new Event('focus'));
      search.dispatchEvent(new Event('blur'));
      await settle(page);
    });

    it('looks teleports up while typing', async () => {
      const { page } = await setup();
      page.type('tele-search', 'North');
      await new Promise((resolve) => setTimeout(resolve, 350));
      await settle(page);
      expect(mocks.service.searchTele).toHaveBeenCalledWith('North');
      expect(page.text('tele-7')).toContain('1 – Kalimdor');
      // not for a pasted .gps output
      mocks.service.searchTele.mockClear();
      page.type('tele-search', 'Map: 0 X: 1 Y: 2 Z: 3 Orientation: 0');
      await new Promise((resolve) => setTimeout(resolve, 350));
      expect(mocks.service.searchTele).not.toHaveBeenCalled();
    });

    it("draws a transport map's ship at its middle", async () => {
      mocks.client.getMaps.mockResolvedValue([
        ...MAPS,
        { id: 672, directory: 'Transport197347', name: 'Transport: The Skybreaker', instanceType: 0 },
      ]);
      mocks.service.loadTransports.mockImplementation((map: number) =>
        Promise.resolve(
          map === 672
            ? [
                { entry: 201580, name: 'The Skybreaker', displayId: 9150 },
                { entry: 1, name: 'Unknown', displayId: 1 },
              ]
            : [],
        ),
      );
      mocks.client.getGameObjectDisplay.mockImplementation((id: number) =>
        Promise.resolve(id === 9150 ? 'world\\wmo\\nd_alliancegunship_icecrown.wmo' : undefined),
      );
      const { page } = await setup();
      page.chooseMap(672);
      await settle(page);
      expect(page.viewer().buildings()).toEqual([
        expect.objectContaining({
          key: 'transport:201580',
          path: 'world\\wmo\\nd_alliancegunship_icecrown.wmo',
          position: { x: 0, y: 0, z: 0 },
        }),
      ]);
      // another map: no ship; a ship of a map left meanwhile is not drawn; errors are reported
      let late: (rows: unknown[]) => void = () => undefined;
      mocks.service.loadTransports.mockReturnValueOnce(new Promise((resolve) => (late = resolve)));
      page.chooseMap(1);
      page.chooseMap(0);
      late([{ entry: 201580, name: 'The Skybreaker', displayId: 9150 }]);
      await settle(page);
      expect(page.viewer().buildings()).toEqual([]);
      mocks.service.loadTransports.mockRejectedValueOnce(new Error('no gameobject_template'));
      page.chooseMap(1);
      await settle(page);
      expect(mocks.toastr.error).toHaveBeenCalledWith('no gameobject_template', 'World Editor');
    });

    it('ignores the zones of a map left while they loaded', async () => {
      let resolveZones: (zones: typeof ZONES) => void = () => undefined;
      mocks.client.getZones.mockImplementationOnce(() => new Promise((resolve) => (resolveZones = resolve)));
      const { page } = await setup();
      page.chooseMap(1);
      await settle(page);
      resolveZones(ZONES);
      await settle(page);
      expect(page.byId<HTMLInputElement>('zone-search').nativeElement.disabled).toBe(true);
    });

    it('falls back to the origin for maps missing from Map.dbc', async () => {
      const { page } = await setup({ params: { map: '999', x: 'abc', y: '2' } });
      expect(page.viewer().mapDirectory()).toBeUndefined();
      expect(page.viewer().focus()).toEqual({ x: 0, y: 0, z: 0 });
      expect(mocks.client.getMapTiles).not.toHaveBeenCalled();
    });

    it('finds maps by name, id or folder, picks one with Enter or a click, and closes on Escape', async () => {
      const { page } = await setup();
      const search = page.byId<HTMLInputElement>('map-search').nativeElement;
      expect(search.value).toBe('0 – Eastern Kingdoms');
      search.dispatchEvent(new Event('focus'));
      page.type('map-search', 'kalim');
      page.fixture.detectChanges();
      expect(page.byId('map-options').nativeElement.textContent).toContain('1 – Kalimdor');
      expect(page.byId('map-option-0', false)).toBeFalsy();
      search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await settle(page);
      expect(page.viewer().mapDirectory()).toBe('Kalimdor');
      expect(page.byId('map-options', false)).toBeFalsy();
      // nothing matches: Enter does nothing
      search.dispatchEvent(new Event('focus'));
      page.type('map-search', 'zzz');
      page.fixture.detectChanges();
      expect(page.byId('map-options').nativeElement.textContent).toContain('WORLD_EDITOR.NO_RESULTS');
      search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      search.dispatchEvent(new Event('focus'));
      search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      page.fixture.detectChanges();
      expect(page.byId('map-options', false)).toBeFalsy();
      expect(search.value).toBe('1 – Kalimdor');
    });

    it('loads a dungeon made of one building whole, looking at its middle', async () => {
      const { page } = await setup();
      mocks.client.getMapBuilding.mockImplementation((directory: string) =>
        Promise.resolve(
          directory === 'Kalimdor'
            ? { placement: {}, bounds: { minX: 100, maxX: 300, minY: -200, maxY: 0, minZ: 10, maxZ: 50 } }
            : undefined,
        ),
      );
      page.chooseMap(1);
      await settle(page);
      await settle(page);
      expect(page.viewer().focus()).toEqual({ x: 200, y: -100, z: 30 });
      expect(page.viewer().region()).toEqual({ minX: 50, maxX: 350, minY: -250, maxY: 50 });
      // its spawns everywhere in it
      await loadArea(page);
      expect(mocks.service.loadSpawns).toHaveBeenLastCalledWith(1, CENTER, 450, { minX: 50, maxX: 350, minY: -250, maxY: 50 });
      // an unreadable map, or back to one with terrain: not loaded whole
      mocks.client.getMapBuilding.mockRejectedValueOnce(new Error('bad wdt'));
      page.chooseMap(0);
      await settle(page);
      expect(page.viewer().region()).toBeUndefined();
      // read late, after another map was chosen: dropped
      let late: (value: unknown) => void = () => undefined;
      mocks.client.getMapBuilding.mockReturnValueOnce(new Promise((resolve) => (late = resolve)));
      page.chooseMap(1);
      page.chooseMap(0);
      await settle(page);
      late({ placement: {}, bounds: { minX: 0, maxX: 1, minY: 0, maxY: 1, minZ: 0, maxZ: 1 } });
      await settle(page);
      expect(page.viewer().region()).toBeUndefined();
    });

    it('switches maps', async () => {
      const { page } = await setup();
      mocks.client.getMapTiles.mockResolvedValue([]);
      page.chooseMap(1);
      await settle(page);
      expect(page.viewer().mapDirectory()).toBe('Kalimdor');
      expect(page.viewer().focus()).toEqual({ x: 0, y: 0, z: 0 });
    });

    it('teleports to game_tele locations', async () => {
      const { page } = await setup();
      page.submit('tele-search-btn');
      await settle(page);
      expect(mocks.service.searchTele).not.toHaveBeenCalled();

      page.type('tele-search', ' North ');
      page.submit('tele-search-btn');
      await settle(page);
      expect(mocks.service.searchTele).toHaveBeenCalledWith('North');
      page.click('tele-7');
      await settle(page);
      expect(page.viewer().mapDirectory()).toBe('Kalimdor');
      expect(page.viewer().focus()).toEqual({ x: 1, y: 2, z: 3 });
      expect(page.byId('tele-results', false)).toBeFalsy();
    });

    it('goes to the place of pasted .gps output, switching map if needed', async () => {
      const { page } = await setup();
      const gps = '[23:18:23] Map: 1 (Kalimdor) Zone: 14\n[23:18:23] X: -618.5 Y: -4251.7 Z: 38.7 Orientation: 4.5';
      const paste = (testId: string, text: string): ClipboardEvent => {
        const event = new Event('paste', { cancelable: true }) as ClipboardEvent;
        Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
        page.byId(testId).nativeElement.dispatchEvent(event);
        return event;
      };
      expect(paste('goto-x', gps).defaultPrevented).toBe(true);
      await settle(page);
      expect(page.viewer().mapDirectory()).toBe('Kalimdor');
      expect(page.viewer().focus()).toEqual({ x: -618.5, y: -4251.7, z: 38.7 });
      expect(page.byId<HTMLInputElement>('goto-y').nativeElement.value).toBe('-4251.7');

      // anything else pastes normally
      expect(paste('tele-search', 'Goldshire').defaultPrevented).toBe(false);
      const empty = new Event('paste', { cancelable: true });
      page.byId('goto-y').nativeElement.dispatchEvent(empty);
      expect(empty.defaultPrevented).toBe(false);

      // typed (or pasted as text) in the teleport search, same map
      page.type('tele-search', gps.replace('Map: 1', 'Map: 1').replace('-618.5', '-600'));
      page.submit('tele-search-btn');
      await settle(page);
      expect(page.viewer().focus()).toEqual({ x: -600, y: -4251.7, z: 38.7 });
      expect(mocks.service.searchTele).not.toHaveBeenCalled();
    });

    it('goes to typed coordinates', async () => {
      const { page } = await setup();
      const before = page.viewer().focus();
      page.type('goto-x', '5');
      page.submit('goto-btn');
      await settle(page);
      expect(page.viewer().focus()).toBe(before);

      page.type('goto-y', '6');
      page.submit('goto-btn');
      await settle(page);
      expect(page.viewer().focus()).toEqual({ x: 5, y: 6, z: 0 });

      page.type('goto-z', '7');
      page.submit('goto-btn');
      await settle(page);
      expect(page.viewer().focus()).toEqual({ x: 5, y: 6, z: 7 });
    });
  });

  describe('spawns & waypoints', () => {
    it('loads spawns and waypoints around the camera', async () => {
      const { page } = await setup();
      let resolve: (spawns: SpawnRecord[]) => void = () => undefined;
      mocks.service.loadSpawns.mockReturnValueOnce(new Promise((r) => (resolve = r)));
      page.viewer().centerChanged.emit(CENTER);
      await settle(page);
      expect(page.viewer().spawnsLoading()).toBe(true);

      resolve(SPAWNS);
      await settle(page);
      expect(page.viewer().spawnsLoading()).toBe(false);
      expect(mocks.service.loadSpawns).toHaveBeenCalledWith(0, CENTER);
      expect(mocks.service.loadWaypoints).toHaveBeenCalledWith([10]);
      expect(
        page
          .viewer()
          .spawns()
          .map((s) => s.label),
      ).toEqual([
        'Deputy Willem - Creature (GUID: 1, Entry: 101) · Path 10',
        '102 - Creature (GUID: 2, Entry: 102)',
        'Mailbox - GameObject (GUID: 3, Entry: 103)',
      ]);
      expect(page.viewer().paths()).toEqual([
        {
          key: 'path:10',
          label: 'Path 10',
          owners: ['Deputy Willem (1)'],
          closed: true,
          points: [
            { point: 1, position: { x: -8901, y: -101, z: 80 }, orientation: null, delay: 0, info: [] },
            {
              point: 2,
              position: { x: -8902, y: -102, z: 81 },
              orientation: null,
              delay: 1000,
              info: ['wait 1 s', 'run', 'script 50: talk', 'SAI: Willem - Say'],
            },
          ],
        },
      ]);
    });

    it('circles wandering creatures when asked', async () => {
      const { page } = await setup();
      await loadArea(page);
      const wander = () =>
        page
          .viewer()
          .spawns()
          .map((s) => s.wanderRadius);
      expect(wander()).toEqual([undefined, undefined, undefined]);
      page.click('view-toggle');
      page.fixture.detectChanges();
      const toggle = page.byId<HTMLInputElement>('view-wander').nativeElement;
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change'));
      page.fixture.detectChanges();
      expect(wander()).toEqual([undefined, 8, undefined]);
    });

    it('shows the event, phase and quests of spawns on hover, the first quest only unless Alt is held', async () => {
      mocks.service.loadSpawns.mockResolvedValue([
        spawn('creature', 1, { event: 12, phaseMask: 3, name: 'Headless Horseman' }),
        spawn('creature', 2, { event: 99, phaseMask: 1 }),
        spawn('gameobject', 3, { name: 'Wanted Poster' }),
        spawn('gameobject', 4),
      ]);
      mocks.service.loadEventNames.mockResolvedValue(new Map([[12, "Hallow's End"]]));
      mocks.service.loadQuests.mockResolvedValue([
        { type: 'gameobject', entry: 103, quest: 176, role: 'starts', title: 'Wanted: "Hogger"' },
        { type: 'gameobject', entry: 103, quest: 177, role: 'ends', title: '' },
        { type: 'gameobject', entry: 103, quest: 178, role: 'starts', title: 'Third' },
        { type: 'creature', entry: 102, quest: 7, role: 'ends', title: 'Seven' },
      ]);
      const { page } = await setup();
      page.click('filters-toggle');
      page.fixture.detectChanges();
      await loadArea(page);
      for (const id of ['event-12', 'event-99']) {
        const box = page.byId<HTMLInputElement>(id).nativeElement;
        box.checked = true;
        box.dispatchEvent(new Event('change'));
      }
      page.fixture.detectChanges();
      expect(mocks.service.loadQuests).toHaveBeenCalled();
      const details = (key: string) =>
        page
          .viewer()
          .spawns()
          .find((s) => s.key === key);
      expect(details('creature:1')?.details).toEqual(["Event 12 (Hallow's End)", 'Phase mask 3']);
      expect(details('creature:2')?.details).toEqual(['Event 99 (?)', 'Ends quest 7 (Seven)']);
      // gameobjects without a faction: anyone can use them
      expect(details('gameobject:3')?.details).toEqual([
        'Interact: everyone',
        'Starts quest 176 (Wanted: "Hogger")',
        '+2 more quests, hold Alt for more',
      ]);
      expect(details('gameobject:3')?.allDetails).toEqual([
        'Interact: everyone',
        'Starts quest 176 (Wanted: "Hogger")',
        'Ends quest 177 (?)',
        'Starts quest 178 (Third)',
      ]);
      expect(details('gameobject:4')?.details).toEqual(['Interact: everyone']);
    });

    it('tells who can interact with a spawn, and with Alt each race and the faction', async () => {
      const template = (id: number, faction: number, ourMask: number, friendMask: number, enemyMask: number) => ({
        id,
        faction,
        flags: 0,
        ourMask,
        friendMask,
        enemyMask,
        enemies: [],
        friends: [],
      });
      mocks.client.getFactions.mockResolvedValue({
        templates: new Map(
          [
            ...[1, 3, 4, 115, 1629].map((id) => template(id, id, 3, 2, 12)),
            ...[2, 5, 6, 116, 1610].map((id) => template(id, id, 5, 4, 10)),
            template(11, 72, 3, 2, 12),
            template(35, 31, 0, 1, 0),
          ].map((t) => [t.id, t]),
        ),
        factions: new Map([
          [72, { id: 72, name: 'Stormwind', reputationIndex: 19, raceMasks: [1100, 690, 1, 0], baseReputation: [3100, -42000, 4000, 0] }],
        ]),
      });
      mocks.service.loadSpawns.mockResolvedValue([
        spawn('creature', 1, { name: 'Guard', faction: 11 }),
        spawn('creature', 2, { name: 'Unknown', faction: 999 }),
        spawn('gameobject', 3, { name: 'Door', faction: 35 }),
      ]);
      const { page } = await setup();
      await loadArea(page);
      const of = (key: string) =>
        page
          .viewer()
          .spawns()
          .find((s) => s.key === key);
      expect(of('creature:1')?.details).toEqual(['Interact: Alliance (Friendly) · Horde no, (Hated)', 'hold Alt for more']);
      expect(of('creature:1')?.allDetails).toContain('Faction template 11 (Stormwind)');
      expect(of('creature:1')?.allDetails).toContain('  Human: Friendly (4000)');
      // a template the client doesn't know: nothing said
      expect(of('creature:2')?.details).toBeUndefined();
      expect(of('gameobject:3')?.details?.[0]).toBe('Interact: everyone (Friendly)');
    });

    it('loads the spawns around the view once the maps are known, when the view reported its position first', async () => {
      let resolveMaps: (maps: typeof MAPS) => void = () => undefined;
      mocks.client.getMaps.mockReturnValue(new Promise((resolve) => (resolveMaps = resolve)));
      const { page } = await setup({ lastView: JSON.stringify({ mapId: 0, ...CENTER }) });
      page.viewer().centerChanged.emit(CENTER);
      await settle(page);
      expect(mocks.service.loadSpawns).not.toHaveBeenCalled();
      resolveMaps(MAPS);
      await settle(page);
      expect(mocks.service.loadSpawns).toHaveBeenCalledWith(0, CENTER);
    });

    it('draws the area triggers of the map, named with what the database does with them', async () => {
      const { page } = await setup();
      await settle(page);
      expect(mocks.client.getAreaTriggers).toHaveBeenCalledWith(0);
      expect(mocks.service.loadAreaTriggerInfo).toHaveBeenCalledWith([45, 46]);
      expect(page.viewer().areaTriggers()).toEqual([
        {
          key: 'areatrigger:45',
          label: "Area trigger 45\nInn: Lion's Pride Inn",
          position: { x: -9460, y: 30, z: 60 },
          radius: 10,
          box: undefined,
        },
        {
          key: 'areatrigger:46',
          label: 'Area trigger 46',
          position: { x: -9400, y: 30, z: 60 },
          radius: 0,
          box: { length: 5, width: 4, height: 3, orientation: 1 },
        },
      ]);
      page.click('layer-area-triggers');
      page.fixture.detectChanges();
      expect(page.viewer().areaTriggers()).toEqual([]);

      // another map; a failure shows an error and no triggers
      page.chooseMap(1);
      await settle(page);
      mocks.client.getAreaTriggers.mockRejectedValueOnce(new Error('bad dbc'));
      page.chooseMap(0);
      await settle(page);
      expect(mocks.toastr.error).toHaveBeenCalledWith('bad dbc', 'World Editor');
    });

    it('shows the area triggers without their database details when those can not be read', async () => {
      mocks.service.loadAreaTriggerInfo.mockRejectedValue(new Error("Table 'areatrigger_tavern' doesn't exist"));
      const { page } = await setup();
      await settle(page);
      expect(page.viewer().areaTriggers()[0].label).toBe('Area trigger 45');
    });

    it('keeps the area triggers of the map shown last when maps change quickly', async () => {
      const { page } = await setup();
      await settle(page);
      let resolveFirst: (value: unknown[]) => void = () => undefined;
      mocks.client.getAreaTriggers.mockReturnValueOnce(new Promise((resolve) => (resolveFirst = resolve)));
      page.chooseMap(1);
      await settle(page);
      page.chooseMap(0);
      await settle(page);
      resolveFirst([{ id: 99, mapId: 1, x: 0, y: 0, z: 0, radius: 1 }]);
      await settle(page);
      expect(
        page
          .viewer()
          .areaTriggers()
          .map((t) => t.key),
      ).toEqual(['areatrigger:45', 'areatrigger:46']);
    });

    it('filters layers', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.click('layer-creatures');
      page.fixture.detectChanges();
      expect(
        page
          .viewer()
          .spawns()
          .map((s) => s.key),
      ).toEqual(['gameobject:3']);
      page.click('layer-creatures');
      page.click('layer-gameobjects');
      page.click('layer-waypoints');
      page.fixture.detectChanges();
      expect(
        page
          .viewer()
          .spawns()
          .map((s) => s.key),
      ).toEqual(['creature:1', 'creature:2']);
      expect(page.viewer().paths()).toEqual([]);
    });

    it('hides event spawns, triggers and other phases with the filters, along with the paths they walk', async () => {
      mocks.service.loadSpawns.mockResolvedValue([
        ...SPAWNS,
        spawn('creature', 4, { event: 12, pathId: 10, name: 'Headless Horseman' }),
        spawn('creature', 5, { event: 1, name: 'Flame Keeper' }),
        spawn('creature', 6, { trigger: true, name: '[DND] Bunny', phaseMask: 1 }),
        spawn('gameobject', 7, { phaseMask: 2 }),
      ]);
      mocks.service.loadEventNames.mockResolvedValue(new Map([[12, "Hallow's End"]]));
      const { page } = await setup();
      const keys = (): string[] =>
        page
          .viewer()
          .spawns()
          .map((s) => s.key);
      page.click('filters-toggle');
      page.fixture.detectChanges();
      expect(page.text('no-events')).toBe('WORLD_EDITOR.NO_EVENTS');
      await loadArea(page);

      expect(mocks.service.loadEventNames).toHaveBeenCalledWith([0, 0, 0, 12, 1, 0, 0]);
      expect(keys()).toEqual(['creature:1', 'creature:2', 'gameobject:3', 'gameobject:7']);
      expect(page.text('hidden-count')).toBe('3');
      expect(page.text('events')).toContain('Event 1');
      expect(page.text('events')).toContain("Hallow's End");

      const check = (id: string, checked: boolean): void => {
        const box = page.byId<HTMLInputElement>(id).nativeElement;
        box.checked = checked;
        box.dispatchEvent(new Event('change'));
        page.fixture.detectChanges();
      };
      check('event-12', true);
      expect(keys()).toContain('creature:4');
      check('event-12', false);
      expect(keys()).not.toContain('creature:4');
      page.click('events-all');
      page.fixture.detectChanges();
      expect(keys()).toEqual(expect.arrayContaining(['creature:4', 'creature:5']));
      expect(JSON.parse(localStorage.getItem('keira3.worldEditor.filters') as string).events).toEqual([1, 12]);

      // path 10 is still walked by creature 1 when the event is hidden; hiding both hides the path
      page.click('events-none');
      page.type('filter-search', 'horseman');
      page.fixture.detectChanges();
      expect(keys()).toEqual([]);
      expect(page.viewer().paths()).toEqual([]);
      page.type('filter-search', '');
      page.fixture.detectChanges();

      const gameobject = page
        .viewer()
        .spawns()
        .find((s) => s.key === 'gameobject:7');
      expect(gameobject?.label).toBe('Spawn 7 - GameObject (GUID: 7, Entry: 107)');
      expect(gameobject?.details).toEqual(['Phase mask 2', 'Interact: everyone']);
      check('filter-triggers', true);
      expect(keys()).toContain('creature:6');
      check('filter-phases', false);
      expect(keys()).not.toContain('gameobject:7');
      expect(page.text('hidden-count')).toBe('3');
    });

    it('waits for the maps before loading spawns', async () => {
      mocks.client.getMaps.mockReturnValue(new Promise(() => undefined));
      const { page } = await setup();
      await loadArea(page);
      expect(mocks.service.loadSpawns).not.toHaveBeenCalled();
    });

    it('ignores spawn results of an older camera position', async () => {
      const { page } = await setup();
      let resolveFirst: (spawns: SpawnRecord[]) => void = () => undefined;
      mocks.service.loadSpawns.mockReturnValueOnce(new Promise((r) => (resolveFirst = r))).mockResolvedValueOnce([SPAWNS[2]]);
      page.viewer().centerChanged.emit(CENTER);
      page.viewer().centerChanged.emit({ x: 0, y: 0, z: 0 });
      await settle(page);
      resolveFirst(SPAWNS);
      await settle(page);
      expect(
        page
          .viewer()
          .spawns()
          .map((s) => s.key),
      ).toEqual(['gameobject:3']);
    });

    it('reports errors while loading spawns', async () => {
      mocks.service.loadSpawns.mockRejectedValue(new Error('Table missing'));
      const { page } = await setup();
      await loadArea(page);
      expect(mocks.toastr.error).toHaveBeenCalledWith('Table missing', 'World Editor');
    });
  });

  describe('context menu', () => {
    const rightClick = async (page: Page, key: string): Promise<void> => {
      page.viewer().contextRequested.emit({ key, x: 120, y: 80 });
      await settle(page);
    };

    it('opens the creature, its SAI or the gameobject from a right-click, and copies the GUID', async () => {
      const { page } = await setup();
      await loadArea(page);
      await rightClick(page, 'creature:1');
      const menu = page.byId('context-menu').nativeElement as HTMLElement;
      expect(menu.style.left).toBe('120px');
      expect(menu.textContent).toContain('Deputy Willem - Creature (GUID: 1, Entry: 101)');
      expect(page.viewer().selectedKey()).toBe('creature:1');
      expect(page.byId('context-gameobject', false)).toBeFalsy();
      page.click('context-creature');
      expect(links.openCreature).toHaveBeenCalledWith(101, 'Deputy Willem');
      page.fixture.detectChanges();
      expect(page.byId('context-menu', false)).toBeFalsy();

      await rightClick(page, 'creature:1');
      page.click('context-sai');
      expect(links.openCreatureSai).toHaveBeenCalledWith(101, 'Deputy Willem');

      await rightClick(page, 'gameobject:3');
      page.click('context-gameobject');
      expect(links.openGameObject).toHaveBeenCalledWith(103, 'Mailbox');
      // gameobjects have SAI too
      await rightClick(page, 'gameobject:3');
      page.click('context-sai');
      expect(links.openGameObjectSai).toHaveBeenCalledWith(103, 'Mailbox');

      await rightClick(page, 'gameobject:3');
      page.click('context-copy-guid');
      expect(mocks.clipboard.copyFromContent).toHaveBeenCalledWith('3');
    });

    it('names the AI and script, and opens the loot of creatures and chests', async () => {
      mocks.service.loadSpawns.mockResolvedValue([
        spawn('creature', 1, { name: 'Wolf', aiName: 'SmartAI', scriptName: 'npc_wolf', loot: { loot: 5, skinning: 7 } }),
        spawn('gameobject', 3, { name: 'Chest', loot: { loot: 9 } }),
      ]);
      const { page } = await setup();
      await loadArea(page);
      await rightClick(page, 'creature:1');
      expect(page.text('context-ai-name')).toBe('AIName: SmartAI');
      expect(page.text('context-script-name')).toBe('ScriptName: npc_wolf');
      expect(page.byId('context-loot-pickpocketing', false)).toBeFalsy();
      expect(page.text('context-loot-skinning')).toContain('(7)');
      page.click('context-loot-skinning');
      expect(links.openLoot).toHaveBeenCalledWith('skinning', 101, 'Wolf');
      await rightClick(page, 'gameobject:3');
      expect(page.byId('context-ai-name', false)).toBeFalsy();
      page.click('context-loot-gameobject');
      expect(links.openLoot).toHaveBeenCalledWith('gameobject', 103, 'Chest');
    });

    it('goes through teleporting area triggers and opens their SAI', async () => {
      mocks.service.loadTeleports.mockResolvedValue([{ id: 45, name: 'Inside', map: 1, x: 1, y: 2, z: 3 }]);
      const { page } = await setup();
      await loadArea(page);
      await rightClick(page, 'areatrigger:46');
      expect(page.byId('context-trigger-go', false)).toBeFalsy();
      page.click('context-trigger-sai');
      expect(links.openAreaTriggerSai).toHaveBeenCalledWith(46);
      await rightClick(page, 'areatrigger:45');
      expect(page.text('context-trigger-go')).toContain('1 – Kalimdor');
      page.click('context-trigger-go');
      await settle(page);
      expect(page.viewer().focus()).toEqual({ x: 1, y: 2, z: 3 });
      expect(page.viewer().mapDirectory()).toBe('Kalimdor');
      // a map missing from Map.dbc is named by its id
      expect((page.fixture.componentInstance as unknown as { mapLabel(id: number): string }).mapLabel(999)).toBe('999');
    });

    it('lists the spawns of a pool, selects the loaded ones and goes to the others', async () => {
      mocks.service.loadPools.mockResolvedValue([{ type: 'creature', guid: 1, pool: 7, chance: 0, maxLimit: 1, description: 'Rares' }]);
      let resolveMembers: (members: unknown[]) => void = () => undefined;
      mocks.service.loadPoolMembers.mockReturnValueOnce(new Promise((resolve) => (resolveMembers = resolve)));
      const { page } = await setup();
      await loadArea(page);
      await rightClick(page, 'creature:1');
      expect(page.text('context-pool')).toBe('WORLD_EDITOR.POOL 7');
      expect(page.byId('context-pool-loading')).toBeTruthy();
      resolveMembers([
        { type: 'creature', guid: 1, entry: 101, name: 'Deputy Willem', map: 0, x: -8901, y: -100, z: 80 },
        { type: 'creature', guid: 2, entry: 102, name: '', map: 0, x: -8902, y: -100, z: 80 },
        { type: 'gameobject', guid: 50, entry: 150, name: 'Far', map: 0, x: 100, y: 200, z: 5 },
        { type: 'gameobject', guid: 51, entry: 151, name: 'Elsewhere', map: 1, x: 1, y: 1, z: 1 },
      ]);
      await settle(page);
      expect(page.text('context-pool-select')).toContain('(2 / 4)');
      expect(page.byId<HTMLButtonElement>('context-pool-member-3').nativeElement.disabled).toBe(true);
      page.click('context-pool-select');
      await settle(page);
      expect(page.viewer().selectedKey()).toBe('creature:1');
      expect(page.viewer().groupKeys()).toEqual(['creature:2']);
      // from the pool's label: going to a member not loaded
      mocks.service.loadPoolMembers.mockResolvedValue([
        { type: 'gameobject', guid: 50, entry: 150, name: 'Far', map: 0, x: 100, y: 200, z: 5 },
      ]);
      await rightClick(page, 'pool:7');
      page.click('context-pool-member-0');
      await settle(page);
      expect(page.viewer().focus()).toEqual({ x: 100, y: 200, z: 5 });
      // closed before the members came
      let late: (members: unknown[]) => void = () => undefined;
      mocks.service.loadPoolMembers.mockReturnValueOnce(new Promise((resolve) => (late = resolve)));
      await rightClick(page, 'pool:7');
      document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      late([]);
      await settle(page);
      // a spawn in no pool, and a pool that can't be read
      await rightClick(page, 'creature:2');
      expect(page.byId('context-pool', false)).toBeFalsy();
      mocks.service.loadPoolMembers.mockRejectedValueOnce(new Error('no pool_creature'));
      await rightClick(page, 'pool:8');
      expect(mocks.toastr.error).toHaveBeenCalledWith('no pool_creature', 'World Editor');
    });

    it('copies .go commands to a place on the ground and to the player marker', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.viewer().contextRequested.emit({
        key: 'ground',
        x: 10,
        y: 10,
        label: '1 2 3',
        position: { x: 1066.6667, y: -533.3333, z: 3 },
        marker: { x: 5, y: 6, z: 7 },
      });
      await settle(page);
      expect(page.viewer().selectedKey()).toBeUndefined();
      page.click('context-copy-go-xy');
      expect(mocks.clipboard.copyFromContent).toHaveBeenLastCalledWith('.go xyz 1066.6667 -533.3333');
      page.viewer().contextRequested.emit({ key: 'ground', x: 10, y: 10, label: '1 2 3', position: { x: 1066.6667, y: -533.3333, z: 3 } });
      await settle(page);
      expect(page.byId('context-copy-marker', false)).toBeFalsy();
      page.click('context-copy-go-grid');
      expect(mocks.clipboard.copyFromContent).toHaveBeenLastCalledWith('.go grid 33.5000 30.5000 0');
      page.viewer().contextRequested.emit({ key: 'ground', x: 10, y: 10, label: '1 2 3', marker: { x: 5, y: 6, z: 7 } });
      await settle(page);
      page.click('context-copy-marker');
      expect(mocks.clipboard.copyFromContent).toHaveBeenLastCalledWith('.go xyz 5.0000 6.0000 7.0000 0');
    });

    it('offers the (future) waypoint editor for waypoints, and closes on a press elsewhere or Escape', async () => {
      const { page } = await setup();
      await loadArea(page);
      await rightClick(page, 'path:10#2');
      expect(page.text('context-menu')).toContain('WORLD_EDITOR.PATH 10 · #2');
      expect(page.byId<HTMLButtonElement>('context-waypoints').nativeElement.disabled).toBe(true);
      // pressing inside the menu keeps it
      page.byId('context-waypoints').nativeElement.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      page.fixture.detectChanges();
      expect(page.byId('context-menu', false)).toBeTruthy();
      document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      page.fixture.detectChanges();
      expect(page.byId('context-menu', false)).toBeFalsy();

      await rightClick(page, 'creature:2');
      page.key('Escape');
      page.fixture.detectChanges();
      expect(page.byId('context-menu', false)).toBeFalsy();
      // something that vanished meanwhile: an empty menu
      await rightClick(page, 'creature:404');
      expect(page.byId('context-copy-guid', false)).toBeFalsy();
    });

    it('cannot open other editors when the app provides no links', async () => {
      const { page } = await setup({ links: false });
      await loadArea(page);
      await rightClick(page, 'creature:1');
      expect(page.byId<HTMLButtonElement>('context-creature').nativeElement.disabled).toBe(true);
      expect(page.byId<HTMLButtonElement>('context-sai').nativeElement.disabled).toBe(true);
    });
  });

  describe('coming back', () => {
    it('finds everything as it was after leaving the editor (e.g. for a creature from the right-click menu)', async () => {
      const { page, fixture } = await setup();
      await loadArea(page);
      page.chooseZone(12);
      page.click('layer-gameobjects');
      page.click('filters-toggle');
      page.click('tool-place-creature');
      await settle(page);
      page.type('place-entry', '197');
      await settle(page);
      page.viewer().picked.emit({ type: 'ground', position: { x: 1, y: 2, z: 3 } });
      await settle(page);
      page.click('tool-probe');
      page.viewer().picked.emit({ type: 'ground', position: { x: 5, y: 5, z: 5 } });
      await settle(page);
      expect(page.pendingLines()).toHaveLength(1);
      fixture.destroy();

      // the editor opened again
      const again = new Page(TestBed.createComponent(WorldEditorComponent));
      await settle(again);
      expect(again.pendingLines()).toHaveLength(1);
      expect(again.byId<HTMLButtonElement>('undo').nativeElement.disabled).toBe(false);
      expect(again.byId<HTMLInputElement>('layer-gameobjects').nativeElement.checked).toBe(false);
      expect(again.byId('filters', false)).toBeTruthy();
      expect(again.byId('tool-probe').nativeElement.classList).toContain('btn-primary');
      expect(again.viewer().probe()).toEqual(expect.objectContaining({ from: { x: 5, y: 5, z: 5 } }));
      expect(again.byId<HTMLInputElement>('zone-search').nativeElement.value).toBe('12 – Elwynn Forest');
    });
  });

  describe('path & line of sight', () => {
    it('asks the view for the path, sight and attack position from A to C, and shows the answer', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.click('tool-probe');
      page.fixture.detectChanges();
      expect(page.text('probe')).toContain('WORLD_EDITOR.PROBE_PICK_A');
      expect(page.viewer().probe()).toBeUndefined();
      const a = { x: 1, y: 2, z: 3 };
      const c = { x: 10, y: 2, z: 3 };
      page.viewer().picked.emit({ type: 'ground', position: a });
      await settle(page);
      expect(page.viewer().probe()).toEqual({ from: a, to: undefined, range: 30, height: 2 });
      expect(page.text('probe')).toContain('WORLD_EDITOR.PROBE_PICK_C');
      page.viewer().picked.emit({ type: 'ground', position: c });
      await settle(page);
      expect(page.viewer().probe()).toEqual({ from: a, to: c, range: 30, height: 2 });

      const range = page.byId<HTMLSelectElement>('probe-range-preset').nativeElement;
      range.value = '5';
      range.dispatchEvent(new Event('change'));
      const custom = page.byId<HTMLInputElement>('probe-range').nativeElement;
      custom.value = '12';
      custom.dispatchEvent(new Event('change'));
      custom.value = '-3';
      custom.dispatchEvent(new Event('change'));
      const height = page.byId<HTMLInputElement>('probe-height').nativeElement;
      height.value = '3.5';
      height.dispatchEvent(new Event('change'));
      height.value = 'x';
      height.dispatchEvent(new Event('change'));
      page.fixture.detectChanges();
      expect(page.viewer().probe()).toEqual({ from: a, to: c, range: 12, height: 3.5 });
      expect(range.selectedOptions[0].textContent?.trim()).toBe('12');

      // the answers
      page.viewer().probed.emit({ from: a });
      page.fixture.detectChanges();
      expect(page.byId('probe-result', false)).toBeFalsy();
      page.viewer().probed.emit({
        from: a,
        to: c,
        path: [a, c],
        length: 9,
        attackFrom: { x: 4, y: 2, z: 3 },
        attackDistance: 6,
        walkToAttack: 3,
      });
      page.fixture.detectChanges();
      const result = page.text('probe-result');
      expect(result).toContain('9.0 WORLD_EDITOR.YARDS');
      expect(result).toContain('WORLD_EDITOR.LOS_CLEAR');
      expect(result).toContain('4.0 2.0 3.0');
      page.click('probe-copy-go');
      expect(mocks.clipboard.copyFromContent).toHaveBeenCalledWith('.go xyz 4.00 2.00 3.00 0');
      for (const [answer, text] of [
        [{ noNavMesh: true }, 'WORLD_EDITOR.NO_NAVMESH'],
        [{ tooFar: true }, 'WORLD_EDITOR.PROBE_TOO_FAR'],
        [{ blockedAt: { x: 5, y: 2, z: 4 } }, 'WORLD_EDITOR.LOS_BLOCKED'],
      ] as const) {
        page.viewer().probed.emit({ from: a, to: c, ...answer });
        page.fixture.detectChanges();
        expect(page.text('probe-result')).toContain(text);
        expect(page.text('probe-result')).toContain('WORLD_EDITOR.NO_ATTACK_POSITION');
      }
      page.viewer().probed.emit({ from: a, to: c });
      page.fixture.detectChanges();
      expect(page.text('probe-result')).toContain('WORLD_EDITOR.NO_PATH');

      // a third click starts again from A; Clear forgets everything; other tools ask nothing
      page.viewer().picked.emit({ type: 'spawn', key: 'creature:1', position: c });
      await settle(page);
      expect(page.viewer().probe()).toEqual({ from: c, to: undefined, range: 12, height: 3.5 });
      page.click('probe-clear');
      page.fixture.detectChanges();
      expect(page.viewer().probe()).toBeUndefined();
      page.viewer().picked.emit({ type: 'ground', position: a });
      page.click('tool-select');
      page.fixture.detectChanges();
      expect(page.viewer().probe()).toBeUndefined();
    });
  });

  describe('mmaps settings', () => {
    const config = {
      walkableSlopeAngle: 60,
      walkableHeight: 6,
      walkableClimb: 6,
      walkableRadius: 2,
      verticesPerMapEdge: 2000,
      verticesPerTileEdge: 80,
      cellSizeHorizontal: 0.2667,
      cellSizeVertical: 0.2667,
      maxSimplificationError: 1.8,
    };
    const tile = (file = '0004832.mmtile', extra: Partial<NavMeshTileInfo> = {}): NavMeshTileInfo => ({
      file,
      mapId: 0,
      tile: { tx: 32, ty: 48 },
      config,
      missing: false,
      ...extra,
    });

    it('shows the settings of the mmtile under the camera and the mmaps-config.yaml override for new values', async () => {
      const { page } = await setup();
      expect(page.byId('mmap-tile', false)).toBeFalsy();
      page.viewer().navMeshTileChanged.emit(tile());
      page.fixture.detectChanges();
      expect(page.text('mmap-tile')).toContain('0004832.mmtile');
      expect(page.byId<HTMLInputElement>('mmap-walkableClimb').nativeElement.value).toBe('6');
      expect(page.text('mmap-hint')).toBe('WORLD_EDITOR.MMAP_EDIT_HINT');

      const set = (key: string, value: string) => {
        const input = page.byId<HTMLInputElement>('mmap-' + key).nativeElement;
        input.value = value;
        input.dispatchEvent(new Event('change'));
        page.fixture.detectChanges();
      };
      set('walkableClimb', '4');
      set('walkableSlopeAngle', '60'); // the tile's own value: no change
      set('cellSizeVertical', 'abc');
      expect(page.text('mmap-yaml')).toBe(
        'mmapsConfig:\n  meshSettings:\n    mapsOverrides:\n      "0":\n        tilesOverrides:\n          "48,32":\n            walkableClimb: 4',
      );
      const scope = page.byId<HTMLSelectElement>('mmap-scope').nativeElement;
      scope.value = 'map';
      scope.dispatchEvent(new Event('change'));
      page.fixture.detectChanges();
      expect(page.text('mmap-yaml')).toBe('mmapsConfig:\n  meshSettings:\n    mapsOverrides:\n      "0":\n        walkableClimb: 4');
      scope.value = 'tile';
      scope.dispatchEvent(new Event('change'));

      page.click('mmap-copy');
      expect(mocks.clipboard.copyFromContent).toHaveBeenCalledWith(expect.stringContaining('walkableClimb: 4'));
      const createObjectURL = vi.fn().mockReturnValue('blob:yaml');
      const revokeObjectURL = vi.fn();
      Object.assign(URL, { createObjectURL, revokeObjectURL });
      const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
      page.click('mmap-download');
      expect(click).toHaveBeenCalled();
      expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:yaml');
      click.mockRestore();

      // clearing a field, resetting, and moving to another tile forget the changes
      set('walkableClimb', '');
      expect(page.byId('mmap-yaml', false)).toBeFalsy();
      expect(page.byId<HTMLInputElement>('mmap-walkableClimb').nativeElement.value).toBe('6');
      set('walkableRadius', '3');
      page.click('mmap-reset');
      page.fixture.detectChanges();
      expect(page.byId('mmap-yaml', false)).toBeFalsy();
      set('walkableRadius', '3');
      page.viewer().navMeshTileChanged.emit(tile());
      page.fixture.detectChanges();
      expect(page.byId('mmap-yaml', false)).toBeTruthy();
      page.viewer().navMeshTileChanged.emit(tile('0004833.mmtile'));
      page.fixture.detectChanges();
      expect(page.byId('mmap-yaml', false)).toBeFalsy();
    });

    it('says when there is no mmtile, or it is still loading', async () => {
      const { page } = await setup();
      page.viewer().navMeshTileChanged.emit(tile('0004832.mmtile', { config: undefined, missing: true }));
      page.fixture.detectChanges();
      expect(page.text('mmap-missing')).toBe('WORLD_EDITOR.MMTILE_MISSING_HELP');
      page.viewer().navMeshTileChanged.emit(tile('0004832.mmtile', { config: undefined }));
      page.fixture.detectChanges();
      expect(page.byId('mmap-loading')).toBeTruthy();
      page.viewer().navMeshTileChanged.emit(undefined);
      page.fixture.detectChanges();
      expect(page.byId('mmap-tile', false)).toBeFalsy();
    });

    it('rebuilds the tile with the new values over the real one, shows how it goes, and clears it', async () => {
      const { page } = await setup();
      const viewer = page.viewer();
      viewer.navMeshTileChanged.emit(tile());
      page.fixture.detectChanges();
      expect(page.byId('mmap-preview-state', false)).toBeFalsy();
      expect(page.byId('mmap-preview-clear', false)).toBeFalsy();
      const input = page.byId<HTMLInputElement>('mmap-walkableClimb').nativeElement;
      input.value = '4';
      input.dispatchEvent(new Event('change'));
      page.fixture.detectChanges();

      page.click('mmap-preview');
      page.fixture.detectChanges();
      expect(viewer.navMeshRebuild()).toEqual({ tile: { tx: 32, ty: 48 }, config: { ...config, walkableClimb: 4 } });
      expect(page.text('mmap-preview-state')).toBe('WORLD_EDITOR.MMAP_PREVIEW_READING');
      expect(page.byId<HTMLButtonElement>('mmap-preview').nativeElement.disabled).toBe(true);
      viewer.navMeshRebuilt.emit({ status: 'building', done: 4, total: 16, triangles: 0 });
      page.fixture.detectChanges();
      expect(page.text('mmap-preview-state')).toBe('4 / 16');
      expect(page.byId('mmap-preview-state').nativeElement.querySelector<HTMLElement>('.progress-bar')?.style.width).toBe('25%');
      viewer.navMeshRebuilt.emit({ status: 'done', done: 0, total: 0, triangles: 1234, source: 'server' });
      page.fixture.detectChanges();
      expect(page.text('mmap-preview-state')).toContain('WORLD_EDITOR.MMAP_PREVIEW_DONE_SERVER');
      viewer.navMeshRebuilt.emit({ status: 'done', done: 0, total: 0, triangles: 1234, source: 'client' });
      page.fixture.detectChanges();
      expect(page.text('mmap-preview-state')).not.toContain('WORLD_EDITOR.MMAP_PREVIEW_DONE_SERVER');
      expect(page.text('mmap-preview-state')).toContain('WORLD_EDITOR.MMAP_PREVIEW_DONE');
      expect(page.byId<HTMLButtonElement>('mmap-preview').nativeElement.disabled).toBe(false);
      page.click('mmap-hide-real');
      page.fixture.detectChanges();
      expect(viewer.hideRealNavMesh()).toBe(true);
      viewer.navMeshRebuilt.emit({ status: 'failed', done: 0, total: 0, triangles: 0 });
      page.fixture.detectChanges();
      expect(page.text('mmap-preview-state')).toBe('WORLD_EDITOR.MMAP_PREVIEW_FAILED');

      page.click('mmap-preview-clear');
      page.fixture.detectChanges();
      expect(viewer.navMeshRebuild()).toBeUndefined();
      expect(viewer.hideRealNavMesh()).toBe(false);
      expect(page.byId('mmap-preview-state', false)).toBeFalsy();

      // hiding the navigation mesh drops the preview too
      page.click('mmap-preview');
      page.fixture.detectChanges();
      viewer.navMeshTileChanged.emit(undefined);
      page.fixture.detectChanges();
      expect(viewer.navMeshRebuild()).toBeUndefined();
    });
  });

  describe('help & speed', () => {
    it('lists the mouse controls and the keys bound to every action, and saves the camera speed', async () => {
      const { page } = await setup();
      const help = page.text('controls-help');
      expect(help).toContain('WORLD_EDITOR.HELP_SHIFT_WHEEL');
      expect(help).toContain('W / ↑');
      expect(help).toContain('Ctrl+Y / Ctrl+Shift+Z');
      page.viewer().speedChanged.emit(2.5);
      page.fixture.detectChanges();
      expect(page.viewer().navigation().speed).toBe(2.5);
      // an action without keys isn't listed
      page.click('controls-toggle');
      page.fixture.detectChanges();
      page.click('unbind-cancel-Escape');
      page.fixture.detectChanges();
      expect(page.text('controls-help')).not.toContain('WORLD_EDITOR.CONTROL_CANCEL');
    });
  });

  describe('selecting & moving', () => {
    it('selects spawns and waypoints by clicking them, and deselects on the ground', async () => {
      const { page } = await setup();
      await loadArea(page);

      page.viewer().picked.emit({ type: 'spawn', key: 'creature:1', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(page.text('selected-title')).toContain('Deputy Willem');
      expect(page.text('selected-title')).toContain('path 10');
      expect(page.placementValue('x')).toBe(-8901);
      expect(page.viewer().editableKey()).toBe('creature:1');

      page.viewer().picked.emit({ type: 'waypoint', key: 'path:10#2', pathKey: 'path:10', point: 2, position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(page.text('selected-title')).toContain('Path 10');
      expect(page.text('selected-path-owners')).toBe('WORLD_EDITOR.WALKED_BY: Deputy Willem (1)');
      expect(page.placementValue('z')).toBe(81);
      expect(
        Array.from((page.byId('selected-waypoint-info').nativeElement as HTMLElement).querySelectorAll('li')).map((li) =>
          li.textContent?.trim(),
        ),
      ).toEqual(['wait 1 s', 'run', 'script 50: talk', 'SAI: Willem - Say']);
      expect(page.viewer().paths()[0].points[1].info).toEqual(['wait 1 s', 'run', 'script 50: talk', 'SAI: Willem - Say']);

      page.viewer().picked.emit({ type: 'ground', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(page.byId('nothing-selected')).toBeTruthy();
      expect(page.viewer().editableKey()).toBeUndefined();
      page.viewer().picked.emit({ type: 'segment', pathKey: 'path:10', from: 1, to: 2, position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(page.viewer().selectedKey()).toBeUndefined();
    });

    it('turns gizmo moves into pending updates', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.viewer().picked.emit({ type: 'spawn', key: 'creature:1', position: { x: 0, y: 0, z: 0 } });
      await settle(page);

      page.viewer().objectMoved.emit({ key: 'creature:1', position: { x: 1.123456, y: 2, z: 3 }, orientation: 1.5 });
      page.viewer().objectMoved.emit({ key: 'path:10#1', position: { x: 4, y: 5, z: 6 }, orientation: 0 });
      page.viewer().objectMoved.emit({ key: 'unknown', position: { x: 4, y: 5, z: 6 }, orientation: 0 });
      await settle(page);

      expect(page.pendingLines()).toEqual(['Move creature 1 (Deputy Willem)', 'Move waypoint 10 #1']);
      expect(page.placementValue('x')).toBe(1.1235);
      expect(page.placementValue('o')).toBe(1.5);
      expect(page.text('pending-sql')).toContain('UPDATE `creature` SET `position_x` = 1.1235');
    });

    it('applies typed coordinates', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.viewer().picked.emit({ type: 'spawn', key: 'gameobject:3', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      page.type('placement-z', '99');
      page.submit('placement-apply');
      await settle(page);
      expect(page.pendingLines()).toEqual(['Move gameobject 3 (Mailbox)']);
      expect(
        page
          .viewer()
          .spawns()
          .find((s) => s.key === 'gameobject:3')?.position.z,
      ).toBe(99);
    });

    it('switches between moving and rotating, and toggles snapping', async () => {
      const { page } = await setup();
      page.click('gizmo-rotate');
      page.fixture.detectChanges();
      expect(page.viewer().gizmoMode()).toBe('rotate');
      page.click('gizmo-translate');
      page.fixture.detectChanges();
      expect(page.viewer().gizmoMode()).toBe('translate');
      expect(page.viewer().snapToGround()).toBe(true);

      const snap = page.byId<HTMLSelectElement>('snap-mode').nativeElement;
      for (const [mode, ground, wall] of [
        ['wall', false, true],
        ['off', false, false],
      ] as const) {
        snap.value = mode;
        snap.dispatchEvent(new Event('change'));
        page.fixture.detectChanges();
        expect(page.viewer().snapToGround()).toBe(ground);
        expect(page.viewer().snapToWall()).toBe(wall);
      }
    });
  });

  describe('placing', () => {
    it('places creatures with the next free guids', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.click('tool-place-creature');
      await settle(page);
      expect(page.viewer().groundOnly()).toBe(true);

      page.viewer().picked.emit({ type: 'ground', position: { x: 1, y: 2, z: 3 } });
      await settle(page);
      expect(mocks.toastr.warning).toHaveBeenCalledWith('Enter the creature entry to place first.', 'World Editor');

      page.type('place-entry', '197');
      page.byId('place-entry').nativeElement.dispatchEvent(new Event('change'));
      await settle(page);
      expect(page.text('place-entry-name')).toBe('Marshal McBride');
      expect(mocks.service.getEntryName).toHaveBeenCalledWith('creature', 197);

      page.viewer().picked.emit({ type: 'spawn', key: 'creature:1', position: { x: 0, y: 0, z: 0 } });
      page.viewer().picked.emit({ type: 'ground', position: { x: 1, y: 2, z: 3 } });
      await settle(page);
      page.viewer().picked.emit({ type: 'ground', position: { x: 4, y: 5, z: 6 } });
      await settle(page);

      expect(mocks.service.getMaxGuid).toHaveBeenCalledTimes(1);
      expect(page.pendingLines()).toEqual(['Place creature 1001 (Marshal McBride)', 'Place creature 1002 (Marshal McBride)']);
      expect(
        page
          .viewer()
          .spawns()
          .find((s) => s.key === 'creature:1002'),
      ).toEqual(expect.objectContaining({ pending: true, displayId: 1, scale: 1 }));
      expect(mocks.service.getEntryDisplay).toHaveBeenCalledWith('creature', 197);
      expect(page.text('selected-title')).toContain('Creature (GUID: 1002, Entry: 197)');

      page.viewer().objectMoved.emit({ key: 'creature:1002', position: { x: 7, y: 8, z: 9 }, orientation: 0 });
      await settle(page);
      expect(page.pendingLines().length).toBe(2);
      expect(page.text('pending-sql')).toContain('1002, 197, 0, 0, 0, 1, 1, 0, 7, 8, 9');
    });

    it('places gameobjects', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.click('tool-place-gameobject');
      await settle(page);
      page.type('place-entry', '0');
      page.byId('place-entry').nativeElement.dispatchEvent(new Event('change'));
      await settle(page);
      expect(page.text('place-entry-name')).toBe('WORLD_EDITOR.PLACE_HINT');
      page.viewer().picked.emit({ type: 'ground', position: { x: 1, y: 2, z: 3 } });
      await settle(page);
      expect(mocks.toastr.warning).toHaveBeenCalledWith('Enter the gameobject entry to place first.', 'World Editor');

      page.type('place-entry', '5');
      page.byId('place-entry').nativeElement.dispatchEvent(new Event('change'));
      await settle(page);
      expect(mocks.service.getEntryName).toHaveBeenCalledWith('gameobject', 5);
    });
  });

  describe('groups and travel', () => {
    it('draws formations, pools and travel points, each with its layer', async () => {
      mocks.service.loadFormations.mockResolvedValue([{ leader: 1, member: 2, dist: 3, angle: 90, groupAI: 0 }]);
      mocks.service.loadPools.mockResolvedValue([{ type: 'gameobject', guid: 3, pool: 7, chance: 0, maxLimit: 1, description: 'Mail' }]);
      mocks.service.loadGraveyards.mockResolvedValue([{ id: 1, x: -8900, y: -100, z: 80, comment: 'Northshire' }]);
      mocks.service.loadTeleports.mockResolvedValue([{ id: 46, name: 'Inside', map: 0, x: -9400, y: 40, z: 60 }]);
      mocks.client.getTaxiNodes.mockResolvedValue([{ id: 2, mapId: 0, x: -8900, y: -100, z: 80, name: 'Stormwind' }]);
      mocks.client.getTaxiPaths.mockResolvedValue([
        {
          id: 10,
          from: 2,
          to: 3,
          points: [
            { x: -8900, y: -100, z: 80 },
            { x: -8800, y: -100, z: 90 },
          ],
        },
      ]);
      const { page } = await setup();
      await loadArea(page);
      const viewer = page.viewer();
      expect(viewer.links().map((link) => link.key)).toEqual(['formation:1:2', 'pool:7:gameobject:3', 'flight:10', 'teleport:46']);
      expect(viewer.markers().map((marker) => marker.key)).toEqual(['pool:7', 'graveyard:1', 'taxi:2', 'teleport-to:46']);
      // the formation places of the selected creature's formation
      viewer.picked.emit({ type: 'spawn', key: 'creature:2', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(viewer.markers().map((marker) => marker.key)).toContain('formation-slot:2');
      // their switches are in the View panel; flight masters have their own
      page.click('view-toggle');
      page.fixture.detectChanges();
      for (const layer of ['formations', 'pools', 'flight-paths', 'travel']) {
        page.click('layer-' + layer);
      }
      await settle(page);
      expect(viewer.links()).toEqual([]);
      expect(viewer.markers()).toEqual([]);
      // hover lines
      expect(viewer.spawns().find((s) => s.key === 'creature:2')?.details).toContain('In the formation of 1: 3 yd, 90°');
    });

    it('still shows the rest when travel data can not be read', async () => {
      mocks.service.loadGraveyards.mockRejectedValue(new Error('no table'));
      mocks.service.loadTeleports.mockRejectedValue(new Error('no table'));
      mocks.client.getTaxiNodes.mockRejectedValue(new Error('no dbc'));
      mocks.client.getTaxiPaths.mockRejectedValue(new Error('no dbc'));
      const { page } = await setup();
      await loadArea(page);
      expect(page.viewer().markers()).toEqual([]);
    });
  });

  describe('selecting several spawns', () => {
    it('adds spawns with Ctrl + click, moves, turns and deletes them together', async () => {
      const { page } = await setup();
      await loadArea(page);
      const viewer = page.viewer();
      const pick = (key: string, additive = true) => viewer.picked.emit({ type: 'spawn', key, position: { x: 0, y: 0, z: 0 }, additive });
      pick('creature:1');
      await settle(page);
      expect(page.text('selected-title')).toContain('Deputy Willem');
      pick('creature:2');
      pick('gameobject:3');
      await settle(page);
      expect(viewer.groupKeys()).toEqual(['creature:2', 'gameobject:3']);
      expect(page.text('group-count')).toBe('WORLD_EDITOR.GROUP_COUNT');
      pick('gameobject:3');
      await settle(page);
      expect(viewer.groupKeys()).toEqual(['creature:2']);

      // creature 1 at (−8901, −100) moves 10 yards: creature 2 (−8902, −100) follows
      viewer.objectMoved.emit({ key: 'creature:1', position: { x: -8891, y: -100, z: 80 }, orientation: 0 });
      await settle(page);
      expect(page.pendingLines()).toEqual(['Move creature 2', 'Move creature 1 (Deputy Willem)']);
      expect(page.text('pending-sql')).toContain('`position_x` = -8892');

      // taking the main one out: the next one becomes the main one
      pick('creature:1');
      await settle(page);
      expect(page.text('selected-title')).toContain('GUID: 2');
      expect(viewer.groupKeys()).toEqual([]);
      pick('creature:1');
      await settle(page);
      page.click('delete-selected');
      await settle(page);
      expect([...page.pendingLines()].sort()).toEqual(['Delete creature 1 (Deputy Willem)', 'Delete creature 2']);
      expect(viewer.groupKeys()).toEqual([]);
    });

    it('starts a selection with Ctrl + click, and drops it with a plain click or Escape', async () => {
      const { page } = await setup();
      await loadArea(page);
      // nothing selected or copied yet
      page.key('c', undefined, undefined, { ctrlKey: true });
      page.key('v', undefined, undefined, { ctrlKey: true });
      await settle(page);
      expect(page.pendingLines()).toEqual([]);
      const viewer = page.viewer();
      viewer.picked.emit({ type: 'spawn', key: 'creature:1', position: { x: 0, y: 0, z: 0 }, additive: true });
      viewer.picked.emit({ type: 'spawn', key: 'creature:2', position: { x: 0, y: 0, z: 0 }, additive: true });
      await settle(page);
      expect(viewer.groupKeys()).toEqual(['creature:2']);
      viewer.picked.emit({ type: 'spawn', key: 'creature:1', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(viewer.groupKeys()).toEqual([]);
      viewer.picked.emit({ type: 'spawn', key: 'creature:2', position: { x: 0, y: 0, z: 0 }, additive: true });
      await settle(page);
      page.key('Escape');
      await settle(page);
      expect(viewer.groupKeys()).toEqual([]);
    });

    it('copies the selection and pastes it at the crosshair, by button or key', async () => {
      const { page } = await setup();
      await loadArea(page);
      const viewer = page.viewer();
      expect(page.byId<HTMLButtonElement>('paste-copied', false)).toBeFalsy();
      viewer.picked.emit({ type: 'spawn', key: 'gameobject:3', position: { x: 0, y: 0, z: 0 } });
      viewer.picked.emit({ type: 'spawn', key: 'creature:2', position: { x: 0, y: 0, z: 0 }, additive: true });
      await settle(page);
      expect(page.byId<HTMLButtonElement>('paste-copied').nativeElement.disabled).toBe(true);
      page.click('copy-selection');
      await settle(page);
      page.click('paste-copied');
      await settle(page);
      // gameobject 3 (−8903, −100) at the camera target (CENTER), creature 2 one yard further along x
      expect(page.pendingLines()).toEqual(['Place gameobject 1001 (Mailbox)', 'Place creature 1001']);
      expect(page.text('selected-title')).toContain('GUID: 1001');
      expect(viewer.groupKeys()).toEqual(['creature:1001']);
      expect(page.text('pending-sql')).toContain(`${CENTER.x}, ${CENTER.y}, ${CENTER.z}`);
      page.key('c', undefined, undefined, { ctrlKey: true });
      page.key('v', undefined, undefined, { ctrlKey: true });
      await settle(page);
      expect(page.pendingLines()).toHaveLength(4);
    });
  });

  describe('movement simulation', () => {
    it('plays a creature walking its path, or wandering, at a chosen rate', async () => {
      const { page } = await setup();
      await loadArea(page);
      const viewer = page.viewer();
      viewer.picked.emit({ type: 'spawn', key: 'gameobject:3', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(page.byId('simulate', false)).toBeFalsy();
      viewer.picked.emit({ type: 'spawn', key: 'creature:1', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      page.click('simulate');
      await settle(page);
      expect(viewer.simulation()?.legs.map((leg) => leg.label)).toEqual(['point 1', 'point 2']);
      const rate = page.byId<HTMLSelectElement>('simulation-rate').nativeElement;
      rate.value = '4';
      rate.dispatchEvent(new Event('change'));
      await settle(page);
      expect(viewer.simulation()?.rate).toBe(4);
      page.click('simulate');
      await settle(page);
      expect(viewer.simulation()).toBeUndefined();
      rate.value = '2';
      rate.dispatchEvent(new Event('change'));
      // creature 2 wanders 8 yards
      viewer.picked.emit({ type: 'spawn', key: 'creature:2', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      page.click('simulate');
      await settle(page);
      expect(viewer.simulation()?.legs.at(-1)?.label).toBe('home');
      expect(viewer.simulation()?.rate).toBe(2);
    });
  });

  describe('waypoint panel', () => {
    const pickPoint = async (page: Page, point: number) => {
      page.viewer().picked.emit({ type: 'waypoint', key: `path:10#${point}`, pathKey: 'path:10', point, position: { x: 0, y: 0, z: 0 } });
      await settle(page);
    };
    const set = (page: Page, id: string, value: string) => {
      const element = page.byId<HTMLInputElement | HTMLSelectElement>(id).nativeElement;
      element.value = value;
      element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input'));
    };

    it("edits a point's wait, move type, facing and script", async () => {
      const { page } = await setup();
      await loadArea(page);
      await pickPoint(page, 2);
      expect(page.byId<HTMLInputElement>('waypoint-delay').nativeElement.value).toBe('1000');
      set(page, 'waypoint-delay', '2500.4');
      set(page, 'waypoint-move-type', '0: 0');
      set(page, 'waypoint-orientation', '1.5');
      set(page, 'waypoint-action', '');
      set(page, 'waypoint-chance', '250');
      page.click('waypoint-apply');
      await settle(page);
      expect(page.pendingLines()).toEqual(['Edit waypoint 10 #2']);
      expect(page.text('pending-sql')).toContain('SET `delay` = 2500, `orientation` = 1.5, `move_type` = 0, `action` = 0');
      set(page, 'waypoint-orientation', '');
      page.click('waypoint-apply');
      await settle(page);
      expect(page.text('pending-sql')).not.toContain('orientation');
    });

    it('inserts a point after the selected one and renumbers the path', async () => {
      const { page } = await setup();
      await loadArea(page);
      await pickPoint(page, 1);
      page.click('waypoint-insert');
      await settle(page);
      // halfway between points 1 and 2; point 2 becomes 3
      expect(page.pendingLines()).toEqual(['Add waypoint 10 #3', 'Move waypoint 10 #2']);
      expect(page.text('selected-title')).toContain('point 2');
      expect(page.placementValue('x')).toBe(-8901.5);
      // after the last point: as far again as from the one before
      await pickPoint(page, 3);
      page.click('waypoint-insert');
      await settle(page);
      expect(page.placementValue('x')).toBe(-8902.25);
      // the new point (not in the database) takes settings too
      set(page, 'waypoint-delay', '700');
      page.click('waypoint-apply');
      await settle(page);
      expect(page.text('pending-sql')).toContain('700');
      page.click('delete-selected');
      await settle(page);
      await pickPoint(page, 3);
      page.click('waypoint-renumber');
      await settle(page);
      expect(
        page
          .viewer()
          .paths()[0]
          .points.map((p) => p.point),
      ).toEqual([1, 2, 3]);
    });

    it('offers the wait and facing only on SmartAI paths, and inserts after a single point', async () => {
      mocks.service.loadSaiPaths.mockResolvedValue(new Map([[102, [-500]]]));
      mocks.service.loadWaypoints.mockResolvedValue([...WAYPOINTS, { pathId: -500, point: 1, x: -8920, y: -120, z: 80, delay: 0 }]);
      const { page } = await setup();
      await loadArea(page);
      page.viewer().picked.emit({ type: 'waypoint', key: 'path:-500#1', pathKey: 'path:-500', point: 1, position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(page.byId('waypoint-move-type', false)).toBeFalsy();
      set(page, 'waypoint-delay', '3000');
      page.click('waypoint-apply');
      await settle(page);
      expect(page.text('pending-sql')).toBe('UPDATE `waypoints` SET `delay` = 3000 WHERE (`entry` = 500) AND (`pointid` = 1);');
      page.click('waypoint-insert');
      await settle(page);
      expect(page.placementValue('x')).toBe(-8917.5);
    });
  });

  describe('spawn properties', () => {
    it("shows a spawn's columns and edits them, or a new spawn's defaults", async () => {
      const { page } = await setup();
      await loadArea(page);
      page.viewer().picked.emit({ type: 'spawn', key: 'creature:1', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(mocks.service.loadSpawnFields).toHaveBeenCalledWith('creature', 1);
      const respawn = page.byId<HTMLInputElement>('spawn-spawntimesecs').nativeElement;
      expect(respawn.value).toBe('120');
      respawn.value = '600';
      respawn.dispatchEvent(new Event('change'));
      const movement = page.byId<HTMLSelectElement>('spawn-MovementType').nativeElement;
      movement.value = '1';
      movement.dispatchEvent(new Event('change'));
      await settle(page);
      expect(page.pendingLines()).toEqual(['Edit creature 1 (Deputy Willem)']);
      expect(page.text('pending-sql')).toContain('SET `spawntimesecs` = 600, `MovementType` = 1 WHERE (`guid` = 1)');
      expect(respawn.closest('.input-group')?.classList).toContain('changed');
      // a wrong value is put back
      respawn.value = '-5';
      respawn.dispatchEvent(new Event('change'));
      expect(respawn.value).toBe('600');

      // a new gameobject: its defaults, no database read
      mocks.service.loadSpawnFields.mockClear();
      page.click('tool-place-gameobject');
      await settle(page);
      page.type('place-entry', '1');
      page.viewer().picked.emit({ type: 'ground', position: { x: 1, y: 2, z: 3 } });
      await settle(page);
      expect(mocks.service.loadSpawnFields).not.toHaveBeenCalled();
      expect(page.byId<HTMLSelectElement>('spawn-state').nativeElement.value).toBe('1');
    });

    it('drops properties read for a spawn no longer selected', async () => {
      const resolvers: ((v: Record<string, number>) => void)[] = [];
      mocks.service.loadSpawnFields.mockImplementation(() => new Promise((resolve) => resolvers.push(resolve)));
      const { page } = await setup();
      await loadArea(page);
      const pick = async (key: string) => {
        page.viewer().picked.emit({ type: 'spawn', key, position: { x: 0, y: 0, z: 0 } });
        await settle(page);
      };
      await pick('creature:1');
      await pick('creature:2');
      resolvers[0]({ spawntimesecs: 1 });
      await settle(page);
      page.viewer().picked.emit({ type: 'ground', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      resolvers[1]({ spawntimesecs: 2 });
      await settle(page);
      expect(page.byId('spawn-panel', false)).toBeFalsy();
    });

    it('has no properties panel when they can not be read', async () => {
      mocks.service.loadSpawnFields.mockRejectedValue(new Error('no column'));
      const { page } = await setup();
      await loadArea(page);
      page.viewer().picked.emit({ type: 'spawn', key: 'gameobject:3', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(page.byId('spawn-panel', false)).toBeFalsy();
      page.viewer().picked.emit({ type: 'ground', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(page.byId('spawn-panel', false)).toBeFalsy();
    });
  });

  describe('world map, search, problems and array', () => {
    it('opens the world map, goes where clicked and loads a selected area', async () => {
      mocks.client.getServerMap.mockResolvedValue({ v9: new Float32Array(129 * 129).fill(42) });
      const { page } = await setup();
      await loadArea(page);
      page.click('map-toggle');
      await settle(page);
      const map = page.getDebugElementByTestId('world-map');
      expect(map).toBeTruthy();
      expect(mocks.client.getServerCoverage).toHaveBeenCalledWith(0, [
        { tx: 31, ty: 48 },
        { tx: 32, ty: 48 },
      ]);
      const component = page.fixture.debugElement.query((el) => el.name === 'keira-world-map').componentInstance as {
        goTo: { emit: (p: WorldPosition) => void };
        regionSelected: { emit: (b: WorldBounds) => void };
      };
      component.goTo.emit({ x: -9000, y: 100, z: 0 });
      await settle(page);
      expect(page.viewer().focus()).toEqual({ x: -9000, y: 100, z: 42 });
      expect(page.getDebugElementByTestId('world-map', false)).toBeFalsy();

      page.click('map-toggle');
      await settle(page);
      mocks.client.getServerMap.mockRejectedValue(new Error('none'));
      (page.fixture.debugElement.query((el) => el.name === 'keira-world-map').componentInstance as typeof component).regionSelected.emit({
        minX: -9100,
        maxX: -9000,
        minY: 0,
        maxY: 100,
      });
      await settle(page);
      expect(page.viewer().region()).toEqual({ minX: -9100, maxX: -9000, minY: 0, maxY: 100 });
      expect(page.viewer().focus()).toEqual({ x: -9050, y: 50, z: 0 });
      page.click('map-region-clear');
      await settle(page);
      expect(page.viewer().region()).toBeUndefined();
      page.click('map-toggle');
      page.click('map-toggle');
      await settle(page);
    });

    it('opens the world map without tiles when they can not be read', async () => {
      const { page } = await setup();
      await loadArea(page);
      mocks.client.getMapTiles.mockRejectedValue(new Error('no wdt'));
      page.click('map-toggle');
      await settle(page);
      expect(mocks.client.getServerCoverage).toHaveBeenLastCalledWith(0, []);
    });

    it('loads the tiles of the map shown, also when it changes or the editor opens again', async () => {
      // every read of a map's tiles waits until answered
      const resolvers = new Map<string, ((tiles: { tx: number; ty: number }[]) => void)[]>();
      const answer = (directory: string, tiles: { tx: number; ty: number }[]) =>
        (resolvers.get(directory) ?? []).forEach((resolve) => resolve(tiles));
      const { page, fixture } = await setup();
      await loadArea(page);
      mocks.client.getMapTiles.mockImplementation(
        (directory: string) => new Promise((resolve) => resolvers.set(directory, [...(resolvers.get(directory) ?? []), resolve])),
      );
      page.click('map-toggle');
      await settle(page);
      page.chooseMap(1);
      await settle(page);
      expect(mocks.client.getMapTiles).toHaveBeenLastCalledWith('Kalimdor');
      // Kalimdor's tiles, then the late Azeroth ones: Kalimdor's stay
      answer('Kalimdor', [{ tx: 40, ty: 30 }]);
      await settle(page);
      answer('Azeroth', [{ tx: 31, ty: 48 }]);
      await settle(page);
      expect(mocks.client.getServerCoverage).toHaveBeenLastCalledWith(1, [{ tx: 40, ty: 30 }]);
      fixture.destroy();

      mocks.client.getMapTiles.mockClear();
      const again = new Page(TestBed.createComponent(WorldEditorComponent));
      await settle(again);
      expect(again.getDebugElementByTestId('world-map')).toBeTruthy();
      expect(mocks.client.getMapTiles).toHaveBeenCalled();
    });

    it('finds spawns, flies to them and selects them once loaded', async () => {
      const far = { ...spawn('creature', 99, { name: 'Far one' }), x: -5000 };
      mocks.service.searchSpawns.mockResolvedValue([SPAWNS[0], far]);
      const { page } = await setup();
      await loadArea(page);
      page.type('search-input', 'one');
      page.click('search-btn');
      await settle(page);
      expect(mocks.service.searchSpawns).toHaveBeenCalledWith(0, 'one');
      page.click('search-result-creature-1');
      await settle(page);
      expect(page.text('selected-title')).toContain('Deputy Willem');
      // not loaded yet: selected once it is
      mocks.service.loadSpawns.mockResolvedValue([...SPAWNS, far]);
      page.click('search-result-creature-99');
      await settle(page);
      expect(page.viewer().focus()).toEqual({ x: -5000, y: -100, z: 80 });
      page.click('refresh');
      await settle(page);
      expect(page.text('selected-title')).toContain('Far one');
      // results are dots on the world map
      page.click('map-toggle');
      await settle(page);
      const map = page.fixture.debugElement.query((el) => el.name === 'keira-world-map').componentInstance as {
        dots: () => { key: string }[];
      };
      expect(map.dots().map((d) => d.key)).toContain('search:creature:99');
      // a map picked in the list of every map
      (map as unknown as { mapPicked: { emit(id: number): void } }).mapPicked.emit(1);
      await settle(page);
      expect(page.viewer().mapDirectory()).toBe('Kalimdor');
      // a place picked on the atlas of every map: there, at the server's ground (or the place's height without one)
      type Atlas = { atlasPicked: { emit(pick: { mapId: number; position: { x: number; y: number; z: number } }): void } };
      const atlas = () => page.fixture.debugElement.query((el) => el.name === 'keira-world-map')?.componentInstance as Atlas;
      mocks.client.getServerMap.mockResolvedValueOnce({ v9: new Float32Array(129 * 129).fill(42) });
      atlas().atlasPicked.emit({ mapId: 1, position: { x: 100, y: 200, z: 0 } });
      await settle(page);
      expect(page.viewer().focus()).toEqual({ x: 100, y: 200, z: 42 });
      expect(page.getDebugElementByTestId('world-map', false)).toBeFalsy();
      for (const server of [Promise.resolve(undefined), Promise.reject(new Error('no map'))]) {
        page.click('map-toggle');
        await settle(page);
        mocks.client.getServerMap.mockReturnValueOnce(server);
        atlas().atlasPicked.emit({ mapId: 1, position: { x: 300, y: 400, z: 7 } });
        await settle(page);
        expect(page.viewer().focus()).toEqual({ x: 300, y: 400, z: 7 });
      }
      page.click('map-toggle');
      await settle(page);
      page.chooseMap(0);
      await settle(page);
      page.click('map-toggle');
      await settle(page);
      page.click('search-clear');
      await settle(page);
      expect(page.byId('search-results', false)).toBeFalsy();
      mocks.service.searchSpawns.mockRejectedValue(new Error('bad query'));
      page.click('search-btn');
      await settle(page);
      expect(mocks.toastr.error).toHaveBeenCalledWith('bad query', 'World Editor');
    });

    it('checks the spawns shown and jumps to a problem', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.click('check-spawns');
      await settle(page);
      expect(
        page
          .viewer()
          .groundQuery()
          ?.map((q) => q.key),
      ).toEqual(['creature:1', 'creature:2', 'gameobject:3']);
      page.viewer().groundHeights.emit({ 'creature:1': 90, 'creature:2': 80, 'gameobject:3': null });
      await settle(page);
      expect(page.viewer().groundQuery()).toBeUndefined();
      expect(page.text('problem-count')).toBe('WORLD_EDITOR.PROBLEM_COUNT');
      page.click('problem-0');
      await settle(page);
      expect(page.text('selected-title')).toContain('Deputy Willem');
      page.click('problems-close');
      await settle(page);
      expect(page.byId('problem-list', false)).toBeFalsy();
    });

    it('places a row of copies, touching or a spacing apart', async () => {
      mocks.service.loadSpawns.mockResolvedValue([...SPAWNS, spawn('gameobject', 4, { name: 'Bench', displayId: 9, scale: 1 })]);
      mocks.client.getGameObjectDisplay.mockResolvedValue('bench.m2');
      mocks.client.getM2.mockResolvedValue({
        positions: Float32Array.from([-0.5, 0, -1, 0.5, 3, 1]),
        collision: { positions: new Float32Array(0) },
      });
      const { page } = await setup();
      await loadArea(page);
      page.viewer().picked.emit({ type: 'spawn', key: 'gameobject:4', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      page.type('array-count', '2');
      page.click('array-place');
      await settle(page);
      expect(page.pendingLines()).toEqual(['Place gameobject 1001 (Bench)', 'Place gameobject 1002 (Bench)']);
      expect(page.viewer().groupKeys()).toEqual(['gameobject:1001', 'gameobject:1002']);
      // 2 yards long: touching copies 2 yards apart
      expect(page.text('pending-sql')).toContain('-8902, -100, 80');
      page.type('array-spacing', '5');
      page.byId('array').nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await settle(page);
      expect(page.text('pending-sql')).toContain('-8899, -100, 80');
      // no model: the spacing is needed
      page.viewer().picked.emit({ type: 'spawn', key: 'creature:2', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      page.type('array-spacing', '');
      page.click('array-place');
      await settle(page);
      expect(mocks.toastr.warning).toHaveBeenCalledWith('The model of  could not be read: give the spacing.', 'World Editor');
      // a model that fails to load, no count and no spacing
      mocks.client.getM2.mockRejectedValue(new Error('broken'));
      page.viewer().picked.emit({ type: 'spawn', key: 'gameobject:4', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      page.type('array-count', '');
      page.type('array-spacing', '0');
      page.click('array-place');
      await settle(page);
      expect(mocks.toastr.warning).toHaveBeenLastCalledWith('The model of Bench could not be read: give the spacing.', 'World Editor');
    });
  });

  describe('panels, legend, view and menus', () => {
    it('opens one panel at a time (also the world map, with M), lit while open', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.click('view-toggle');
      page.fixture.detectChanges();
      expect(page.byId('view-toggle').nativeElement.classList).toContain('btn-secondary');
      page.click('filters-toggle');
      page.fixture.detectChanges();
      expect(page.byId('view-settings', false)).toBeFalsy();
      expect(page.byId('filters')).toBeTruthy();
      page.click('legend-toggle');
      page.fixture.detectChanges();
      expect(page.byId('filters', false)).toBeFalsy();
      expect(page.byId('legend').nativeElement.textContent).toContain('WORLD_EDITOR.LEGEND_WP_AIR');
      page.key('m');
      await settle(page);
      expect(page.byId('legend', false)).toBeFalsy();
      expect(page.getDebugElementByTestId('world-map')).toBeTruthy();
      // its close button
      (
        page.fixture.debugElement.query((el) => el.name === 'keira-world-map').componentInstance as { closed: { emit: () => void } }
      ).closed.emit();
      await settle(page);
      expect(page.getDebugElementByTestId('world-map', false)).toBeFalsy();
      page.click('legend-toggle');
      page.click('legend-toggle');
      page.fixture.detectChanges();
      expect(page.byId('legend', false)).toBeFalsy();
    });

    it('goes full screen and back', async () => {
      const { page } = await setup();
      const root = page.fixture.nativeElement.querySelector('.world-editor') as HTMLElement;
      let current: Element | null = null;
      Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => current });
      root.requestFullscreen = vi.fn().mockImplementation(() => {
        current = root;
        document.dispatchEvent(new Event('fullscreenchange'));
        return Promise.resolve();
      });
      document.exitFullscreen = vi.fn().mockImplementation(() => {
        current = null;
        document.dispatchEvent(new Event('fullscreenchange'));
        return Promise.resolve();
      });
      page.click('fullscreen-toggle');
      await settle(page);
      expect(root.classList).toContain('fullscreen');
      page.click('fullscreen-toggle');
      await settle(page);
      expect(document.exitFullscreen).toHaveBeenCalled();
      expect(root.classList).not.toContain('fullscreen');

      // the 3D view alone
      const view = page.fixture.nativeElement.querySelector('.world-editor-view') as HTMLElement;
      view.requestFullscreen = vi.fn().mockImplementation(() => {
        current = view;
        document.dispatchEvent(new Event('fullscreenchange'));
        return Promise.resolve();
      });
      page.click('view-fullscreen');
      await settle(page);
      expect(view.classList).toContain('view-fullscreen');
      expect(root.classList).not.toContain('fullscreen');
      page.click('view-fullscreen');
      await settle(page);
      expect(view.classList).not.toContain('view-fullscreen');
    });

    it('shows performance stats, and writes a performance log next to the cache', async () => {
      const { page, fixture } = await setup({ cacheRoot: '/cache' });
      page.click('view-toggle');
      page.fixture.detectChanges();
      page.click('view-stats');
      page.fixture.detectChanges();
      expect(page.viewer().renderSettings().showStats).toBe(true);
      page.click('view-perf-log');
      await settle(page);
      expect(perfLogActive()).toBe(true);
      perfNote('hello');
      flushPerfLog();
      const name = new RegExp(
        `^/cache/\\d{2}_\\d{2}_\\d{4}_abc1234_${packageInfo.version.replace(/\./g, '\\.')}_\\d{2}_\\d{2}_\\d{2}\\.log$`,
      );
      expect(mocks.electron.fs.appendFileSync).toHaveBeenCalledWith(expect.stringMatching(name), expect.stringContaining('hello'));
      // with the settings in use, and again when they change
      const written = () => mocks.electron.fs.appendFileSync.mock.calls.map((call) => call[1] as string).join('');
      expect(written()).toMatch(/settings: camera speed ×[\d.]+ \| window \d+×\d+ at [\d.]+× \| .*showStats=true/);
      expect(written()).not.toContain('perfLog=');
      page.click('view-stats');
      await settle(page);
      page.click('view-bounds');
      await settle(page);
      flushPerfLog();
      expect(written()).toContain('showStats=false');
      expect(written().match(/settings:/g)?.length).toBe(3);
      // still the same file
      expect(new Set(mocks.electron.fs.appendFileSync.mock.calls.map((call) => call[0])).size).toBe(1);
      // stops with the editor
      fixture.destroy();
      expect(perfLogActive()).toBe(false);
    });

    it('names the performance log "release" when Keira is not run from a checkout, asking git once', async () => {
      mocks.electron.childProcess.execSync.mockImplementationOnce(() => {
        throw new Error('not a git repository');
      });
      const { page } = await setup({ cacheRoot: '/cache' });
      page.click('view-toggle');
      page.fixture.detectChanges();
      page.click('view-perf-log');
      await settle(page);
      perfNote('one');
      flushPerfLog();
      expect(mocks.electron.fs.appendFileSync).toHaveBeenLastCalledWith(expect.stringContaining('_release_'), expect.any(String));
      page.click('view-perf-log');
      await settle(page);
      page.click('view-perf-log');
      await settle(page);
      expect(mocks.electron.childProcess.execSync).toHaveBeenCalledTimes(1);
      page.click('view-perf-log');
      await settle(page);
    });

    it('offers no performance log outside the desktop app', async () => {
      const { page } = await setup();
      page.click('view-toggle');
      page.fixture.detectChanges();
      expect(page.byId<HTMLInputElement>('view-perf-log').nativeElement.disabled).toBe(true);
    });

    it('sets the resolution from the view, and the marker model', async () => {
      const { page } = await setup();
      page.click('resolution-50');
      page.fixture.detectChanges();
      expect(page.viewer().renderSettings().renderScale).toBe(0.5);
      expect(page.byId('resolution-50').nativeElement.classList).toContain('btn-light');
      page.click('view-toggle');
      page.fixture.detectChanges();
      const marker = page.byId<HTMLSelectElement>('view-marker-model').nativeElement;
      marker.value = '11:1';
      marker.dispatchEvent(new Event('change'));
      page.fixture.detectChanges();
      expect(page.viewer().renderSettings().markerModel).toBe('11:1');
      page.click('resolution-100');
      const ahead = page.byId<HTMLSelectElement>('view-load-ahead').nativeElement;
      ahead.value = '2';
      ahead.dispatchEvent(new Event('change'));
      page.fixture.detectChanges();
      expect(page.viewer().renderSettings().loadAhead).toBe(2);
    });

    it("draws creatures' bounding radius and combat reach, and names them on hover", async () => {
      mocks.service.loadSpawns.mockResolvedValue([
        spawn('creature', 1, { name: 'Ogre', boundingRadius: 0.5, combatReach: 1.5, scale: 2 }),
        spawn('creature', 2, { name: 'Imp', boundingRadius: 1, combatReach: 2 }),
        spawn('creature', 3, { name: 'Wisp' }),
      ]);
      const { page } = await setup();
      await loadArea(page);
      page.click('view-toggle');
      page.fixture.detectChanges();
      const toggle = page.byId<HTMLInputElement>('view-bounds').nativeElement;
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change'));
      await settle(page);
      const spawns = page.viewer().spawns();
      expect(spawns.map((s) => s.bounds)).toEqual([{ radius: 1, reach: 3 }, { radius: 1, reach: 2 }, undefined]);
      expect(spawns[0].details).toContain('Bounding radius 1.00 yd · combat reach 3.00 yd · melee range 5.83 yd');
      expect(spawns[1].details).toContain('Bounding radius 1.00 yd · combat reach 2.00 yd · melee range 5.00 yd');
      toggle.checked = false;
      toggle.dispatchEvent(new Event('change'));
    });

    it('copies what was right-clicked, and a .go xyz to it', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.viewer().contextRequested.emit({ key: 'flight:1', x: 5, y: 5, label: 'Flight path 1', position: { x: 1.5, y: -2, z: 3 } });
      await settle(page);
      expect(page.text('context-label')).toBe('Flight path 1');
      page.click('context-copy');
      expect(mocks.clipboard.copyFromContent).toHaveBeenLastCalledWith('Flight path 1\n1.5000 -2.0000 3.0000');
      page.viewer().contextRequested.emit({ key: 'flight:1', x: 5, y: 5, label: 'Flight path 1', position: { x: 1.5, y: -2, z: 3 } });
      await settle(page);
      page.click('context-copy-go');
      expect(mocks.clipboard.copyFromContent).toHaveBeenLastCalledWith('.go xyz 1.5000 -2.0000 3.0000 0');
      page.fixture.detectChanges();
      expect(page.byId('context-menu', false)).toBeFalsy();
      // nothing more known: its key, no .go
      page.viewer().contextRequested.emit({ key: 'path:10:1-2', x: 5, y: 5 });
      await settle(page);
      expect(page.byId('context-copy-go', false)).toBeFalsy();
      page.click('context-copy');
      expect(mocks.clipboard.copyFromContent).toHaveBeenLastCalledWith('path:10:1-2');
    });

    it('moves the Path / LOS points where they were dragged', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.click('tool-probe');
      page.viewer().picked.emit({ type: 'ground', position: { x: 1, y: 1, z: 1 } });
      page.viewer().picked.emit({ type: 'ground', position: { x: 9, y: 9, z: 1 } });
      await settle(page);
      page.viewer().probeMoved.emit({ which: 'to', position: { x: 20, y: 20, z: 2 } });
      page.viewer().probeMoved.emit({ which: 'from', position: { x: 2, y: 2, z: 2 } });
      await settle(page);
      expect(page.viewer().probe()).toEqual(expect.objectContaining({ from: { x: 2, y: 2, z: 2 }, to: { x: 20, y: 20, z: 2 } }));
    });

    it('draws boss boundaries at the height of their boss, named with it, with their own switch', async () => {
      mocks.client.getBossBoundaries.mockResolvedValue([
        {
          mapId: 0,
          instance: 'instance_naxxramas',
          boss: 'BOSS_PATCHWERK',
          shapes: [
            { type: 'circle', center: { x: -8900, y: -100 }, radius: 30, inverted: false },
            { type: 'zrange', minZ: 70, maxZ: 90, inverted: false },
          ],
          scriptNames: ['boss_patchwerk', 'boss_unknown'],
        },
        {
          mapId: 0,
          instance: 'instance_naxxramas',
          boss: 'BOSS_GLUTH',
          shapes: [{ type: 'zrange', minZ: 1, maxZ: 2, inverted: false }],
          scriptNames: [],
        },
      ]);
      mocks.service.loadScriptEntries.mockResolvedValue(new Map([['boss_patchwerk', [101, 102]]]));
      const { page } = await setup();
      await loadArea(page);
      expect(mocks.service.loadScriptEntries).toHaveBeenCalledWith(['boss_patchwerk', 'boss_unknown']);
      const [patchwerk, gluth] = page.viewer().boundaries();
      // creatures 1 and 2 (no name) have entries 101 and 102
      expect(patchwerk.label).toBe(
        'Boss boundary BOSS_PATCHWERK (instance_naxxramas) — Deputy Willem, 102\nmust stay inside all of:\n· circle r 30.0 at (-8900.0, -100.0)\n· height 70..90',
      );
      expect(patchwerk.z).toBe(80);
      expect(gluth.label).toBe('Boss boundary BOSS_GLUTH (instance_naxxramas)\n· height 1..2');
      expect(gluth.z).toBe(CENTER.z);
      expect(gluth.color).not.toBe(patchwerk.color);
      page.click('view-toggle');
      page.fixture.detectChanges();
      page.click('layer-boss-boundaries');
      page.fixture.detectChanges();
      expect(page.viewer().boundaries()).toEqual([]);
    });

    it('has no boss boundaries when they or their creatures can not be read, and keeps the source folder setting', async () => {
      mocks.client.getBossBoundaries.mockRejectedValue(new Error('no source'));
      const { page } = await setup();
      await loadArea(page);
      expect(page.viewer().boundaries()).toEqual([]);
      mocks.client.getBossBoundaries.mockResolvedValue([
        { mapId: 0, instance: 'i', boss: 'B', shapes: [{ type: 'zrange', minZ: 1, maxZ: 2, inverted: false }], scriptNames: ['x'] },
      ]);
      mocks.service.loadScriptEntries.mockRejectedValue(new Error('no table'));
      page.click('settings-toggle');
      page.fixture.detectChanges();
      page.type('source-path', 'C:\\Source\\azerothcore-wotlk');
      page.submit('settings-save');
      await settle(page);
      await settle(page);
      expect(JSON.parse(localStorage.getItem(WOW_DATA_SETTINGS_KEY) as string).sourcePath).toBe('C:\\Source\\azerothcore-wotlk');
      expect(page.viewer().boundaries()).toHaveLength(1);
    });

    it('loads the spawns of an area chosen on the world map', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.click('map-toggle');
      await settle(page);
      const bounds = { minX: -9100, maxX: -9000, minY: 0, maxY: 100 };
      (
        page.fixture.debugElement.query((el) => el.name === 'keira-world-map').componentInstance as {
          regionSelected: { emit: (b: WorldBounds) => void };
        }
      ).regionSelected.emit(bounds);
      await settle(page);
      expect(mocks.service.loadSpawns).toHaveBeenCalledWith(0, expect.anything(), 450, bounds);
    });
  });

  describe('collision source', () => {
    it("says whether the line of sight uses the server's vmaps or the client's models", async () => {
      const { page } = await setup();
      page.click('view-toggle');
      page.fixture.detectChanges();
      expect(page.byId('collision-source', false)).toBeFalsy();
      page.viewer().collisionSourceChanged.emit('server');
      page.fixture.detectChanges();
      expect(page.text('collision-source')).toBe('WORLD_EDITOR.COLLISION_SERVER');
      page.viewer().collisionSourceChanged.emit('client');
      page.fixture.detectChanges();
      expect(page.text('collision-source')).toBe('WORLD_EDITOR.COLLISION_CLIENT');
    });
  });

  describe('checking paths', () => {
    it('checks the active path, lists what was found at each point, and stops', async () => {
      const { page } = await setup();
      await loadArea(page);
      expect(page.byId('check-path', false)).toBeFalsy();
      page.viewer().picked.emit({ type: 'spawn', key: 'creature:1', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      page.click('check-path');
      await settle(page);
      expect(page.viewer().waypointCheck()).toEqual({
        pathKey: 'path:10',
        points: [
          { point: 1, position: { x: -8901, y: -101, z: 80 } },
          { point: 2, position: { x: -8902, y: -102, z: 81 } },
        ],
      });
      expect(page.byId('path-checks', false)).toBeFalsy();
      page.viewer().waypointsChecked.emit([
        { key: 'path:10#1', point: 1, place: 'ground', status: 'ok', reason: 'WORLD_EDITOR.CHECK_OK' },
        { key: 'path:10#2', point: 2, place: 'air', status: 'bad', reason: 'WORLD_EDITOR.CHECK_BLOCKED', params: { from: 1 } },
      ]);
      await settle(page);
      expect(page.text('path-check-2')).toContain('#2');
      expect(page.text('path-check-2')).toContain('WORLD_EDITOR.PLACE_AIR');
      expect(page.text('path-check-2')).toContain('WORLD_EDITOR.CHECK_BLOCKED');
      expect((page.byId('path-check-2').nativeElement.querySelector('strong') as HTMLElement).style.color).toBe('rgb(231, 76, 60)');

      // still checked from one of its points; moving it asks again
      page.viewer().picked.emit({ type: 'waypoint', key: 'path:10#2', pathKey: 'path:10', point: 2, position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(page.byId('path-checks')).toBeTruthy();
      page.viewer().objectMoved.emit({ key: 'path:10#2', position: { x: 1, y: 2, z: 3 }, orientation: 0 });
      await settle(page);
      expect(page.viewer().waypointCheck()?.points[1].position).toEqual({ x: 1, y: 2, z: 3 });

      page.click('check-path');
      await settle(page);
      expect(page.viewer().waypointCheck()).toBeUndefined();
    });
  });

  describe('stacking', () => {
    // a 2 × 1 × 3 yard box (scene axes (−y, z, −x))
    const box = { positions: Float32Array.from([-0.5, 0, -1, 0.5, 3, 1]), collision: { positions: new Float32Array(0) } };

    it('places a copy against the selected spawn on the chosen side, selected to stack further', async () => {
      mocks.service.loadSpawns.mockResolvedValue([
        ...SPAWNS,
        spawn('gameobject', 4, { name: 'Guild Vault', displayId: 9, scale: 1, event: 3 }),
      ]);
      mocks.client.getGameObjectDisplay.mockResolvedValue('vault.m2');
      mocks.client.getM2.mockResolvedValue(box);
      const { page } = await setup();
      await loadArea(page);
      page.viewer().picked.emit({ type: 'spawn', key: 'gameobject:4', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(page.byId('stack').nativeElement.querySelectorAll('button')).toHaveLength(6);

      page.click('stack-above');
      await settle(page);
      expect(page.pendingLines()).toEqual(['Place gameobject 1001 (Guild Vault)']);
      expect(page.text('selected-title')).toContain('1001');
      expect(page.placementValue('z')).toBe(83);
      page.click('stack-front');
      await settle(page);
      expect(page.pendingLines()).toEqual(['Place gameobject 1001 (Guild Vault)', 'Place gameobject 1002 (Guild Vault)']);
      expect(page.placementValue('x')).toBe(-8902);
      expect(page.placementValue('z')).toBe(83);
      expect(mocks.client.getGameObjectDisplay).toHaveBeenCalledWith(9);
    });

    it('says when the size of the model is unknown', async () => {
      mocks.service.loadSpawns.mockResolvedValue([...SPAWNS, spawn('creature', 5, { name: 'Bear', displayId: 8 })]);
      mocks.client.getCreatureDisplay.mockRejectedValue(new Error('no dbc'));
      const { page } = await setup();
      await loadArea(page);
      for (const key of ['creature:2', 'creature:5']) {
        page.viewer().picked.emit({ type: 'spawn', key, position: { x: 0, y: 0, z: 0 } });
        await settle(page);
        page.click('stack-left');
        await settle(page);
      }
      expect(mocks.toastr.warning).toHaveBeenCalledTimes(2);
      expect(page.pendingLines()).toEqual([]);
    });
  });

  describe('waypoints', () => {
    it('needs a path before adding waypoints', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.click('tool-add-waypoint');
      await settle(page);
      expect(page.text('waypoint-hint')).toBe('WORLD_EDITOR.NO_ACTIVE_PATH');
      page.viewer().picked.emit({ type: 'ground', position: { x: 1, y: 2, z: 3 } });
      await settle(page);
      expect(mocks.toastr.warning).toHaveBeenCalledWith(
        'Select a creature with a path (or create one) before adding waypoints.',
        'World Editor',
      );
    });

    it('appends points to the selected creature path and moves them', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.viewer().picked.emit({ type: 'spawn', key: 'creature:1', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      page.click('tool-add-waypoint');
      await settle(page);
      expect(page.text('waypoint-hint')).toContain('WORLD_EDITOR.ADD_WAYPOINT_HINT');

      page.viewer().picked.emit({ type: 'ground', position: { x: 1, y: 2, z: 3 } });
      await settle(page);
      expect(page.pendingLines()).toEqual(['Add waypoint 10 #3']);
      expect(page.viewer().paths()[0].points.length).toBe(3);
      expect(page.text('selected-title')).toContain('point 3');
      expect(page.placementValue('x')).toBe(1);
      expect(page.placementValue('z')).toBe(3);

      page.viewer().objectMoved.emit({ key: 'path:10#3', position: { x: 4, y: 5, z: 6 }, orientation: 0 });
      await settle(page);
      expect(page.pendingLines()).toEqual(['Add waypoint 10 #3']);
      expect(page.text('pending-sql')).toContain('VALUES (10, 3, 4, 5, 6, 0)');
    });

    it('shows and edits the SmartAI paths creature scripts start', async () => {
      mocks.service.loadSaiPaths.mockResolvedValue(new Map([[102, [-500]]]));
      mocks.service.loadWaypoints.mockResolvedValue([...WAYPOINTS, { pathId: -500, point: 1, x: -8920, y: -120, z: 80, delay: 0 }]);
      mocks.service.loadWaypointSai.mockResolvedValue([
        { entryorguid: 102, point: 1, pathId: -500, escort: true, actionType: 1, comment: 'Say hello' },
      ]);
      const { page } = await setup();
      await loadArea(page);
      expect(mocks.service.loadWaypoints).toHaveBeenCalledWith([10, -500]);
      const sai = page
        .viewer()
        .paths()
        .find((path) => path.key === 'path:-500');
      expect(sai?.label).toBe('SmartAI path 500');
      expect(sai?.owners).toEqual(['102 (2)']);
      page.viewer().picked.emit({ type: 'spawn', key: 'creature:2', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(page.text('selected-sai-path')).toBe('SmartAI path 500');
      expect(page.text('check-path')).toContain('SmartAI path 500');

      page.click('tool-add-waypoint');
      await settle(page);
      page.viewer().picked.emit({ type: 'ground', position: { x: 1, y: 2, z: 3 } });
      await settle(page);
      expect(page.pendingLines()).toEqual(['Add waypoint SmartAI 500 #2']);
      expect(page.text('pending-sql')).toContain('INSERT INTO `waypoints`');
      expect(page.text('selected-title')).toContain('SmartAI path 500');
      page.viewer().picked.emit({ type: 'waypoint', key: 'path:-500#1', pathKey: 'path:-500', point: 1, position: { x: 0, y: 0, z: 0 } });
      page.click('tool-select');
      await settle(page);
      page.viewer().picked.emit({ type: 'waypoint', key: 'path:-500#1', pathKey: 'path:-500', point: 1, position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(page.text('selected-waypoint-info')).toContain('SAI: Say hello');
    });

    it('creates a path for a creature without one', async () => {
      mocks.service.loadSpawns.mockResolvedValue([...SPAWNS, spawn('creature', 4)]);
      const { page } = await setup();
      await loadArea(page);
      page.viewer().picked.emit({ type: 'spawn', key: 'creature:2', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      page.click('create-path');
      await settle(page);
      expect(mocks.service.getFreePathId).toHaveBeenCalledWith(2, []);
      expect(page.pendingLines()).toEqual(['Create path 20 for creature 2']);

      expect(page.text('waypoint-hint')).toContain('WORLD_EDITOR.ADD_WAYPOINT_HINT');
      expect(mocks.service.loadWaypoints).toHaveBeenCalledTimes(1);

      // a second new path in the same session must not reuse the first one's id
      mocks.service.getFreePathId.mockResolvedValue(41);
      page.click('tool-select');
      page.viewer().picked.emit({ type: 'spawn', key: 'creature:4', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      page.click('create-path');
      await settle(page);
      expect(mocks.service.getFreePathId).toHaveBeenLastCalledWith(4, [20]);
      expect(page.pendingLines()).toEqual(['Create path 20 for creature 2', 'Create path 41 for creature 4']);
    });
  });

  describe('safety', () => {
    it('refuses to append to paths shared through creature_template_addon', async () => {
      mocks.service.loadSpawns.mockResolvedValue([spawn('creature', 5, { pathId: 50, pathFromTemplate: true, name: 'Guard' })]);
      const { page } = await setup();
      await loadArea(page);
      page.viewer().picked.emit({ type: 'spawn', key: 'creature:5', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(page.text('selected-path')).toBe('path 50 (template)');
      page.click('tool-add-waypoint');
      page.viewer().picked.emit({ type: 'ground', position: { x: 1, y: 2, z: 3 } });
      await settle(page);
      expect(mocks.toastr.warning).toHaveBeenCalledWith(expect.stringContaining('creature_template_addon'), 'World Editor');
      expect(page.pendingLines()).toEqual([]);
    });

    it('gives distinct guids to quick consecutive placements', async () => {
      let resolveMax: (max: number) => void = () => undefined;
      mocks.service.getMaxGuid.mockReturnValue(new Promise((r) => (resolveMax = r)));
      const { page } = await setup();
      await loadArea(page);
      page.click('tool-place-creature');
      await settle(page);
      page.type('place-entry', '197');
      page.viewer().picked.emit({ type: 'ground', position: { x: 1, y: 2, z: 3 } });
      page.viewer().picked.emit({ type: 'ground', position: { x: 4, y: 5, z: 6 } });
      resolveMax(500);
      await settle(page);
      expect(mocks.service.getMaxGuid).toHaveBeenCalledTimes(1);
      expect(page.pendingLines()).toEqual(['Place creature 501 (Marshal McBride)', 'Place creature 502 (Marshal McBride)']);
    });

    it('ignores waypoint scripts of an older camera position', async () => {
      const { page } = await setup();
      let resolveScripts: (scripts: Map<number, unknown[]>) => void = () => undefined;
      mocks.service.loadWaypointScripts.mockReturnValueOnce(new Promise((r) => (resolveScripts = r))).mockResolvedValueOnce(new Map());
      page.viewer().centerChanged.emit(CENTER);
      await settle(page);
      // far enough to load again
      page.viewer().centerChanged.emit({ ...CENTER, x: CENTER.x + 500 });
      await settle(page);
      resolveScripts(new Map([[50, [{ id: 50, delay: 0, command: 1 }]]]));
      await settle(page);
      expect(page.viewer().paths()[0].points[1].info).toContain('script 50');
    });

    it('loads the spawns again only once the camera went some way, or when asked to', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.viewer().centerChanged.emit({ ...CENTER, x: CENTER.x + 50 });
      await settle(page);
      expect(mocks.service.loadSpawns).toHaveBeenCalledTimes(1);
      page.viewer().centerChanged.emit({ ...CENTER, x: CENTER.x + 200 });
      await settle(page);
      expect(mocks.service.loadSpawns).toHaveBeenCalledTimes(2);
      page.click('refresh');
      await settle(page);
      expect(mocks.service.loadSpawns).toHaveBeenCalledTimes(3);
      // a failed load is tried again on the next move
      mocks.service.loadSpawns.mockRejectedValueOnce(new Error('gone'));
      page.click('refresh');
      await settle(page);
      page.viewer().centerChanged.emit({ ...CENTER, x: CENTER.x + 210 });
      await settle(page);
      expect(mocks.service.loadSpawns).toHaveBeenCalledTimes(5);
    });

    it('ignores waypoints of an older camera position', async () => {
      const { page } = await setup();
      let resolveWaypoints: (w: WaypointRecord[]) => void = () => undefined;
      mocks.service.loadWaypoints.mockReturnValueOnce(new Promise((r) => (resolveWaypoints = r))).mockResolvedValueOnce([]);
      page.viewer().centerChanged.emit(CENTER);
      await settle(page);
      page.viewer().centerChanged.emit({ x: 0, y: 0, z: 0 });
      await settle(page);
      resolveWaypoints(WAYPOINTS);
      await settle(page);
      expect(page.viewer().paths()).toEqual([]);
    });

    it('clears the old map when teleporting to another one', async () => {
      mocks.service.searchTele.mockResolvedValue([
        { id: 7, name: 'Northshire', map: 0, x: 1, y: 2, z: 3 },
        { id: 8, name: 'Teldrassil', map: 1, x: 1, y: 2, z: 3 },
      ]);
      const { page } = await setup();
      await loadArea(page);
      page.viewer().picked.emit({ type: 'spawn', key: 'creature:1', position: { x: 0, y: 0, z: 0 } });
      page.type('tele-search', 'a');
      page.submit('tele-search-btn');
      await settle(page);
      page.click('tele-7');
      await settle(page);
      expect(page.viewer().spawns().length).toBe(3);
      expect(page.viewer().selectedKey()).toBe('creature:1');

      page.submit('tele-search-btn');
      await settle(page);
      mocks.service.loadSpawns.mockReturnValue(new Promise(() => undefined));
      page.click('tele-8');
      await settle(page);
      expect(page.viewer().spawns()).toEqual([]);
      expect(page.viewer().selectedKey()).toBeUndefined();
    });
  });

  describe('deleting & keyboard', () => {
    it('undoes and redoes pending changes with the buttons and Ctrl+Z / Ctrl+Y', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.click('tool-place-creature');
      await settle(page);
      page.type('place-entry', '197');
      page.byId('place-entry').nativeElement.dispatchEvent(new Event('change'));
      await settle(page);
      for (const x of [1, 2]) {
        page.viewer().picked.emit({ type: 'ground', position: { x, y: 2, z: 3 } });
        await settle(page);
      }
      const shortcut = (key: string, extra: KeyboardEventInit = {}, target: HTMLElement = page.fixture.nativeElement as HTMLElement) =>
        target.dispatchEvent(
          new KeyboardEvent('keydown', { key, code: keyCode(key), ctrlKey: true, bubbles: true, cancelable: true, ...extra }),
        );
      const count = () => page.text('pending-count');
      expect(count()).toBe('2');
      expect(page.byId<HTMLButtonElement>('redo').nativeElement.disabled).toBe(true);

      page.click('undo');
      page.fixture.detectChanges();
      expect(count()).toBe('1');
      shortcut('z');
      page.fixture.detectChanges();
      expect(count()).toBe('0');
      expect(page.byId<HTMLButtonElement>('undo').nativeElement.disabled).toBe(true);
      shortcut('Z', { ctrlKey: false, metaKey: true });
      page.fixture.detectChanges();
      expect(count()).toBe('0');

      shortcut('y');
      page.fixture.detectChanges();
      expect(count()).toBe('1');
      shortcut('Z', { shiftKey: true });
      page.fixture.detectChanges();
      expect(count()).toBe('2');
      shortcut('Y');
      page.click('redo');
      page.fixture.detectChanges();
      expect(count()).toBe('2');

      // in a text field, Ctrl+Z is the field's own undo
      shortcut('z', {}, page.byId('place-entry').nativeElement);
      page.fixture.detectChanges();
      expect(count()).toBe('2');

      // a new change after undoing drops what could be redone
      page.click('undo');
      page.viewer().picked.emit({ type: 'ground', position: { x: 9, y: 2, z: 3 } });
      await settle(page);
      expect(page.byId<HTMLButtonElement>('redo').nativeElement.disabled).toBe(true);
      expect(count()).toBe('2');

      // discarding starts a new history
      page.click('discard-changes');
      page.fixture.detectChanges();
      expect(page.byId<HTMLButtonElement>('undo').nativeElement.disabled).toBe(true);
    });

    it('deletes the selected spawn or waypoint', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.viewer().picked.emit({ type: 'spawn', key: 'creature:1', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      page.click('delete-selected');
      await settle(page);
      expect(page.byId('nothing-selected')).toBeTruthy();

      page.viewer().picked.emit({ type: 'waypoint', key: 'path:10#1', pathKey: 'path:10', point: 1, position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      page.key('Delete');
      page.key('Delete');
      await settle(page);
      expect(page.pendingLines()).toEqual(['Delete creature 1 (Deputy Willem)', 'Delete waypoint 10 #1']);
    });

    it('handles keyboard shortcuts outside of inputs', async () => {
      const { page } = await setup();
      await loadArea(page);
      page.key('r');
      page.fixture.detectChanges();
      expect(page.viewer().gizmoMode()).toBe('rotate');
      page.key('R');
      page.key('x');
      page.key('r', page.byId('goto-x').nativeElement);
      page.fixture.detectChanges();
      expect(page.viewer().gizmoMode()).toBe('translate');

      page.click('tool-place-creature');
      page.viewer().picked.emit({ type: 'spawn', key: 'creature:1', position: { x: 0, y: 0, z: 0 } });
      page.key('Escape');
      await settle(page);
      expect(page.byId('tool-select').nativeElement.classList).toContain('btn-primary');
      expect(page.byId('nothing-selected')).toBeTruthy();
    });
  });

  describe('pending changes', () => {
    const withChange = async () => {
      const result = await setup();
      await loadArea(result.page);
      result.page.viewer().objectMoved.emit({ key: 'gameobject:3', position: { x: 1, y: 2, z: 3 }, orientation: 0 });
      await settle(result.page);
      return result;
    };

    it('copies the SQL', async () => {
      const { page } = await withChange();
      expect(page.text('pending-count')).toBe('1');
      page.click('copy-sql');
      expect(mocks.clipboard.copyFromContent).toHaveBeenCalledWith(expect.stringContaining('UPDATE `gameobject`'));
    });

    it('executes the SQL and reloads', async () => {
      const { page } = await withChange();
      page.click('execute-sql');
      await settle(page);
      const sql = mocks.service.execute.mock.calls[0][0] as string;
      expect(sql.startsWith('START TRANSACTION;\nUPDATE `gameobject`')).toBe(true);
      expect(sql.endsWith('\nCOMMIT;')).toBe(true);
      expect(mocks.toastr.success).toHaveBeenCalledWith('Query executed successfully', 'Success');
      expect(page.byId('no-changes')).toBeTruthy();
      expect(mocks.service.loadSpawns).toHaveBeenCalledTimes(2);
    });

    it('keeps the changes when executing fails', async () => {
      const { page } = await withChange();
      mocks.service.execute
        .mockRejectedValueOnce({ message: 'Duplicate entry' })
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce({})
        .mockRejectedValueOnce(new Error('connection lost'));
      page.click('execute-sql');
      await settle(page);
      expect(mocks.service.execute).toHaveBeenNthCalledWith(2, 'ROLLBACK;');
      page.click('execute-sql');
      await settle(page);
      expect(mocks.toastr.error).toHaveBeenNthCalledWith(1, 'Duplicate entry', 'Query error');
      expect(mocks.toastr.error).toHaveBeenNthCalledWith(2, 'Error when executing the query!', 'Query error');
      expect(page.text('pending-count')).toBe('1');
    });

    it('discards the changes', async () => {
      const { page } = await withChange();
      page.click('discard-changes');
      await settle(page);
      expect(page.byId('no-changes')).toBeTruthy();
    });
  });
});
