import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';
import {
  GizmoMode,
  ObjectMoved,
  parseWaypointKey,
  PickResult,
  WaypointPath,
  waypointKey,
  WorldRenderSettingsService,
  WorldSpawn,
  WorldViewerComponent,
} from '@keira/shared/world-viewer';
import {
  CacheUsage,
  tileCenter,
  TileCoord,
  tileKey,
  tilesInBounds,
  WowClientService,
  WowDataCacheService,
  WowDataSettingsService,
  WowMap,
  WowZone,
  WorldPosition,
} from '@keira/shared/wow-data';
import { TranslatePipe } from '@ngx-translate/core';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';
import { WorldEditorChanges } from './world-editor-changes';
import {
  EditorTool,
  LayerVisibility,
  parseSpawnKey,
  pathKey,
  SpawnRecord,
  spawnKey,
  SpawnType,
  TeleRow,
  WaypointRecord,
} from './world-editor.model';
import { WorldEditorService } from './world-editor.service';
import { GpsLocation, parseGpsOutput } from './gps';
import { describeWaypoint, WaypointSaiRow, WaypointScriptStep } from './waypoint-info';

const LAST_VIEW_KEY = 'keira3.worldEditor.lastView';

interface LastView extends WorldPosition {
  mapId: number;
}

/** Map and camera position the editor was last looking at, saved on this computer. */
function loadLastView(): LastView | undefined {
  try {
    const view = JSON.parse(localStorage.getItem(LAST_VIEW_KEY) ?? 'null') as Partial<LastView> | null;
    const valid = view && [view.mapId, view.x, view.y, view.z].every((value) => typeof value === 'number' && Number.isFinite(value));
    return valid ? (view as LastView) : undefined;
  } catch {
    return undefined;
  }
}

function saveLastView(view: LastView): void {
  localStorage.setItem(LAST_VIEW_KEY, JSON.stringify(view));
}

type RenderFlagKey = 'showRoofs' | 'showBuildings' | 'showDoodads' | 'showModels' | 'zoneLighting' | 'advancedDistances' | 'loadWholeZone';
type RenderDistanceKey = 'drawDistance' | 'largeDoodadDistance' | 'smallDoodadDistance' | 'creatureDistance' | 'gameobjectDistance';

