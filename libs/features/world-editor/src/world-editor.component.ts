import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';
import {
  ContextRequest,
  GizmoMode,
  CONTROL_ACTIONS,
  CONTROL_GROUPS,
  ControlAction,
  controlFor,
  inputLabel,
  inputOf,
  ObjectMoved,
  parseWaypointKey,
  PathProbeRequest,
  PathProbeResult,
  PickResult,
  waypointKey,
  WaypointPath,
  WorldControlsSettingsService,
  WorldRenderSettingsService,
  WorldAreaTrigger,
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
  AreaTriggerInfo,
} from '@keira/shared/wow-data';
import { TranslatePipe } from '@ngx-translate/core';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';
import { ChangesSnapshot } from './world-editor-changes';
import { WorldEditorSessionService } from './world-editor-session.service';
import { WORLD_EDITOR_LINKS } from '@keira/shared/constants';
import {
  EditorTool,
  LayerVisibility,
  parseSpawnKey,
  pathKey,
  SpawnQuest,
  SpawnRecord,
  spawnKey,
  SpawnType,
  TeleRow,
  WaypointRecord,
} from './world-editor.model';
import { WorldEditorService } from './world-editor.service';
import { GpsLocation, parseGpsOutput } from './gps';
import { describeWaypoint, WaypointSaiRow, WaypointScriptStep } from './waypoint-info';
import { isSpawnVisible, loadSpawnFilters, saveSpawnFilters, SpawnFilters, spawnEvents } from './spawn-filters';

/** "Marshal McBride - Creature (GUID: 1, Entry: 197)", as shown on hover and in the selection panel. */
export function spawnTitle(spawn: { type: SpawnType; name: string; guid: number; entry: number }): string {
  const type = spawn.type === 'creature' ? 'Creature' : 'GameObject';
  return `${spawn.name || spawn.entry} - ${type} (GUID: ${spawn.guid}, Entry: ${spawn.entry})`;
}

/** Creatures walking each path ("Name (guid)"), by path id. */
function pathOwners(spawns: SpawnRecord[]): Map<number, string[]> {
  const owners = new Map<number, string[]>();
  for (const spawn of spawns) {
    if (spawn.pathId) {
      owners.set(spawn.pathId, [...(owners.get(spawn.pathId) ?? []), `${spawn.name || spawn.entry} (${spawn.guid})`]);
    }
  }
  return owners;
}

/** The number typed in a field, when it is one and not negative (empty fields give nothing). */
function positiveNumber(event: Event): number | undefined {
  const text = (event.target as HTMLInputElement).value;
  const value = Number(text);
  return text !== '' && Number.isFinite(value) && value >= 0 ? value : undefined;
}

/** Quests shown on hover before "+N more": the rest while Alt is held. */
const HOVER_QUESTS = 1;

/** "3175.5 MB (3.18 GB)". */
export function formatSize(bytes: number): string {
  return `${(bytes / 1_000_000).toFixed(1)} MB (${(bytes / 1_000_000_000).toFixed(2)} GB)`;
}

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

/** How many steps can be undone. */
const HISTORY_SIZE = 100;

