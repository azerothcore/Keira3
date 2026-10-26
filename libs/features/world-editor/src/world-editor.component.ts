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
import { tileCenter, WowClientService, WowDataSettingsService, WowMap, WorldPosition } from '@keira/shared/wow-data';
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
      points: points.map((p) => ({ point: p.point, position: { x: p.x, y: p.y, z: p.z }, delay: p.delay })),
    }));
  });

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

  protected setRenderFlag(key: 'showBuildings' | 'showDoodads' | 'showModels' | 'zoneLighting' | 'advancedDistances', event: Event): void {
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
  }

  protected async saveSettings(): Promise<void> {
    this.settings.save(this.settingsForm.getRawValue());
    await this.client.close();
    this.showSettings.set(false);
    await this.loadMaps();
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
    this.teleResults.set(text ? await this.service.searchTele(text) : []);
  }

  protected goToTele(tele: TeleRow): void {
    if (Number(tele.map) !== this.mapId()) {
      this.selectedKey.set(undefined);
      this.loadedSpawns.set([]);
      this.loadedWaypoints.set([]);
    }
    this.mapId.set(Number(tele.map));
    this.focus.set({ x: Number(tele.x), y: Number(tele.y), z: Number(tele.z) });
    this.teleResults.set([]);
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
      if (request === this.spawnRequest) {
        this.loadedWaypoints.set(waypoints);
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
      this.select(result.type === 'ground' ? undefined : result.key);
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