/**
 * 3D world editor: shows the terrain of a map with its creature/gameobject spawns and waypoint paths, and turns
 * placing, moving, rotating and deleting them into SQL that the user reviews before executing.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-world-editor',
  templateUrl: './world-editor.component.html',
  styleUrl: './world-editor.component.scss',
  imports: [ReactiveFormsModule, TranslatePipe, WorldViewerComponent, HighlightjsWrapperComponent],
  host: { '(keydown)': 'onKeydown($event)' },
})
export class WorldEditorComponent implements OnInit {
  private readonly service = inject(WorldEditorService);
  private readonly client = inject(WowClientService);
  private readonly settings = inject(WowDataSettingsService);
  protected readonly renderSettings = inject(WorldRenderSettingsService);
  protected readonly cache = inject(WowDataCacheService);
  private readonly toastr = inject(ToastrService);
  private readonly clipboard = inject(ClipboardService);
  private readonly route = inject(ActivatedRoute);

  private readonly changes = new WorldEditorChanges();
  /** Bumped on every pending edit, so the computed views below recompute. */
  private readonly revision = signal(0);

  // ---------------------------------------------------------------- state

  protected readonly maps = signal<WowMap[]>([]);
  protected readonly mapId = signal(0);
  protected readonly mapDirectory = computed(() => this.maps().find((m) => m.id === this.mapId())?.directory);
  protected readonly focus = signal<WorldPosition | undefined>(undefined);
  protected readonly cacheSize = signal(0);
  /** Megabytes, for the settings panel. */
  protected readonly cacheSizeMb = computed(() => (this.cacheSize() / 1_000_000).toFixed(1));
  protected readonly preloading = signal<{ label: string; directory: string; done: number; total: number } | undefined>(undefined);
  protected readonly cacheUsage = signal<CacheUsage | undefined>(undefined);
  /** What each map takes in the cache, biggest first, for the settings panel. */
  protected cacheRows(cache: CacheUsage): { directory: string; name: string; tiles: number; mb: string }[] {
    const maps = this.maps();
    return cache.maps
      .map((usage) => ({
        directory: usage.directory,
        name: maps.find((map) => map.directory.toLowerCase() === usage.directory)?.name ?? usage.directory,
        tiles: usage.tiles,
        mb: (usage.bytes / 1_000_000).toFixed(1),
      }))
      .sort((a, b) => Number(b.mb) - Number(a.mb));
  }
  private preloadCancelled = false;
  protected readonly zones = signal<WowZone[]>([]);
  protected readonly zoneId = signal(0);
  /** The selected zone, loaded whole when the View panel asks for it. */
  protected readonly region = computed(() =>
    this.renderSettings.settings().loadWholeZone ? this.zones().find((zone) => zone.areaId === this.zoneId())?.bounds : undefined,
  );
  protected readonly layers = signal<LayerVisibility>({ creatures: true, gameobjects: true, waypoints: true });
  protected readonly tool = signal<EditorTool>('select');
  protected readonly gizmoMode = signal<GizmoMode>('translate');
  protected readonly snapToGround = signal(true);
  protected readonly selectedKey = signal<string | undefined>(undefined);
  protected readonly showSettings = signal(!this.settings.isConfigured());
  protected readonly showView = signal(false);
  /** Draw distances offered, in yards (0 = off, per group in advanced mode only). */
  protected readonly drawDistances = [50, 100, 250, 500, 1000];
  protected readonly groupDistances = [0, ...this.drawDistances];
  /** The advanced per-group distances, as rows of the View panel's table. */
  protected readonly distanceGroups: { key: RenderDistanceKey; label: string }[] = [
    { key: 'largeDoodadDistance', label: 'WORLD_EDITOR.LARGE_DOODADS' },
    { key: 'smallDoodadDistance', label: 'WORLD_EDITOR.SMALL_DOODADS' },
    { key: 'creatureDistance', label: 'WORLD_EDITOR.CREATURE_MODELS' },
    { key: 'gameobjectDistance', label: 'WORLD_EDITOR.GAMEOBJECT_MODELS' },
  ];
  protected readonly loadingSpawns = signal(false);
  protected readonly teleResults = signal<TeleRow[]>([]);
  protected readonly placeEntryName = signal('');
  protected readonly executing = signal(false);

  private readonly loadedSpawns = signal<SpawnRecord[]>([]);
  private readonly loadedWaypoints = signal<WaypointRecord[]>([]);
  private readonly waypointScripts = signal(new Map<number, WaypointScriptStep[]>());
  private readonly waypointSai = signal<WaypointSaiRow[]>([]);
  private center?: WorldPosition;
  private spawnRequest = 0;
  /** Last guid handed out per type, chained so quick consecutive placements never get the same guid. */
  private readonly nextGuids = new Map<SpawnType, Promise<number>>();
  /** Path ids handed out to new paths in this session (not saved yet). */
  private reservedPathIds: number[] = [];

  protected readonly spawns = computed(() => {
    this.revision();
    return this.changes.applyToSpawns(this.loadedSpawns(), this.mapId());
  });

  private readonly pathIds = computed(() => [
    ...new Set(
      this.spawns()
        .map((s) => s.pathId)
        .filter((id) => id > 0),
    ),
  ]);

  private readonly waypoints = computed(() => {
    this.revision();
    return this.changes.applyToWaypoints(this.loadedWaypoints(), this.pathIds());
  });

  protected readonly worldSpawns = computed<WorldSpawn[]>(() => {
    const layers = this.layers();
    return this.spawns()
      .filter((s) => (s.type === 'creature' ? layers.creatures : layers.gameobjects))
      .map((s) => ({
        key: spawnKey(s.type, s.guid),
        kind: s.type,
        guid: s.guid,
        entry: s.entry,
        label: `${s.name || s.entry} · ${s.type} ${s.guid}${s.pathId ? ` · path ${s.pathId}` : ''}`,
        position: { x: s.x, y: s.y, z: s.z },
        orientation: s.o,
        pending: this.changes.isNewSpawn(spawnKey(s.type, s.guid)),
        displayId: s.displayId,
        scale: s.scale,
      }));
  });

  protected readonly worldPaths = computed<WaypointPath[]>(() => {
    if (!this.layers().waypoints) {
      return [];
    }
    const byPath = new Map<number, WaypointRecord[]>();
    for (const waypoint of this.waypoints()) {
      byPath.set(waypoint.pathId, [...(byPath.get(waypoint.pathId) ?? []), waypoint]);
    }
    const owners = this.pathOwners();
    return [...byPath].map(([pathId, points]) => ({
      key: pathKey(pathId),
      label: `Path ${pathId}`,
      owners: owners.get(pathId) ?? [],
      closed: true,
      points: points.map((p) => ({
        point: p.point,
        position: { x: p.x, y: p.y, z: p.z },
        delay: p.delay,
        info: this.waypointInfo(p),
      })),
    }));
  });

  /** What happens at a waypoint (wait, move type, script, SmartAI of the creatures walking the path). */
  protected waypointInfo(waypoint: WaypointRecord): string[] {
    const walkers = this.spawns().filter((s) => s.type === 'creature' && s.pathId === waypoint.pathId);
    const ids = new Set(walkers.flatMap((s) => [s.entry, -s.guid]));
    const sai = this.waypointSai().filter((row) => ids.has(row.entryorguid));
    return describeWaypoint(waypoint.pathId, waypoint.point, waypoint, this.waypointScripts(), sai);
  }

  /** Creatures walking each loaded path ("Name (guid)"). */
  protected readonly pathOwners = computed(() => {
    const owners = new Map<number, string[]>();
    for (const spawn of this.spawns()) {
      if (spawn.pathId) {
        owners.set(spawn.pathId, [...(owners.get(spawn.pathId) ?? []), `${spawn.name || spawn.entry} (${spawn.guid})`]);
      }
    }
    return owners;
  });

  protected readonly selectedSpawn = computed(() => this.findSpawn(this.selectedKey() ?? ''));
  protected readonly selectedWaypoint = computed(() => this.findWaypoint(this.selectedKey() ?? ''));

  /** Path new waypoints are appended to: the selected waypoint's path, or the selected creature's. */
  protected readonly activePathId = computed(() => this.selectedWaypoint()?.pathId ?? this.selectedSpawn()?.pathId ?? 0);

  /** Paths coming from creature_template_addon: shared by every creature of an entry. */
  private readonly templatePathIds = computed(
    () =>
      new Set(
        this.spawns()
          .filter((s) => s.pathFromTemplate)
          .map((s) => s.pathId),
      ),
  );

  protected readonly editableKey = computed(() =>
    this.tool() === 'select' && (this.selectedSpawn() || this.selectedWaypoint()) ? this.selectedKey() : undefined,
  );

  protected readonly pendingSql = computed(() => {
    this.revision();
    return this.changes.toSql();
  });

  protected readonly pendingDescriptions = computed(() => {
    this.revision();
    return this.changes.describe();
  });

  // ---------------------------------------------------------------- forms

  protected readonly settingsForm = new FormGroup({
    clientPath: new FormControl(this.settings.paths().clientPath, { nonNullable: true }),
    serverDataPath: new FormControl(this.settings.paths().serverDataPath, { nonNullable: true }),
    cacheFolder: new FormControl(this.cache.folder(), { nonNullable: true }),
  });
  protected readonly placeEntry = new FormControl<number | null>(null);
  protected readonly teleSearch = new FormControl('', { nonNullable: true });
  protected readonly goToForm = new FormGroup({
    x: new FormControl<number | null>(null),
    y: new FormControl<number | null>(null),
    z: new FormControl<number | null>(null),
  });
  protected readonly placementForm = new FormGroup({
    x: new FormControl(0, { nonNullable: true }),
    y: new FormControl(0, { nonNullable: true }),
    z: new FormControl(0, { nonNullable: true }),
    o: new FormControl(0, { nonNullable: true }),
  });

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const map = Number(params.get('map') ?? 0);
    this.mapId.set(Number.isFinite(map) ? map : 0);
    const [x, y, z] = ['x', 'y', 'z'].map((name) => Number(params.get(name)));
    if (params.has('x') && params.has('y') && Number.isFinite(x) && Number.isFinite(y)) {
      this.focus.set({ x, y, z: Number.isFinite(z) ? z : 0 });
    } else if (!params.has('map')) {
      // reopen where the user left off
      const last = loadLastView();
      if (last) {
        this.mapId.set(last.mapId);
        this.focus.set({ x: last.x, y: last.y, z: last.z });
      }
    }
    const select = params.get('select');
    if (select) {
      this.selectedKey.set(select);
    }
    void this.loadMaps();
  }

  // ---------------------------------------------------------------- settings & navigation

  protected toggleView(): void {
    this.showView.update((shown) => !shown);
  }

  protected setLowDetailTerrain(event: Event): void {
    this.renderSettings.update({ lowDetailTerrain: (event.target as HTMLInputElement).checked });
  }

  protected setRenderFlag(key: RenderFlagKey, event: Event): void {
    this.renderSettings.update({ [key]: (event.target as HTMLInputElement).checked });
  }

  protected setRenderDistance(key: RenderDistanceKey, event: Event): void {
    this.renderSettings.update({ [key]: Number((event.target as HTMLSelectElement).value) });
  }

  protected setTerrainRadius(event: Event): void {
    this.renderSettings.update({ terrainRadius: Number((event.target as HTMLSelectElement).value) });
  }

  protected toggleSettings(): void {
    this.showSettings.update((shown) => !shown);
    void this.refreshCacheUsage();
  }

  protected async saveSettings(): Promise<void> {
    const { clientPath, serverDataPath, cacheFolder } = this.settingsForm.getRawValue();
    this.settings.save({ clientPath, serverDataPath });
    this.cache.setFolder(cacheFolder);
    await this.client.close();
    void this.refreshCacheUsage();
    this.showSettings.set(false);
    await this.loadMaps();
  }

  // ---------------------------------------------------------------- cache

  /** Total size, and per map when the client can be read. */
  private async refreshCacheUsage(): Promise<void> {
    this.cacheSize.set(this.cache.size());
    if (!this.client.isSupported() || !this.settings.isConfigured()) {
      return;
    }
    try {
      const usage = await this.client.cacheUsage();
      this.cacheUsage.set(usage);
      this.cacheSize.set(usage.totalBytes);
    } catch {
      // the client can't be opened (yet): the total is still shown
      this.cacheUsage.set(undefined);
    }
  }

  protected setCacheEnabled(event: Event): void {
    this.cache.setEnabled((event.target as HTMLInputElement).checked);
  }

  protected clearCache(): void {
    this.cache.clear();
    void this.refreshCacheUsage();
  }

  /** Processes the selected zone, the whole map, or every map into the disk cache. */
  protected async preload(scope: 'zone' | 'map' | 'all'): Promise<void> {
    this.preloadCancelled = false;
    this.preloading.set({ label: '', directory: '', done: 0, total: 0 });
    let tileCount = 0;
    try {
      const jobs = await this.preloadJobs(scope);
      for (const [index, job] of jobs.entries()) {
        if (this.preloadCancelled) {
          break;
        }
        const label = jobs.length > 1 ? `${index + 1}/${jobs.length} ${job.name}` : job.name;
        const directory = job.directory.toLowerCase();
        this.preloading.set({ label, directory, done: 0, total: job.tiles.length });
        await this.client.preload(
          job.directory,
          job.tiles,
          (done, total) => this.preloading.set({ label, directory, done, total }),
          () => this.preloadCancelled,
        );
        tileCount += job.tiles.length;
        await this.refreshCacheUsage();
      }
      if (!this.preloadCancelled) {
        this.toastr.success(`Preloaded ${tileCount} tiles.`, 'World Editor');
      }
    } catch (error) {
      this.toastr.error((error as Error).message, 'World Editor');
    } finally {
      this.preloading.set(undefined);
      await this.refreshCacheUsage();
    }
  }

  /** The maps and tiles a preload covers (maps without terrain, like most dungeons, have no tiles to preload). */
  private async preloadJobs(scope: 'zone' | 'map' | 'all'): Promise<{ directory: string; name: string; tiles: TileCoord[] }[]> {
    const maps = scope === 'all' ? this.maps() : this.maps().filter((map) => map.id === this.mapId());
    const jobs = [];
    for (const map of maps) {
      let tiles = await this.client.getMapTiles(map.directory);
      const zone = this.zones().find((z) => z.areaId === this.zoneId());
      if (scope === 'zone' && zone) {
        const inZone = new Set(tilesInBounds(zone.bounds, { tx: 32, ty: 32 }).map(tileKey));
        tiles = tiles.filter((tile) => inZone.has(tileKey(tile)));
      }
      if (tiles.length > 0) {
        jobs.push({ directory: map.directory, name: scope === 'zone' && zone ? zone.name : map.name, tiles });
      }
    }
    return jobs;
  }

  protected cancelPreload(): void {
    this.preloadCancelled = true;
  }

  private async loadMaps(): Promise<void> {
    if (!this.client.isSupported() || !this.settings.isConfigured()) {
      return;
    }
    try {
      this.maps.set(await this.client.getMaps());
      if (!this.focus()) {
        await this.focusMapCenter();
      }
      await this.loadZones();
    } catch (error) {
      this.toastr.error((error as Error).message, 'World Editor');
    }
  }

  protected async onMapChange(event: Event): Promise<void> {
    this.mapId.set(Number((event.target as HTMLSelectElement).value));
    this.selectedKey.set(undefined);
    this.loadedSpawns.set([]);
    this.loadedWaypoints.set([]);
    await this.focusMapCenter();
    await this.loadZones();
  }

  private async loadZones(): Promise<void> {
    this.zoneId.set(0);
    try {
      this.zones.set(await this.client.getZones(this.mapId()));
    } catch (error) {
      this.zones.set([]);
      this.toastr.error((error as Error).message, 'World Editor');
    }
  }

  /** Looks at the middle of the chosen zone. */
  protected onZoneChange(event: Event): void {
    const zone = this.zones().find((z) => z.areaId === Number((event.target as HTMLSelectElement).value));
    this.zoneId.set(zone?.areaId ?? 0);
    if (zone) {
      const { minX, maxX, minY, maxY } = zone.bounds;
      this.focus.set({ x: (minX + maxX) / 2, y: (minY + maxY) / 2, z: 0 });
    }
  }

  /** Looks at the middle of the map's terrain tiles (maps rarely have anything at 0,0). */
  private async focusMapCenter(): Promise<void> {
    const directory = this.mapDirectory();
    const tiles = directory ? await this.client.getMapTiles(directory) : [];
    if (tiles.length === 0) {
      this.focus.set({ x: 0, y: 0, z: 0 });
      return;
    }
    const middle = tiles[Math.floor(tiles.length / 2)];
    this.focus.set(tileCenter(middle));
  }

  protected async searchTele(): Promise<void> {
    const text = this.teleSearch.value.trim();
    const gps = parseGpsOutput(text);
    if (gps) {
      this.teleSearch.setValue('');
      this.goToGps(gps);
      return;
    }
    this.teleResults.set(text ? await this.service.searchTele(text) : []);
  }

  protected goToTele(tele: TeleRow): void {
    this.goTo(Number(tele.map), { x: Number(tele.x), y: Number(tele.y), z: Number(tele.z) });
    this.teleResults.set([]);
  }

  /** Pasting the output of the in-game `.gps` command goes straight to that place. */
  protected onPasteLocation(event: ClipboardEvent): void {
    const gps = parseGpsOutput(event.clipboardData?.getData('text') ?? '');
    if (gps) {
      event.preventDefault();
      this.goToGps(gps);
    }
  }

  private goToGps(gps: GpsLocation): void {
    this.goToForm.setValue({ x: gps.x, y: gps.y, z: gps.z });
    this.goTo(gps.map, { x: gps.x, y: gps.y, z: gps.z });
  }

  private goTo(map: number, position: WorldPosition): void {
    const changedMap = map !== this.mapId();
    if (changedMap) {
      this.selectedKey.set(undefined);
      this.loadedSpawns.set([]);
      this.loadedWaypoints.set([]);
    }
    this.mapId.set(map);
    this.focus.set(position);
    if (changedMap) {
      void this.loadZones();
    }
  }

  protected goToCoordinates(): void {
    const { x, y, z } = this.goToForm.getRawValue();
    if (x === null || y === null) {
      return;
    }
    this.focus.set({ x, y, z: z ?? 0 });
  }

  protected toggleLayer(layer: keyof LayerVisibility): void {
    this.layers.update((layers) => ({ ...layers, [layer]: !layers[layer] }));
  }

  // ---------------------------------------------------------------- viewer events

  protected async onCenterChanged(center: WorldPosition): Promise<void> {
    this.center = center;
    saveLastView({ mapId: this.mapId(), ...center });
    await this.reloadSpawns();
  }

  private async reloadSpawns(): Promise<void> {
    const center = this.center;
    if (!center || !this.mapDirectory()) {
      return;
    }
    const request = ++this.spawnRequest;
    this.loadingSpawns.set(true);
    try {
      const spawns = await this.service.loadSpawns(this.mapId(), center);
      if (request !== this.spawnRequest) {
        return;
      }
      this.loadedSpawns.set(spawns);
      const waypoints = await this.service.loadWaypoints(this.pathIds());
      if (request !== this.spawnRequest) {
        return;
      }
      this.loadedWaypoints.set(waypoints);
      const walkers = spawns.filter((s) => s.type === 'creature' && s.pathId);
      const [scripts, sai] = await Promise.all([
        this.service.loadWaypointScripts(waypoints.map((w) => w.action ?? 0)),
        this.service.loadWaypointSai(walkers),
      ]);
      if (request === this.spawnRequest) {
        this.waypointScripts.set(scripts);
        this.waypointSai.set(sai);
      }
    } catch (error) {
      this.toastr.error((error as Error).message, 'World Editor');
    } finally {
      if (request === this.spawnRequest) {
        this.loadingSpawns.set(false);
      }
    }
  }

  protected async onPicked(result: PickResult): Promise<void> {
    const tool = this.tool();
    if (tool === 'select') {
      this.select(result.type === 'spawn' || result.type === 'waypoint' ? result.key : undefined);
      return;
    }
    if (result.type !== 'ground') {
      return;
    }
    if (tool === 'add-waypoint') {
      this.addWaypointAt(result.position);
      return;
    }
    await this.placeSpawnAt(tool === 'place-creature' ? 'creature' : 'gameobject', result.position);
  }

  protected onObjectMoved(moved: ObjectMoved): void {
    const placement = { x: moved.position.x, y: moved.position.y, z: moved.position.z, o: moved.orientation };
    this.applyPlacement(moved.key, placement);
  }

  // ---------------------------------------------------------------- editing

  protected setTool(tool: EditorTool): void {
    this.tool.set(tool);
  }

  protected setGizmoMode(mode: GizmoMode): void {
    this.gizmoMode.set(mode);
  }

  protected toggleSnap(): void {
    this.snapToGround.update((snap) => !snap);
  }

  private select(key: string | undefined): void {
    this.selectedKey.set(key);
    const spawn = this.selectedSpawn();
    const waypoint = this.selectedWaypoint();
    if (spawn) {
      this.setPlacementForm(spawn);
    } else if (waypoint) {
      this.setPlacementForm({ ...waypoint, o: 0 });
    }
  }

  protected async onPlaceEntryChange(): Promise<void> {
    const entry = this.placeEntry.value;
    const type: SpawnType = this.tool() === 'place-gameobject' ? 'gameobject' : 'creature';
    this.placeEntryName.set(entry ? await this.service.getEntryName(type, entry) : '');
  }

  private async placeSpawnAt(type: SpawnType, position: WorldPosition): Promise<void> {
    const entry = this.placeEntry.value;
    if (!entry || entry <= 0) {
      this.toastr.warning(`Enter the ${type} entry to place first.`, 'World Editor');
      return;
    }
    const next = (this.nextGuids.get(type) ?? this.service.getMaxGuid(type)).then((last) => last + 1);
    this.nextGuids.set(type, next);
    const guid = await next;
    const [name, display] = await Promise.all([this.service.getEntryName(type, entry), this.service.getEntryDisplay(type, entry)]);
    this.changes.placeSpawn({ type, guid, entry, name, map: this.mapId(), ...position, o: 0, pathId: 0, ...display });
    this.bump();
    this.select(spawnKey(type, guid));
  }

  private addWaypointAt(position: WorldPosition): void {
    const pathId = this.activePathId();
    if (!pathId) {
      this.toastr.warning('Select a creature with a path (or create one) before adding waypoints.', 'World Editor');
      return;
    }
    if (this.templatePathIds().has(pathId)) {
      this.toastr.warning(
        `Path ${pathId} comes from creature_template_addon and is shared by every creature of this entry; edit it in the creature template instead.`,
        'World Editor',
      );
      return;
    }
    const points = this.waypoints().filter((w) => w.pathId === pathId);
    const point = points.reduce((max, w) => Math.max(max, w.point), 0) + 1;
    this.changes.addWaypoint({ pathId, point, ...position, delay: 0 });
    this.bump();
    this.select(waypointKey(pathKey(pathId), point));
  }

  /** The placement form is only shown while something is selected. */
  protected applyPlacementForm(): void {
    this.applyPlacement(this.selectedKey() as string, this.placementForm.getRawValue());
  }

  private applyPlacement(key: string, placement: { x: number; y: number; z: number; o: number }): void {
    const spawn = this.findSpawn(key);
    if (spawn) {
      const original = this.loadedSpawns().find((s) => s.type === spawn.type && s.guid === spawn.guid) ?? spawn;
      this.changes.moveSpawn(original, placement);
    } else {
      const waypoint = this.findWaypoint(key);
      if (!waypoint) {
        return;
      }
      const original = this.loadedWaypoints().find((w) => w.pathId === waypoint.pathId && w.point === waypoint.point) ?? waypoint;
      this.changes.moveWaypoint(original, placement);
    }
    this.bump();
    if (key === this.selectedKey()) {
      this.setPlacementForm(placement);
    }
  }

  protected deleteSelected(): void {
    const spawn = this.selectedSpawn();
    const waypoint = this.selectedWaypoint();
    if (spawn) {
      this.changes.deleteSpawn(spawn);
    } else if (waypoint) {
      this.changes.deleteWaypoint(waypoint);
    } else {
      return;
    }
    this.selectedKey.set(undefined);
    this.bump();
  }

  /** Only offered for a selected creature without a path. */
  protected async createPath(): Promise<void> {
    const spawn = this.selectedSpawn() as SpawnRecord;
    const pathId = await this.service.getFreePathId(spawn.guid, this.reservedPathIds);
    this.reservedPathIds = [...this.reservedPathIds, pathId];
    this.changes.createPath(spawn.guid, pathId);
    this.bump();
    this.tool.set('add-waypoint');
  }

  // ---------------------------------------------------------------- pending changes

  protected copySql(): void {
    this.clipboard.copyFromContent(this.pendingSql());
  }

  /**
   * Runs the pending SQL in one transaction, so a failing statement leaves the database untouched (Keira uses a single
   * connection, so the ROLLBACK reaches the same session). Only offered while there are pending changes.
   */
  protected async executeSql(): Promise<void> {
    this.executing.set(true);
    try {
      await this.service.execute(`START TRANSACTION;\n${this.pendingSql()}\nCOMMIT;`);
      this.toastr.success('Query executed successfully', 'Success');
      this.clearChanges();
      await this.reloadSpawns();
    } catch (error) {
      await this.service.execute('ROLLBACK;').catch(() => undefined);
      this.toastr.error((error as { message?: string }).message ?? 'Error when executing the query!', 'Query error');
    } finally {
      this.executing.set(false);
    }
  }

  protected discardChanges(): void {
    this.clearChanges();
    this.selectedKey.set(undefined);
  }

  private clearChanges(): void {
    this.changes.clear();
    this.nextGuids.clear();
    this.reservedPathIds = [];
    this.bump();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
      return;
    }
    if (event.key === 'Delete') {
      this.deleteSelected();
    } else if (event.key === 'Escape') {
      this.tool.set('select');
      this.selectedKey.set(undefined);
    } else if (event.key === 'r' || event.key === 'R') {
      this.gizmoMode.update((mode) => (mode === 'rotate' ? 'translate' : 'rotate'));
    }
  }

  // ---------------------------------------------------------------- helpers

  private setPlacementForm(p: { x: number; y: number; z: number; o: number }): void {
    const round = (value: number): number => Math.round(value * 10_000) / 10_000;
    this.placementForm.setValue({ x: round(p.x), y: round(p.y), z: round(p.z), o: round(p.o) });
  }

  private bump(): void {
    this.revision.update((r) => r + 1);
  }

  private findSpawn(key: string): SpawnRecord | undefined {
    const parsed = parseSpawnKey(key);
    return parsed && this.spawns().find((s) => s.type === parsed.type && s.guid === parsed.guid);
  }

  private findWaypoint(key: string): WaypointRecord | undefined {
    const parsed = parseWaypointKey(key);
    const pathId = parsed ? Number(parsed.pathKey.replace('path:', '')) : undefined;
    return this.waypoints().find((w) => w.pathId === pathId && w.point === parsed?.point);
  }
}