type RenderFlagKey =
  | 'showRoofs'
  | 'showBuildings'
  | 'showDoodads'
  | 'showModels'
  | 'showFacingArrows'
  | 'showWanderRadius'
  | 'showCollision'
  | 'showNavMesh'
  | 'zoneLighting'
  | 'advancedDistances'
  | 'loadWholeZone';
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
  host: { '(keydown)': 'onKeydown($event)', '(document:pointerdown)': 'onDocumentPointerDown($event)' },
})
export class WorldEditorComponent implements OnInit {
  /** What the editor is in the middle of, kept across visits. */
  private readonly session = inject(WorldEditorSessionService);
  private readonly service = inject(WorldEditorService);
  private readonly client = inject(WowClientService);
  private readonly settings = inject(WowDataSettingsService);
  protected readonly renderSettings = inject(WorldRenderSettingsService);
  protected readonly cache = inject(WowDataCacheService);
  protected readonly controls = inject(WorldControlsSettingsService);
  protected readonly controlActions = CONTROL_ACTIONS;
  protected readonly controlGroups = CONTROL_GROUPS;
  protected readonly inputLabel = inputLabel;
  protected readonly showControls = this.session.showControls;
  /** Mouse controls for the help card (keys are listed from the bindings). */
  protected readonly mouseHelp = [
    { input: 'WORLD_EDITOR.HELP_LEFT_DRAG', label: 'WORLD_EDITOR.HELP_PAN' },
    { input: 'WORLD_EDITOR.HELP_RIGHT_DRAG', label: 'WORLD_EDITOR.HELP_ROTATE' },
    { input: 'WORLD_EDITOR.HELP_WHEEL', label: 'WORLD_EDITOR.HELP_ZOOM' },
    { input: 'WORLD_EDITOR.HELP_SHIFT_WHEEL', label: 'WORLD_EDITOR.HELP_SPEED' },
    { input: 'WORLD_EDITOR.HELP_SHIFT', label: 'WORLD_EDITOR.HELP_FAST' },
    { input: 'WORLD_EDITOR.HELP_ALT_CLICK', label: 'WORLD_EDITOR.HELP_MOVE_SELECTION' },
    { input: 'WORLD_EDITOR.HELP_RIGHT_CLICK', label: 'WORLD_EDITOR.HELP_MENU' },
  ];
  /** Path / LOS tool: A, C, the attack range and eye height, and the answer. */
  protected readonly probeFrom = this.session.probeFrom;
  protected readonly probeTo = this.session.probeTo;
  protected readonly probeRange = this.session.probeRange;
  protected readonly probeHeight = this.session.probeHeight;
  protected readonly probeResult = signal<PathProbeResult | undefined>(undefined);
  protected readonly rangePresets = [
    { range: 5, label: 'WORLD_EDITOR.RANGE_MELEE' },
    { range: 20, label: 'WORLD_EDITOR.RANGE_SHORT' },
    { range: 30, label: 'WORLD_EDITOR.RANGE_RANGED' },
    { range: 40, label: 'WORLD_EDITOR.RANGE_LONG' },
  ];
  protected readonly isRangePreset = computed(() => this.rangePresets.some((preset) => preset.range === this.probeRange()));
  protected readonly probeRequest = computed<PathProbeRequest | undefined>(() => {
    const from = this.probeFrom();
    return this.tool() === 'probe' && from ? { from, to: this.probeTo(), range: this.probeRange(), height: this.probeHeight() } : undefined;
  });
  /** The action waiting for a key press to be bound to it. */
  protected readonly capturing = signal<ControlAction | undefined>(undefined);
  private readonly toastr = inject(ToastrService);
  private readonly clipboard = inject(ClipboardService);
  private readonly route = inject(ActivatedRoute);
  protected readonly links = inject(WORLD_EDITOR_LINKS, { optional: true });

  private readonly changes = this.session.changes;
  /** Bumped on every pending edit, so the computed views below recompute. */
  private readonly revision = signal(0);
  private get history(): ChangesSnapshot[] {
    return this.session.history;
  }
  private set history(history: ChangesSnapshot[]) {
    this.session.history = history;
  }
  private get historyIndex(): number {
    return this.session.historyIndex;
  }
  private set historyIndex(index: number) {
    this.session.historyIndex = index;
  }
  protected readonly canUndo = computed(() => (this.revision(), this.historyIndex > 0));
  protected readonly canRedo = computed(() => (this.revision(), this.historyIndex < this.history.length - 1));

  // ---------------------------------------------------------------- state

  protected readonly maps = signal<WowMap[]>([]);
  protected readonly mapId = signal(0);
  protected readonly mapDirectory = computed(() => this.maps().find((m) => m.id === this.mapId())?.directory);
  protected readonly focus = signal<WorldPosition | undefined>(undefined);
  protected readonly cacheSize = signal(0);
  /** Megabytes, for the settings panel. */
  protected readonly cacheSizeText = computed(() => formatSize(this.cacheSize()));
  protected readonly formatSize = formatSize;
  /** How full the cache is, in % of its maximum size. */
  protected readonly cacheFill = computed(() => {
    const max = this.cache.maxBytes();
    return max > 0 ? Math.min(100, (100 * this.cacheSize()) / max) : 100;
  });
  /** Green, then yellow from 50%, orange from 75% and red from 90%. */
  protected readonly cacheFillLevel = computed(() => {
    const fill = this.cacheFill();
    return fill >= 90 ? 'full' : fill >= 75 ? 'high' : fill >= 50 ? 'half' : 'low';
  });
  /** The preload running: the current map's steps, and which of how many maps it is on. */
  protected readonly preloading = signal<
    { label: string; directory: string; done: number; total: number; map: number; maps: number } | undefined
  >(undefined);

  /** Whole percent of `done` out of `total` (0 when nothing is known yet). */
  protected percent(done: number, total: number): number {
    return total ? Math.floor((100 * done) / total) : 0;
  }
  protected readonly cacheUsage = signal<CacheUsage | undefined>(undefined);
  /** What each map takes in the cache, biggest first, for the settings panel. */
  protected cacheRows(cache: CacheUsage): { directory: string; name: string; tiles: number; bytes: number }[] {
    const maps = this.maps();
    return cache.maps
      .map((usage) => ({
        directory: usage.directory,
        name: maps.find((map) => map.directory.toLowerCase() === usage.directory)?.name ?? usage.directory,
        tiles: usage.tiles,
        bytes: usage.bytes,
      }))
      .sort((a, b) => b.bytes - a.bytes);
  }
  private preloadCancelled = false;
  protected readonly zones = signal<WowZone[]>([]);
  protected readonly zoneId = this.session.zoneId;
  /** The selected zone, loaded whole when the View panel asks for it. */
  protected readonly region = computed(() =>
    this.renderSettings.settings().loadWholeZone ? this.zones().find((zone) => zone.areaId === this.zoneId())?.bounds : undefined,
  );
  protected readonly layers = this.session.layers;
  /** Area triggers of the current map, with what the database does with them. */
  private readonly areaTriggerList = signal<AreaTriggerInfo[]>([]);
  private readonly areaTriggerInfo = signal(new Map<number, string[]>());
  protected readonly worldAreaTriggers = computed<WorldAreaTrigger[]>(() => {
    if (!this.layers().areaTriggers) {
      return [];
    }
    const info = this.areaTriggerInfo();
    return this.areaTriggerList().map((trigger) => ({
      key: `areatrigger:${trigger.id}`,
      label: [`Area trigger ${trigger.id}`, ...(info.get(trigger.id) ?? [])].join('\n'),
      position: { x: trigger.x, y: trigger.y, z: trigger.z },
      radius: trigger.radius,
      box: trigger.box,
    }));
  });
  protected readonly filters = signal<SpawnFilters>(loadSpawnFilters());
  protected readonly showFilters = this.session.showFilters;
  private readonly eventNames = signal(new Map<number, string>());
  /** Game events with spawns around, for the Filters panel. */
  protected readonly events = computed(() => spawnEvents(this.spawns(), this.eventNames()));
  /** How many of the loaded spawns the filters hide. */
  protected readonly hiddenCount = computed(() => this.spawns().length - this.visibleSpawns().length);
  protected readonly tool = this.session.tool;
  protected readonly gizmoMode = this.session.gizmoMode;
  /** Where moved objects snap: nowhere, onto the ground/floor below, or against the nearest wall. */
  protected readonly snapMode = this.session.snapMode;
  protected readonly snapToGround = computed(() => this.snapMode() === 'ground');
  protected readonly snapToWall = computed(() => this.snapMode() === 'wall');
  protected readonly selectedKey = this.session.selectedKey;
  protected readonly showSettings = signal(!this.settings.isConfigured());
  protected readonly showView = this.session.showView;
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
  /** Quests started or ended by the loaded entries, by `type:entry`. */
  private readonly quests = signal(new Map<string, SpawnQuest[]>());
  private center?: WorldPosition;
  private spawnRequest = 0;
  private readonly nextGuids = this.session.nextGuids;
  private get reservedPathIds(): number[] {
    return this.session.reservedPathIds;
  }
  private set reservedPathIds(ids: number[]) {
    this.session.reservedPathIds = ids;
  }

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

  /** Spawns the filters let through; the paths they walk are the only ones drawn. */
  private readonly visibleSpawns = computed(() => {
    const filters = this.filters();
    return this.spawns().filter((s) => isSpawnVisible(s, filters));
  });

  protected readonly worldSpawns = computed<WorldSpawn[]>(() => {
    const layers = this.layers();
    const showWander = this.renderSettings.settings().showWanderRadius;
    return this.visibleSpawns()
      .filter((s) => (s.type === 'creature' ? layers.creatures : layers.gameobjects))
      .map((s) => ({
        key: spawnKey(s.type, s.guid),
        kind: s.type,
        guid: s.guid,
        entry: s.entry,
        label: `${spawnTitle(s)}${s.pathId ? ` · path ${s.pathId}` : ''}`,
        ...this.spawnDetails(s),
        position: { x: s.x, y: s.y, z: s.z },
        orientation: s.o,
        pending: this.changes.isNewSpawn(spawnKey(s.type, s.guid)),
        displayId: s.displayId,
        scale: s.scale,
        wanderRadius: showWander ? s.wanderDistance : undefined,
      }));
  });

  protected readonly worldPaths = computed<WaypointPath[]>(() => {
    if (!this.layers().waypoints) {
      return [];
    }
    // only the paths walked by a creature the filters show
    const owners = pathOwners(this.visibleSpawns());
    const byPath = new Map<number, WaypointRecord[]>();
    for (const waypoint of this.waypoints().filter((w) => owners.has(w.pathId))) {
      byPath.set(waypoint.pathId, [...(byPath.get(waypoint.pathId) ?? []), waypoint]);
    }
    return [...byPath].map(([pathId, points]) => ({
      key: pathKey(pathId),
      label: `Path ${pathId}`,
      owners: owners.get(pathId) as string[],
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
  protected readonly spawnTitle = spawnTitle;

  /** Hover lines of a spawn: its event, its phase when not 1, and its quests (all of them with Alt). */
  private spawnDetails(spawn: SpawnRecord): { details?: string[]; allDetails?: string[] } {
    const lines: string[] = [];
    if (spawn.event) {
      lines.push(`Event ${spawn.event} (${this.eventNames().get(spawn.event) || '?'})`);
    }
    if (spawn.phaseMask !== undefined && spawn.phaseMask !== 1) {
      lines.push(`Phase mask ${spawn.phaseMask}`);
    }
    const quests = (this.quests().get(`${spawn.type}:${spawn.entry}`) ?? []).map(
      (q) => `${q.role === 'starts' ? 'Starts' : 'Ends'} quest ${q.quest} (${q.title || '?'})`,
    );
    if (lines.length === 0 && quests.length === 0) {
      return {};
    }
    const more = quests.length - HOVER_QUESTS;
    return {
      details: [...lines, ...quests.slice(0, HOVER_QUESTS), ...(more > 0 ? [`+${more} more (hold Alt)`] : [])],
      allDetails: [...lines, ...quests],
    };
  }

  protected waypointInfo(waypoint: WaypointRecord): string[] {
    const walkers = this.spawns().filter((s) => s.type === 'creature' && s.pathId === waypoint.pathId);
    const ids = new Set(walkers.flatMap((s) => [s.entry, -s.guid]));
    const sai = this.waypointSai().filter((row) => ids.has(row.entryorguid));
    return describeWaypoint(waypoint.pathId, waypoint.point, waypoint, this.waypointScripts(), sai);
  }

  /** Creatures walking each loaded path ("Name (guid)"). */
  protected readonly pathOwners = computed(() => pathOwners(this.spawns()));

  /** The right-click menu: what it is about and where (pixels in the 3D view). */
  protected readonly contextMenu = signal<ContextRequest | undefined>(undefined);
  // (only read while the menu is open)
  protected readonly contextSpawn = computed(() => this.findSpawn((this.contextMenu() as ContextRequest).key));
  protected readonly contextWaypoint = computed(() => this.findWaypoint((this.contextMenu() as ContextRequest).key));
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

  protected setKeyboardNavigation(event: Event): void {
    this.controls.setKeyboardNavigation((event.target as HTMLInputElement).checked);
  }

  /** "W / ↑" */
  protected bindingsLabel(action: ControlAction): string {
    return this.controls.settings().bindings[action].map(inputLabel).join(' / ');
  }

  protected setProbeRange(event: Event): void {
    const value = positiveNumber(event);
    if (value !== undefined) {
      this.probeRange.set(value);
    }
  }

  protected setProbeHeight(event: Event): void {
    const value = positiveNumber(event);
    if (value !== undefined) {
      this.probeHeight.set(value);
    }
  }

  protected clearProbe(): void {
    this.probeFrom.set(undefined);
    this.probeTo.set(undefined);
    this.probeResult.set(undefined);
  }

  /** Copies a `.go xyz` command to that spot. */
  protected copyGo(position: WorldPosition): void {
    this.clipboard.copyFromContent(`.go xyz ${position.x.toFixed(2)} ${position.y.toFixed(2)} ${position.z.toFixed(2)} ${this.mapId()}`);
  }

  protected toggleControls(): void {
    this.showControls.update((shown) => !shown);
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

  protected setCacheMaxGb(event: Event): void {
    this.cache.setMaxBytes(Number((event.target as HTMLInputElement).value) * 1_000_000_000);
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
    this.preloading.set({ label: '', directory: '', done: 0, total: 0, map: 0, maps: 0 });
    let tileCount = 0;
    try {
      const jobs = await this.preloadJobs(scope);
      for (const [index, job] of jobs.entries()) {
        if (this.preloadCancelled) {
          break;
        }
        const label = jobs.length > 1 ? `${index + 1}/${jobs.length} ${job.name}` : job.name;
        const directory = job.directory.toLowerCase();
        const maps = jobs.length;
        this.preloading.set({ label, directory, done: 0, total: job.tiles.length, map: index, maps });
        const completed = await this.client.preload(
          job.directory,
          job.tiles,
          (done, total) => this.preloading.set({ label, directory, done, total, map: index, maps }),
          () => this.preloadCancelled,
        );
        await this.refreshCacheUsage();
        if (!completed) {
          this.toastr.warning('The cache reached its maximum size: preloading stopped.', 'World Editor');
          return;
        }
        tileCount += job.tiles.length;
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
    for (const [index, map] of maps.entries()) {
      if (this.preloadCancelled) {
        break;
      }
      this.preloading.set({ label: `${map.name}…`, directory: '', done: index, total: maps.length, map: 0, maps: 0 });
      // one unreadable map shouldn't stop the others
      let tiles = await this.client.getMapTiles(map.directory).catch((error: Error) => {
        console.warn(`[World Editor] Could not read the tiles of ${map.directory}: ${error.message}`);
        return [];
      });
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
      // the view may have reported where it looks before the maps were known (e.g. when coming back to the editor)
      void this.reloadSpawns();
      await this.loadZones(true);
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

  /** The area triggers of the current map, and their database rows. */
  private async loadAreaTriggers(): Promise<void> {
    const mapId = this.mapId();
    try {
      const triggers = await this.client.getAreaTriggers(mapId);
      // a database without one of the areatrigger_* tables still shows the triggers
      const info = await this.service.loadAreaTriggerInfo(triggers.map((trigger) => trigger.id)).catch(() => new Map<number, string[]>());
      if (mapId === this.mapId()) {
        this.areaTriggerList.set(triggers);
        this.areaTriggerInfo.set(info);
      }
    } catch (error) {
      this.areaTriggerList.set([]);
      this.toastr.error((error as Error).message, 'World Editor');
    }
  }

  /** The zones of the current map; `keepZone` keeps the chosen one (coming back to the editor on the same map). */
  private async loadZones(keepZone = false): Promise<void> {
    void this.loadAreaTriggers();
    const kept = keepZone ? this.zoneId() : 0;
    this.zoneId.set(0);
    try {
      const zones = await this.client.getZones(this.mapId());
      this.zones.set(zones);
      this.zoneId.set(zones.some((zone) => zone.areaId === kept) ? kept : 0);
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

  protected toggleFilters(): void {
    this.showFilters.update((shown) => !shown);
  }

  protected setFilters(changes: Partial<SpawnFilters>): void {
    const filters = { ...this.filters(), ...changes };
    this.filters.set(filters);
    saveSpawnFilters(filters);
  }

  protected setFilterFlag(key: 'showTriggers' | 'showOtherPhases', event: Event): void {
    this.setFilters({ [key]: (event.target as HTMLInputElement).checked });
  }

  protected setFilterSearch(event: Event): void {
    this.setFilters({ search: (event.target as HTMLInputElement).value });
  }

  protected toggleEvent(id: number, event: Event): void {
    const others = this.filters().events.filter((shown) => shown !== id);
    this.setFilters({ events: (event.target as HTMLInputElement).checked ? [...others, id] : others });
  }

  /** Shows the spawns of every listed event, or of none. */
  protected setAllEvents(shown: boolean): void {
    this.setFilters({ events: shown ? this.events().map((e) => e.id) : [] });
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
      const [scripts, sai, eventNames, quests] = await Promise.all([
        this.service.loadWaypointScripts(waypoints.map((w) => w.action ?? 0)),
        this.service.loadWaypointSai(walkers),
        this.service.loadEventNames(spawns.map((s) => s.event ?? 0)),
        this.service.loadQuests(spawns),
      ]);
      if (request === this.spawnRequest) {
        this.waypointScripts.set(scripts);
        this.waypointSai.set(sai);
        this.eventNames.set(eventNames);
        const byEntry = new Map<string, SpawnQuest[]>();
        for (const quest of quests) {
          const key = `${quest.type}:${quest.entry}`;
          byEntry.set(key, [...(byEntry.get(key) ?? []), quest]);
        }
        this.quests.set(byEntry);
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
    if (tool === 'probe') {
      // A, then C; a third click starts again from A
      if (!this.probeFrom() || this.probeTo()) {
        this.probeFrom.set(result.position);
        this.probeTo.set(undefined);
        this.probeResult.set(undefined);
      } else {
        this.probeTo.set(result.position);
      }
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

  protected setSnapMode(event: Event): void {
    this.snapMode.set((event.target as HTMLSelectElement).value as 'off' | 'ground' | 'wall');
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
    this.history = [this.changes.snapshot()];
    this.historyIndex = 0;
    this.revision.update((r) => r + 1);
  }

  // ---------------------------------------------------------------- undo / redo

  protected undo(): void {
    if (this.canUndo()) {
      this.changes.restore(this.history[--this.historyIndex]);
      this.revision.update((r) => r + 1);
    }
  }

  protected redo(): void {
    if (this.canRedo()) {
      this.changes.restore(this.history[++this.historyIndex]);
      this.revision.update((r) => r + 1);
    }
  }

  protected onContextRequested(request: ContextRequest): void {
    this.select(request.key);
    this.contextMenu.set(request);
  }

  /** A press anywhere but on the menu closes it. */
  protected onDocumentPointerDown(event: PointerEvent): void {
    if (!(event.target as HTMLElement).closest('[data-testid="context-menu"]')) {
      this.contextMenu.set(undefined);
    }
  }

  protected openContextEntry(target: 'creature' | 'sai' | 'gameobject'): void {
    const spawn = this.contextSpawn() as SpawnRecord;
    const links = this.links as NonNullable<typeof this.links>;
    this.contextMenu.set(undefined);
    if (target === 'creature') {
      links.openCreature(spawn.entry, spawn.name);
    } else if (target === 'sai') {
      links.openCreatureSai(spawn.entry, spawn.name);
    } else {
      links.openGameObject(spawn.entry, spawn.name);
    }
  }

  protected copyContextGuid(): void {
    this.clipboard.copyFromContent(String((this.contextSpawn() as SpawnRecord).guid));
    this.contextMenu.set(undefined);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const capturing = this.capturing();
    if (capturing) {
      event.preventDefault();
      const input = inputOf(event);
      // a modifier on its own waits for the key it goes with; Esc cancels
      if (input === 'Escape') {
        this.capturing.set(undefined);
      } else if (input) {
        this.controls.addBinding(capturing, input);
        this.capturing.set(undefined);
      }
      return;
    }
    const target = event.target as HTMLElement;
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
      return;
    }
    const action = controlFor(this.controls.settings(), ['undo', 'redo', 'delete', 'toggleGizmo', 'cancel'], event);
    if (action === 'redo') {
      event.preventDefault();
      this.redo();
    } else if (action === 'undo') {
      event.preventDefault();
      this.undo();
    } else if (action === 'delete') {
      this.deleteSelected();
    } else if (action === 'cancel') {
      this.contextMenu.set(undefined);
      this.tool.set('select');
      this.selectedKey.set(undefined);
    } else if (action === 'toggleGizmo') {
      this.gizmoMode.update((mode) => (mode === 'rotate' ? 'translate' : 'rotate'));
    }
  }

  // ---------------------------------------------------------------- helpers

  private setPlacementForm(p: { x: number; y: number; z: number; o: number }): void {
    const round = (value: number): number => Math.round(value * 10_000) / 10_000;
    this.placementForm.setValue({ x: round(p.x), y: round(p.y), z: round(p.z), o: round(p.o) });
  }

  /** After every change: remembers the new state for undo (dropping what could be redone). */
  private bump(): void {
    this.history = [...this.history.slice(0, this.historyIndex + 1), this.changes.snapshot()].slice(-HISTORY_SIZE);
    this.historyIndex = this.history.length - 1;
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
