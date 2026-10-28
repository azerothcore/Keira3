import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  mmtileName,
  orientationToSceneYaw,
  sceneToWorld,
  tileKey,
  WowClientService,
  WorldBounds,
  WorldPosition,
  worldToScene,
  worldToTile,
  CHUNK_SIZE,
  serverAreaAt,
  perfFrame,
  perfTime,
} from '@keira/shared/wow-data';
import { Mesh, Object3D, Vector3 } from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { TerrainStreamer } from './terrain-streamer';
import { TextureCache } from './texture-cache';
import { DisplayModel, displayModel, SpawnModels } from './spawn-models';
import { WorldPrefetch } from './world-prefetch';
import { WorldDoodads } from './world-doodads';
import { ZoneLighting } from './zone-lighting';
import {
  controlFor,
  DEFAULT_WORLD_CONTROLS_SETTINGS,
  NAVIGATION_ACTIONS,
  NavigationAction,
  SHIFT_SPEED,
  WorldControlsSettings,
} from './world-controls-settings';
import { WorldNavMesh } from './world-navmesh';
import { WorldVmaps } from './world-vmaps';
import { collectServerTileGeometry } from './server-geometry';
import { sampleTimeline, simulationTimeline } from './simulation';
import { collectTileGeometry, loadRecast, rebuildNavMeshTile } from './navmesh-rebuild';
import { PathProber, PathProbeRequest, PathProbeResult } from './path-probe';
import { ExtraBuilding, WorldObjects } from './world-objects';
import { headingText, stretchText } from './heading';
import { DEFAULT_WORLD_RENDER_SETTINGS, drawDistances, WorldRenderSettings } from './world-render-settings';
import { WORLD_RENDERER_FACTORY, WorldRenderer } from './world-renderer';
import { PickOptions, WorldScene } from './world-scene';
import {
  ContextRequest,
  GROUND_KEY,
  GizmoMode,
  MovementSimulation,
  NavMeshRebuildRequest,
  NavMeshRebuildState,
  SimulationLeg,
  NavMeshTileInfo,
  WaypointCheck,
  WaypointCheckRequest,
  WorldLink,
  WorldBoundary,
  WorldMarker,
  ObjectMoved,
  parseWaypointKey,
  waypointKey,
  WaypointPlace,
  PickResult,
  WaypointPath,
  WorldAreaTrigger,
  WorldSpawn,
} from './world-viewer.model';

/** How long (ms) loading must have calmed down before the waypoints' places are worked out again. */
const CLASSIFY_DELAY = 250;
/** Time (ms) given each frame to working out waypoint places. */
const PLACE_BUDGET = 6;
/** How often (ms) the performance stats are updated. */
const STATS_INTERVAL = 500;

interface ViewerStats {
  /** Frames drawn per second (the view only draws when something changes). */
  fps: number;
  /** Time the last frames took to draw, on average (ms). */
  frameMs: number;
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
  programs: number;
  /** JavaScript memory in use (MB), where the browser tells it. */
  heapMb?: number;
  tiles: number;
  buildings: number;
  props: number;
  models: number;
  spawns: number;
}
const CLICK_TOLERANCE_PX = 4;
const CENTER_EMIT_DISTANCE = 60;
/** Textures loaded beyond which those nothing uses free their graphics memory. */
const TEXTURES_KEPT = 1500;
/** What kind of waypoint a point is, in its hover label. */
const PLACE_NAMES: Record<WaypointPlace, string> = {
  ground: 'on the ground',
  air: 'flying',
  water: 'in water (swimming)',
  under: 'under the map',
};
/** What hover labels and the context menu look at. */
const HOVER_PICK = { markersOnly: true, segments: true, areaTriggers: true, overlays: true };
/** How far the camera stands from a place it was sent to (close enough to see an NPC there). */
const FOCUS_DISTANCE = 40;
const RIGHT_BUTTON = 2;
/** Each Shift + wheel notch changes the camera speed by this factor. */
const SPEED_STEP = 1.25;
/** Keyboard movement speed (yards per second) when the camera is close; it grows with the camera distance. */
const KEY_MIN_SPEED = 20;
/** While something loads, how often (ms) the loading bar is refreshed. */
/** Wait (ms) after terrain or buildings loaded before checking the checked path again. */
const RECHECK_DELAY = 500;
const ACTIVITY_POLL = 250;

interface HoverLabel {
  text: string;
  x: number;
  y: number;
}

/**
 * Interactive 3D view of a map: streams terrain from the WoW client around the camera and shows spawns and waypoint
 * paths. Left-drag pans, right-drag rotates, wheel zooms. Clicks are reported through `picked`; the object named by
 * `editableKey` gets a move/rotate gizmo and reports its new placement through `objectMoved`.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-world-viewer',
  imports: [TranslatePipe],
  templateUrl: './world-viewer.component.html',
  styleUrl: './world-viewer.component.scss',
})
export class WorldViewerComponent implements AfterViewInit, OnDestroy {
  private readonly client = inject(WowClientService);
  private readonly rendererFactory = inject(WORLD_RENDERER_FACTORY);

  readonly mapDirectory = input<string | undefined>(undefined);
  readonly spawns = input<WorldSpawn[]>([]);
  readonly paths = input<WaypointPath[]>([]);
  readonly selectedKey = input<string | undefined>(undefined);
  readonly editableKey = input<string | undefined>(undefined);
  readonly gizmoMode = input<GizmoMode>('translate');
  readonly snapToGround = input<boolean>(true);
  /** Moved objects go against the nearest wall instead (and face away from it). */
  readonly snapToWall = input<boolean>(false);
  /** Clicks report the terrain under the cursor even over markers (for placing things). */
  readonly groundOnly = input<boolean>(false);
  /** Moves the camera to look at this position whenever it changes. */
  readonly focus = input<WorldPosition | undefined>(undefined);
  /** Quality and range of what is drawn. */
  readonly renderSettings = input<WorldRenderSettings>(DEFAULT_WORLD_RENDER_SETTINGS);
  /** Keyboard navigation (keys moving the camera while the view has the focus). */
  readonly navigation = input<WorldControlsSettings>(DEFAULT_WORLD_CONTROLS_SETTINGS);
  /** An area (e.g. a zone) whose terrain and buildings are loaded whole, on top of what's around the camera. */
  readonly region = input<WorldBounds | undefined>(undefined);

  /** The Path / LOS tool's question (A, C, range, eye height); undefined clears it. */
  readonly probe = input<PathProbeRequest | undefined>(undefined);
  /** "Check path": the points of a path to check (again whenever they change); undefined clears the marks. */
  readonly waypointCheck = input<WaypointCheckRequest | undefined>(undefined);
  /** Which collision the line of sight uses: the server's vmaps (once loaded) or the client's models. */
  readonly collisionSourceChanged = output<'server' | 'client'>();
  /** The answer to `waypointCheck`, one per point. */
  readonly waypointsChecked = output<WaypointCheck[]>();
  /** A navigation mesh tile to rebuild with other settings and draw over the real one; undefined clears it. */
  readonly navMeshRebuild = input<NavMeshRebuildRequest | undefined>(undefined);
  /** Hides the real navigation mesh tile under the rebuilt one. */
  readonly hideRealNavMesh = input<boolean>(false);
  /** How the `navMeshRebuild` is going. */
  readonly navMeshRebuilt = output<NavMeshRebuildState>();
  /** Spawns selected along with `selectedKey` (multi-select), highlighted like it. */
  readonly groupKeys = input<string[]>([]);
  /** A creature walking its path (or wandering), drawn as a moving copy of it; undefined stops it. */
  readonly simulation = input<MovementSimulation | undefined>(undefined);
  /** Positions to know the ground under (the spawn problems report); answered by `groundHeights`. */
  readonly groundQuery = input<{ key: string; position: WorldPosition }[] | undefined>(undefined);
  /** The ground (terrain or floor) under each `groundQuery` position: the first below it, else the highest; null where nothing is loaded. */
  readonly groundHeights = output<Record<string, number | null>>();
  /** Lines between places (formations, teleports, flight paths…). */
  readonly links = input<WorldLink[]>([]);
  /** Labelled markers (graveyards, flight masters, pools…), named on hover. */
  readonly markers = input<WorldMarker[]>([]);
  /** Boss boundaries, drawn on the ground and named on hover. */
  readonly boundaries = input<WorldBoundary[]>([]);
  /** Area trigger volumes to draw (empty = none). */
  readonly areaTriggers = input<WorldAreaTrigger[]>([]);
  readonly picked = output<PickResult>();
  /** The navigation mesh tile under the camera target, while the navigation mesh is shown (undefined otherwise). */
  readonly navMeshTileChanged = output<NavMeshTileInfo | undefined>();
  /** Shift + wheel asked for another camera speed (the caller saves it in `navigation`). */
  readonly speedChanged = output<number>();
  /** The answer to `probe`. */
  readonly probed = output<PathProbeResult>();
  /** The Path / LOS tool's A ('from') or C ('to') dragged somewhere else. */
  readonly probeMoved = output<{ which: 'from' | 'to'; position: WorldPosition }>();
  /** Right-click on a spawn or waypoint, for a context menu. */
  readonly contextRequested = output<ContextRequest>();
  readonly objectMoved = output<ObjectMoved>();
  /** Camera target, emitted after it moved more than ~60 yards (use it to load nearby spawns). */
  readonly centerChanged = output<WorldPosition>();

  protected readonly hoverLabel = signal<HoverLabel | undefined>(undefined);
  /** "Start" and "End" over the Path / LOS tool's A and C, where they are on screen. */
  protected readonly probeLabels = signal<{ which: 'from' | 'to'; x: number; y: number }[]>([]);
  protected readonly error = signal<string | undefined>(undefined);
  protected readonly loading = signal(false);
  /** What's still loading in the background (undefined when idle). */
  protected readonly activity = signal<
    { terrain: number; buildings: number; props: number; models: number; waypoints: number; percent: number } | undefined
  >(undefined);
  /** Everything there was to load since the loading bar showed (what's left plus what got done), for its percentage. */
  private loadTotal = 0;
  private loadPending = 0;
  /** The performance stats (View > Show performance stats). */
  protected readonly stats = signal<ViewerStats | undefined>(undefined);
  /** Buildings placed by the editor (a transport's ship on its map), at server positions. */
  readonly buildings = input<ExtraBuilding[]>([]);
  /** The editor is loading the spawns around the camera (shown in the same loading bar). */
  readonly spawnsLoading = input(false);
  /** Server position the camera looks at, for the readout in the corner. */
  protected readonly cameraTarget = signal<WorldPosition | undefined>(undefined);
  private activityTimer?: ReturnType<typeof setTimeout>;
  private altDragging = false;
  private readonly pressed = new Set<NavigationAction>();
  private fast = false;
  private moveFrame?: number;
  private lastMoveTime = 0;

  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private readonly world = new WorldScene();
  /** Whether the graphics card takes DXT textures as they are (then they're neither decoded nor converted). */
  private compressedTextures = false;
  private readonly textures = new TextureCache((path) =>
    this.compressedTextures ? this.client.getGpuTexture(path) : this.client.getTexture(path),
  );
  private readonly streamer = new TerrainStreamer(this.client, this.world, this.textures, () => this.onTileLoaded());
  private readonly objects = new WorldObjects(this.client, this.world.buildingGroup, this.textures, () => this.onTileLoaded());
  private readonly doodads = new WorldDoodads(this.client, this.world.doodadGroup, this.textures, () => this.requestRender());
  /** Reads the tiles beyond the drawn ones ahead of time, while nothing in sight is loading. */
  private readonly prefetch = new WorldPrefetch(this.client, {
    texture: (path) => this.textures.get(path),
    building: (path) => this.objects.prefetch(path),
    model: (path) => this.doodads.prefetch(path),
    idle: () => this.streamer.pendingCount + this.objects.pendingCount + this.doodads.pendingCount === 0,
  });
  private readonly navMesh = new WorldNavMesh(this.client, this.world.navMeshGroup, () => this.requestRender());
  private readonly prober = new PathProber(this.client, this.world);
  /** The server's collision (vmaps), loaded while it's needed: hitboxes shown, Path / LOS or Check path in use. */
  private readonly vmaps = new WorldVmaps(this.client, this.world.serverCollisionGroup, () => this.onCollisionLoaded());
  private collisionSource?: 'server' | 'client';
  private probeRequest = 0;
  private rebuildRequest = 0;
  private checkRequest = 0;
  private simulationRun = 0;
  private simulationFrame?: number;
  /** What the simulated creature is doing: the leg it's on, and how long it still waits there. */
  protected readonly simulationStatus = signal<{ label: string; wait?: number } | undefined>(undefined);
  private recheckTimer?: ReturnType<typeof setTimeout>;
  /** Id of the shown map (for mmtile names), once known. */
  private mapId?: number;
  protected readonly navMeshInfo = signal<NavMeshTileInfo | undefined>(undefined);
  /** The area under the camera target, from the server's terrain (`maps/`): "Goldshire (Elwynn Forest)". */
  protected readonly areaName = signal<string | undefined>(undefined);
  private areaChunk?: string;
  private readonly spawnModels = new SpawnModels(this.client, this.world, this.textures, () => this.requestRender());
  private readonly zoneLighting = new ZoneLighting(this.client, this.world, () => this.requestRender());
  private renderer?: WorldRenderer;
  // Created in ngAfterViewInit; effects may run before that, hence the guards in syncGizmo/lookAt.
  private controls?: MapControls;
  private gizmo!: TransformControls;
  private resizeObserver?: ResizeObserver;
  private frameRequested = false;
  private classifyTimer?: ReturnType<typeof setTimeout>;
  /** Waypoint places are being worked out, a slice per frame. */
  private placing = false;
  private pointerDown?: { x: number; y: number };
  private renderScale = 1;
  private markerModel = '';
  /** A or C of the Path / LOS tool being dragged. */
  private probeDragging?: 'from' | 'to';
  private lastEmittedCenter?: WorldPosition;
  /** The marker (the beam): where the last "go to" landed, or where Space put it; Home brings the camera there. */
  private marker?: WorldPosition;
  /** Alt held during the last hover: labels show all their details. */
  private altHeld = false;
  /** Where the cursor last was over the view, for Space. */
  private lastPointer?: PointerEvent;
  private hoverEvent?: PointerEvent;
  /** Camera target in scene space, shared with the map controls. */
  private readonly target = new Vector3();

  constructor() {
    effect(() => {
      const settings = this.renderSettings();
      untracked(() => {
        this.streamer.configure({ detailed: !settings.lowDetailTerrain, radius: settings.terrainRadius });
        this.objects.configure({ showBuildings: settings.showBuildings, radius: settings.terrainRadius });
        const distances = drawDistances(settings);
        this.doodads.configure({ show: settings.showDoodads, distance: distances.largeDoodads, smallDistance: distances.smallDoodads });
        this.spawnModels.configure({
          show: settings.showModels,
          creatureDistance: distances.creatures,
          gameobjectDistance: distances.gameobjects,
        });
        this.zoneLighting.configure(settings.zoneLighting);
        this.navMesh.configure({ show: settings.showNavMesh, radius: settings.terrainRadius });
        this.applyRenderScale(settings.renderScale);
        this.prefetch.configure({ rings: settings.loadAhead, radius: settings.terrainRadius, detailed: !settings.lowDetailTerrain });
        this.prefetch.update(this.center);
        void this.loadMarkerModel(settings.markerModel);
        this.world.setRoofsVisible(settings.showRoofs);
        this.world.setCollisionVisible(settings.showCollision);
        this.world.setFacingArrowsVisible(settings.showFacingArrows);
        this.world.setSolidSelection(settings.solidSelection);
        void this.streamer.update(this.center);
        void this.objects.update(this.center);
        void this.doodads.update(this.center);
        void this.navMesh.update(this.center);
        this.spawnModels.update(this.center);
        this.requestRender();
      });
    });
    effect(() => {
      const region = this.region();
      untracked(() => {
        this.streamer.setRegion(region);
        this.objects.setRegion(region);
        this.doodads.setRegion(region);
        this.navMesh.setRegion(region);
        this.spawnModels.setRegion(region);
        // everything around the camera (and in the region) is looked at again
        this.emitCenter(true);
      });
    });
    effect(() => void this.loadMap(this.mapDirectory()));
    effect(() => {
      const buildings = this.buildings();
      untracked(() => void this.objects.setExtras(buildings));
    });
    effect(() => {
      const kept = perfTime('scene spawns', () => this.world.setSpawns(this.spawns()));
      perfTime('spawn models set', () => this.spawnModels.setSpawns(this.spawns(), kept));
      untracked(() => this.syncGizmo());
      this.requestRender();
    });
    // (on their own: a change of one doesn't redraw the other)
    effect(() => {
      perfTime('scene paths', () => this.world.setWaypointPaths(this.paths()));
      untracked(() => {
        this.syncGizmo();
        this.workOutWaypointPlaces();
      });
      this.requestRender();
    });
    effect(() => {
      const request = this.probe();
      const directory = this.mapDirectory();
      untracked(() => void this.runProbe(directory, request));
    });
    effect(() => {
      const request = this.navMeshRebuild();
      const directory = this.mapDirectory();
      untracked(() => void this.runRebuild(directory, request));
    });
    effect(() => this.navMesh.setRealHidden(this.hideRealNavMesh()));
    effect(() => {
      const query = this.groundQuery();
      if (query) {
        untracked(() => {
          this.world.scene.updateMatrixWorld();
          const heights = Object.fromEntries(
            query.map(({ key, position }) => [key, this.world.groundHeightAt(position.x, position.y, position.z) ?? null]),
          );
          this.groundHeights.emit(heights);
        });
      }
    });
    effect(() => {
      this.world.setGroupSelection(this.groupKeys());
      this.requestRender();
    });
    effect(() => {
      const simulation = this.simulation();
      const directory = this.mapDirectory();
      untracked(() => void this.runSimulation(directory, simulation));
    });
    effect(() => {
      const enabled = this.renderSettings().showCollision || !!this.probe() || !!this.waypointCheck();
      untracked(() => {
        this.vmaps.configure({ enabled: enabled && this.client.isSupported(), radius: 1 });
        void this.vmaps.update(this.center);
      });
    });
    effect(() => {
      const request = this.waypointCheck();
      const directory = this.mapDirectory();
      // the paths drawn first, so the marks land on their points
      this.paths();
      untracked(() => void this.runWaypointCheck(directory, request));
    });
    effect(() => {
      this.world.setOverlays(this.links(), this.markers());
      this.requestRender();
    });
    effect(() => {
      this.world.setBoundaries(this.boundaries());
      this.requestRender();
    });
    effect(() => {
      this.world.setAreaTriggers(this.areaTriggers());
      this.requestRender();
    });
    effect(() => {
      this.world.setSelection(this.selectedKey());
      this.requestRender();
    });
    effect(() => {
      this.editableKey();
      this.gizmoMode();
      untracked(() => this.syncGizmo());
    });
    effect(() => {
      const target = this.focus();
      if (target) {
        untracked(() => {
          this.lookAt(target);
          this.setMarker(target);
        });
      }
    });
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef().nativeElement;
    this.renderer = this.rendererFactory(canvas);
    this.compressedTextures = ['WEBGL_compressed_texture_s3tc', 'WEBGL_compressed_texture_s3tc_srgb'].every(
      (name) => !!this.renderer?.extensions?.has(name),
    );
    this.renderScale = this.renderSettings().renderScale;
    this.renderer.setPixelRatio(window.devicePixelRatio * this.renderScale);

    // Shift + wheel changes the camera speed instead of zooming (listened to before the map controls get the event)
    this.host().nativeElement.addEventListener('wheel', this.onSpeedWheel, { capture: true, passive: false });
    this.controls = new MapControls(this.world.camera, canvas);
    this.controls.target = this.target;
    this.controls.screenSpacePanning = false;
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 900;
    this.controls.addEventListener('change', () => this.onCameraChange());

    this.gizmo = new TransformControls(this.world.camera, canvas);
    this.gizmo.addEventListener('dragging-changed', (event) => this.onGizmoDragging(event.value as boolean));
    this.gizmo.addEventListener('objectChange', () => this.onGizmoChange());
    this.world.scene.add(this.gizmo.getHelper());

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.host().nativeElement);
    }
    this.resize();

    const target = this.focus();
    this.lookAt(target ?? { x: 0, y: 0, z: 0 });
    this.syncGizmo();
  }

  ngOnDestroy(): void {
    clearTimeout(this.activityTimer);
    clearTimeout(this.recheckTimer);
    clearTimeout(this.classifyTimer);
    this.simulationRun++;
    if (this.simulationFrame !== undefined) {
      cancelAnimationFrame(this.simulationFrame);
    }
    if (this.moveFrame !== undefined) {
      cancelAnimationFrame(this.moveFrame);
    }
    this.streamer.dispose();
    this.objects.dispose();
    this.doodads.dispose();
    this.navMesh.dispose();
    this.vmaps.dispose();
    this.spawnModels.dispose();
    // stops reading ahead (what's waiting is dropped)
    void this.prefetch.setMap(undefined);
    this.resizeObserver?.disconnect();
    this.host().nativeElement.removeEventListener('wheel', this.onSpeedWheel, { capture: true });
    this.gizmo.detach();
    this.gizmo.dispose();
    this.controls?.dispose();
    this.renderer?.dispose();
    this.world.dispose();
    this.textures.dispose();
    this.renderer = undefined;
  }

  /** Server position the camera is looking at. */
  private get center(): WorldPosition {
    return sceneToWorld(this.target);
  }

  private lookAt(position: WorldPosition): void {
    const controls = this.controls;
    if (!controls) {
      return;
    }
    const target = worldToScene(position);
    this.target.set(target.x, target.y, target.z);
    this.world.camera.position.set(target.x - FOCUS_DISTANCE * 0.6, target.y + FOCUS_DISTANCE * 0.8, target.z + FOCUS_DISTANCE * 0.6);
    controls.update();
    this.emitCenter(true);
  }

  // ---------------------------------------------------------------- pointer handling

  protected onPointerDown(event: PointerEvent): void {
    if (this.startAltDrag(event) || this.startProbeDrag(event)) {
      return;
    }
    this.pointerDown = { x: event.clientX, y: event.clientY };
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.altDragging) {
      this.endAltDrag();
      return;
    }
    if (this.probeDragging) {
      this.endProbeDrag();
      return;
    }
    const start = this.pointerDown;
    this.pointerDown = undefined;
    if (!start || this.gizmo.dragging || Math.hypot(event.clientX - start.x, event.clientY - start.y) > CLICK_TOLERANCE_PX) {
      return;
    }
    if (event.button === RIGHT_BUTTON) {
      this.requestContext(event);
      return;
    }
    if (event.button !== 0) {
      return;
    }
    const result = this.pickAt(event, { groundOnly: this.groundOnly() });
    if (result) {
      this.picked.emit(event.ctrlKey || event.metaKey ? { ...result, additive: true } : result);
    }
  }

  /**
   * A right-click that didn't rotate the view: a context menu for what's under the cursor (a spawn, waypoint, path
   * stretch, area trigger, marker or link), with its hover text.
   */
  private requestContext(event: PointerEvent): void {
    const result = this.pickAt(event, HOVER_PICK);
    const label = result && this.textOf(result);
    const rect = this.host().nativeElement.getBoundingClientRect();
    if (!label) {
      // the ground (or a building): a menu for the place itself
      const ground = this.pickAt(event, { groundOnly: true });
      if (ground) {
        const { x, y, z } = ground.position;
        const label = `${x.toFixed(2)} ${y.toFixed(2)} ${z.toFixed(2)}`;
        this.contextRequested.emit({
          key: GROUND_KEY,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          label,
          position: ground.position,
          marker: this.marker,
        });
      }
      return;
    }
    const key = result.type === 'segment' ? `${result.pathKey}:${result.from}-${result.to}` : (result as { key: string }).key;
    this.contextRequested.emit({
      key,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      label,
      position: result.position,
      marker: this.marker,
    });
  }

  protected onPointerMove(event: PointerEvent): void {
    this.lastPointer = event;
    if (this.altDragging) {
      this.altDragTo(event);
      return;
    }
    if (this.probeDragging) {
      this.probeDragTo(event);
      return;
    }
    if (this.pointerDown || this.gizmo.dragging) {
      this.hoverLabel.set(undefined);
      return;
    }
    // Hover picking is throttled to one per frame and only tests markers.
    const pending = this.hoverEvent;
    this.hoverEvent = event;
    if (!pending) {
      requestAnimationFrame(() => this.updateHover());
    }
  }

  private updateHover(): void {
    const event = this.hoverEvent as PointerEvent;
    this.hoverEvent = undefined;
    this.altHeld = event.altKey;
    const result = this.pickAt(event, HOVER_PICK);
    const text = result && this.textOf(result);
    const rect = this.host().nativeElement.getBoundingClientRect();
    this.hoverLabel.set(text ? { text, x: event.clientX - rect.left + 14, y: event.clientY - rect.top + 14 } : undefined);
  }

  protected onPointerLeave(): void {
    this.hoverEvent = undefined;
    this.lastPointer = undefined;
    this.hoverLabel.set(undefined);
  }

  private pickAt(event: PointerEvent, options: PickOptions = {}): PickResult | undefined {
    const rect = this.canvasRef().nativeElement.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return undefined;
    }
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    return this.world.pick(x, y, options);
  }

  /** The hover text of what's under the cursor (also the title of its context menu). */
  private textOf(result: PickResult): string | undefined {
    switch (result.type) {
      case 'segment':
        return this.segmentLabel(result);
      case 'areatrigger':
        return this.areaTriggers().find((trigger) => trigger.key === result.key)?.label;
      case 'overlay': {
        // a marker, or the arrow of a labelled link (with the way it points)
        const overlay =
          this.markers().find((marker) => marker.key === result.key) ??
          this.links().find((link) => link.key === result.key) ??
          this.boundaries().find((boundary) => boundary.key === result.key);
        const label = (overlay as { label: string }).label;
        return result.direction === undefined ? label : `${label}\n→ ${headingText(result.direction)}`;
      }
      default:
        // (hover picks skip the ground)
        return this.labelFor((result as { key: string }).key);
    }
  }

  private segmentLabel(segment: { pathKey: string; from: number; to: number }): string {
    const path = this.paths().find((p) => p.key === segment.pathKey) as WaypointPath;
    const owners = path.owners?.length ? ` — ${path.owners.join(', ')}` : '';
    // (the arrow is drawn between two of its points)
    const [from, to] = [segment.from, segment.to].map(
      (point) => (path.points.find((p) => p.point === point) as { position: WorldPosition }).position,
    );
    const place = (point: number) => PLACE_NAMES[this.world.waypointPlaceOf(waypointKey(segment.pathKey, point)) as WaypointPlace];
    return `${path.label} · #${segment.from} (${place(segment.from)}) → #${segment.to} (${place(segment.to)})${owners}\n${stretchText(from, to)}`;
  }

  private labelFor(key: string): string {
    const spawn = this.spawns().find((s) => s.key === key);
    if (spawn) {
      const details = (this.altHeld && spawn.allDetails) || spawn.details || [];
      return [spawn.label, ...details].join('\n');
    }
    // Every other pickable object is a waypoint of one of the paths.
    const { pathKey, point } = parseWaypointKey(key) as { pathKey: string; point: number };
    const path = this.paths().find((p) => p.key === pathKey) as WaypointPath;
    const owners = path.owners?.length ? ` — ${path.owners.join(', ')}` : '';
    const info = path.points.find((p) => p.point === point)?.info ?? [];
    const place = PLACE_NAMES[this.world.waypointPlaceOf(key) as WaypointPlace];
    return `${path.label} · #${point} · ${place}${info.map((line) => ` · ${line}`).join('')}${owners}`;
  }

  // ---------------------------------------------------------------- keyboard navigation

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Alt') {
      this.setAltHeld(true);
    }
    const marker = controlFor(this.navigation(), ['markerToCursor', 'cameraToMarker'], event);
    if (marker) {
      event.preventDefault();
      if (marker === 'markerToCursor') {
        this.markerToCrosshair();
      } else {
        this.cameraToMarker();
      }
      return;
    }
    const action = this.navigationAction(event);
    if (!action) {
      return;
    }
    event.preventDefault();
    this.pressed.add(action);
    this.fast = event.shiftKey;
    if (this.moveFrame === undefined) {
      this.lastMoveTime = performance.now();
      this.moveFrame = requestAnimationFrame((time) => this.moveStep(time));
    }
  }

  /** Alt pressed or released while hovering: shows the label with all or with the short details. */
  private setAltHeld(held: boolean): void {
    if (this.lastPointer && !this.hoverEvent) {
      this.hoverEvent = new MouseEvent('pointermove', {
        clientX: this.lastPointer.clientX,
        clientY: this.lastPointer.clientY,
        altKey: held,
      }) as PointerEvent;
      requestAnimationFrame(() => this.updateHover());
    }
  }

  protected onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Alt') {
      this.setAltHeld(false);
    }
    const action = this.navigationAction(event);
    if (action) {
      this.pressed.delete(action);
    }
    this.fast = event.shiftKey;
  }

  protected onBlur(): void {
    this.pressed.clear();
  }

  /** Answers the Path / LOS tool; a newer request makes an older answer be dropped. */
  private async runProbe(directory: string | undefined, request: PathProbeRequest | undefined): Promise<void> {
    const id = ++this.probeRequest;
    if (!directory || !request) {
      this.world.setProbe(undefined);
      this.requestRender();
      return;
    }
    const result = await this.prober.probe(directory, request);
    if (id !== this.probeRequest) {
      return;
    }
    const eye = (p: WorldPosition): WorldPosition => ({ ...p, z: p.z + request.height });
    this.world.setProbe({
      ...result,
      sight: result.to && { from: eye(result.from), to: eye(result.to), blockedAt: result.blockedAt },
    });
    this.requestRender();
    this.probed.emit(result);
  }

  /**
   * Plays the movement simulation: the creature's copy walks each leg (along the navigation mesh when there is one,
   * straight when flying or without one) at its speed, waits on arrival, and starts over after the last leg.
   */
  private async runSimulation(directory: string | undefined, simulation: MovementSimulation | undefined): Promise<void> {
    const run = ++this.simulationRun;
    if (this.simulationFrame !== undefined) {
      cancelAnimationFrame(this.simulationFrame);
      this.simulationFrame = undefined;
    }
    this.simulationStatus.set(undefined);
    if (!directory || !simulation || !this.world.setGhost(simulation.key)) {
      this.world.setGhost(undefined);
      this.requestRender();
      return;
    }
    const segments: { points: WorldPosition[]; leg: SimulationLeg }[] = [];
    let from = simulation.start;
    for (const leg of simulation.legs) {
      const walked = leg.fly ? undefined : await this.prober.walkPath(directory, from, leg.to);
      if (run !== this.simulationRun) {
        return;
      }
      segments.push({ points: walked && walked.length > 1 ? walked : [from, leg.to], leg });
      from = leg.to;
    }
    const timeline = simulationTimeline(simulation.start, segments);
    const started = performance.now();
    const step = (): void => {
      const elapsed = ((performance.now() - started) / 1000) * simulation.rate;
      const at = sampleTimeline(timeline, elapsed);
      this.world.moveGhost(at.position, at.orientation);
      this.simulationStatus.set(at.status);
      this.requestRender();
      if (timeline.duration > 0) {
        this.simulationFrame = requestAnimationFrame(() => run === this.simulationRun && step());
      }
    };
    step();
  }

  /** Checks a path's points and marks them; a newer request makes an older answer be dropped. */
  private async runWaypointCheck(directory: string | undefined, request: WaypointCheckRequest | undefined): Promise<void> {
    const id = ++this.checkRequest;
    if (!directory || !request) {
      this.world.setWaypointChecks([]);
      this.requestRender();
      return;
    }
    const checks = await this.prober.checkPath(directory, request);
    if (id !== this.checkRequest) {
      return;
    }
    this.world.setWaypointChecks(checks);
    this.requestRender();
    this.waypointsChecked.emit(checks);
  }

  /** Rebuilds a navigation mesh tile from the client files and draws it over the real one; a newer request cancels it. */
  private async runRebuild(directory: string | undefined, request: NavMeshRebuildRequest | undefined): Promise<void> {
    const id = ++this.rebuildRequest;
    const current = () => id === this.rebuildRequest;
    this.navMesh.setPreview(undefined);
    if (!directory || !request) {
      return;
    }
    const report = (state: NavMeshRebuildState) => {
      if (current()) {
        this.navMeshRebuilt.emit(state);
      }
    };
    report({ status: 'reading', done: 0, total: 0, triangles: 0 });
    try {
      // the server's own maps and vmaps when it has them, like the mmaps generator; the client's files otherwise
      const server = this.mapId === undefined ? undefined : await collectServerTileGeometry(this.client, this.mapId, request.tile);
      const [recast, geometry] = await Promise.all([loadRecast(), server ?? collectTileGeometry(this.client, directory, request.tile)]);
      const tile = await rebuildNavMeshTile(
        recast,
        geometry,
        request.tile,
        request.config,
        (done, total) => report({ status: 'building', done, total, triangles: 0 }),
        () => !current(),
      );
      if (tile && current()) {
        this.navMesh.setPreview(tileKey(request.tile), tile);
        report({ status: 'done', done: 0, total: 0, triangles: tile.positions.length / 9, source: server ? 'server' : 'client' });
      }
    } catch (error) {
      console.warn(`[World Editor] Could not rebuild the navigation mesh tile: ${(error as Error).message}`);
      report({ status: 'failed', done: 0, total: 0, triangles: 0 });
    }
  }

  /** Puts the marker on the ground under the crosshair (the "+" in the middle of the view). */
  private readonly onSpeedWheel = (event: WheelEvent): void => {
    if (!event.shiftKey) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    // browsers turn Shift + wheel into a horizontal scroll
    const delta = event.deltaY || event.deltaX;
    if (delta) {
      this.speedChanged.emit(this.navigation().speed * (delta < 0 ? SPEED_STEP : 1 / SPEED_STEP));
    }
  };

  private markerToCrosshair(): void {
    const ground = this.world.pick(0, 0, { groundOnly: true });
    if (ground?.type === 'ground') {
      this.setMarker(ground.position);
    }
  }

  /** Moves the camera target to the marker, keeping the view's angle and zoom. */
  private cameraToMarker(): void {
    if (!this.marker) {
      return;
    }
    const point = worldToScene(this.marker);
    const offset = new Vector3(point.x, point.y, point.z).sub(this.target);
    this.world.camera.position.add(offset);
    this.target.add(offset);
    (this.controls as MapControls).update();
    this.onCameraChange();
  }

  private setMarker(position: WorldPosition): void {
    this.marker = position;
    this.world.setBeacon(position);
    this.requestRender();
  }

  private navigationAction(event: KeyboardEvent): NavigationAction | undefined {
    const navigation = this.navigation();
    return navigation.keyboardNavigation ? controlFor(navigation, NAVIGATION_ACTIONS, event) : undefined;
  }

  /** Moves the camera and its target together, along the ground as seen from the camera, faster when zoomed out. */
  private moveStep(time: number): void {
    this.moveFrame = undefined;
    const controls = this.controls;
    if (this.pressed.size === 0 || !controls) {
      return;
    }
    const seconds = Math.min(0.1, Math.max(0, (time - this.lastMoveTime) / 1000));
    this.lastMoveTime = time;
    const camera = this.world.camera;
    // the view's forward on the ground: where it looks (−z), plus its "up" for when it looks straight down
    const forward = new Vector3(0, 1, -1).applyQuaternion(camera.quaternion).setY(0).normalize();
    const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0));
    const speed =
      Math.max(KEY_MIN_SPEED, camera.position.distanceTo(this.target)) * (this.fast ? SHIFT_SPEED : 1) * this.navigation().speed * seconds;
    const move = new Vector3();
    const sign = (positive: NavigationAction, negative: NavigationAction) =>
      Number(this.pressed.has(positive)) - Number(this.pressed.has(negative));
    move.addScaledVector(forward, sign('forward', 'back'));
    move.addScaledVector(right, sign('right', 'left'));
    move.y += sign('up', 'down');
    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed);
      camera.position.add(move);
      this.target.add(move);
      controls.update();
      this.onCameraChange();
    }
    this.moveFrame = requestAnimationFrame((next) => this.moveStep(next));
  }

  // ---------------------------------------------------------------- gizmo

  private syncGizmo(): void {
    const gizmo = this.gizmo;
    if (!gizmo) {
      return;
    }
    const key = this.editableKey();
    const object = key ? this.world.getObject(key) : undefined;
    if (!object) {
      gizmo.detach();
      this.requestRender();
      return;
    }
    const rotate = this.gizmoMode() === 'rotate' && !parseWaypointKey(key as string);
    gizmo.setMode(rotate ? 'rotate' : 'translate');
    gizmo.showX = !rotate;
    gizmo.showZ = !rotate;
    gizmo.showY = true;
    gizmo.attach(object);
    this.requestRender();
  }

  /** Snaps a moved object onto the ground below it, or against the nearest wall (facing away from it). */
  private snap(key: string, object: Object3D, waypoint: boolean): void {
    const state = this.world.getObjectState(key) as { position: WorldPosition };
    if (this.snapToWall()) {
      const wall = this.world.wallSnap(state.position.x, state.position.y, state.position.z);
      if (wall) {
        const p = worldToScene(wall.position);
        object.position.x = p.x;
        object.position.z = p.z;
        if (!waypoint) {
          object.rotation.y = orientationToSceneYaw(wall.orientation);
        }
      }
    } else if (this.snapToGround()) {
      const ground = this.world.groundHeightAt(state.position.x, state.position.y, state.position.z);
      if (ground !== undefined) {
        object.position.y = ground + (waypoint ? 0.4 : 0);
      }
    }
  }

  // ---------------------------------------------------------------- dragging the Path / LOS tool's A and C

  private startProbeDrag(event: PointerEvent): boolean {
    if (event.button !== 0 || !this.probe()) {
      return false;
    }
    const rect = this.canvasRef().nativeElement.getBoundingClientRect();
    const which = this.world.pickProbeHandle(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    if (!which) {
      return false;
    }
    this.probeDragging = which;
    (this.controls as MapControls).enabled = false;
    return true;
  }

  private probeDragTo(event: PointerEvent): void {
    const ground = this.pickAt(event, { groundOnly: true });
    if (ground?.type === 'ground') {
      this.world.moveProbeHandle(this.probeDragging as 'from' | 'to', ground.position);
      this.requestRender();
    }
  }

  private endProbeDrag(): void {
    const which = this.probeDragging as 'from' | 'to';
    this.probeDragging = undefined;
    (this.controls as MapControls).enabled = true;
    // (the handle is drawn while it's dragged)
    const moved = this.world.probeHandlePositions().find((handle) => handle.which === which) as { position: WorldPosition };
    this.probeMoved.emit({ which, position: moved.position });
  }

  /** Draws fewer pixels (a share of the screen's resolution): much faster on big or high-DPI screens. */
  private applyRenderScale(scale: number): void {
    if (!this.renderer || scale === this.renderScale) {
      return;
    }
    this.renderScale = scale;
    this.renderer.setPixelRatio(window.devicePixelRatio * scale);
    this.resize();
  }

  /** The marker as a player character (`race:sex`), or the beam alone (''). */
  private async loadMarkerModel(choice: string): Promise<void> {
    if (choice === this.markerModel) {
      return;
    }
    this.markerModel = choice;
    const model = choice ? await this.playerModel(choice).catch(() => undefined) : undefined;
    if (choice !== this.markerModel) {
      return;
    }
    this.world.setBeaconModel(model && new Mesh(model.template.geometry, model.template.materials));
    this.requestRender();
  }

  private async playerModel(choice: string): Promise<DisplayModel | undefined> {
    const [race, sex] = choice.split(':').map(Number);
    const display = await this.client.getPlayerDisplay(race, sex);
    return display && displayModel(display, this.client, this.textures);
  }

  /** Puts "Start" and "End" over A and C after each frame. */
  private updateProbeLabels(): void {
    const handles = this.world.probeHandlePositions();
    if (handles.length === 0 && this.probeLabels().length === 0) {
      return;
    }
    const canvas = this.canvasRef().nativeElement;
    const [width, height] = [canvas.clientWidth, canvas.clientHeight];
    const labels = handles.flatMap(({ which, position }) => {
      const p = worldToScene({ ...position, z: position.z + 5.6 });
      const screen = new Vector3(p.x, p.y, p.z).project(this.world.camera);
      return screen.z < 1 ? [{ which, x: ((screen.x + 1) / 2) * width, y: ((1 - screen.y) / 2) * height }] : [];
    });
    this.probeLabels.set(labels);
  }

  // ---------------------------------------------------------------- Alt+click / Alt+drag

  /** Alt+click puts the editable object under the cursor; holding the button drags it along. */
  private startAltDrag(event: PointerEvent): boolean {
    const key = this.editableKey();
    if (!event.altKey || event.button !== 0 || !key || !this.world.getObject(key)) {
      return false;
    }
    this.altDragging = true;
    (this.controls as MapControls).enabled = false;
    this.altDragTo(event);
    return true;
  }

  private altDragTo(event: PointerEvent): void {
    const key = this.editableKey() as string;
    const object = this.world.getObject(key) as Object3D;
    const ground = this.pickAt(event, { groundOnly: true });
    if (ground?.type !== 'ground') {
      return;
    }
    const waypoint = !!parseWaypointKey(key);
    const p = worldToScene(ground.position);
    object.position.set(p.x, p.y + (waypoint ? 0.4 : 0), p.z);
    this.onGizmoChange();
  }

  private endAltDrag(): void {
    this.altDragging = false;
    (this.controls as MapControls).enabled = true;
    const key = this.editableKey() as string;
    const state = this.world.getObjectState(key);
    if (state) {
      this.objectMoved.emit({ key, position: state.position, orientation: state.orientation });
    }
  }

  private onGizmoDragging(dragging: boolean): void {
    (this.controls as MapControls).enabled = !dragging;
    const key = this.editableKey();
    const state = key ? this.world.getObjectState(key) : undefined;
    if (!dragging && key && state) {
      this.objectMoved.emit({ key, position: state.position, orientation: state.orientation });
    }
  }

  private onGizmoChange(): void {
    const key = this.editableKey();
    const object = key ? this.world.getObject(key) : undefined;
    if (!key || !object) {
      return;
    }
    const waypoint = parseWaypointKey(key);
    if (this.gizmoMode() === 'translate' || this.altDragging) {
      this.snap(key, object, !!waypoint);
    }
    if (waypoint) {
      this.world.refreshPathLine(waypoint.pathKey);
    }
    this.requestRender();
  }

  // ---------------------------------------------------------------- rendering & streaming

  private async loadMap(directory: string | undefined): Promise<void> {
    this.error.set(undefined);
    this.mapId = undefined;
    this.vmaps.setMap(undefined);
    if (directory && this.client.isSupported()) {
      void this.client
        .getMaps()
        .then((maps) => {
          this.mapId = maps.find((map) => map.directory.toLowerCase() === directory.toLowerCase())?.id;
          this.vmaps.setMap(this.mapId);
          void this.vmaps.update(this.center);
          this.requestRender();
        })
        .catch(() => undefined);
    }
    this.objects.setMap(directory);
    this.doodads.setMap(directory);
    this.navMesh.setMap(directory);
    void this.prefetch.setMap(this.client.isSupported() ? directory : undefined).then(() => this.prefetch.update(this.center));
    void this.zoneLighting.setMap(this.client.isSupported() ? directory : undefined);
    if (!directory) {
      await this.streamer.setMap(undefined);
      this.requestRender();
      return;
    }
    if (!this.client.isSupported()) {
      this.error.set('WORLD_EDITOR.ERROR_DESKTOP_ONLY');
      return;
    }
    this.loading.set(true);
    try {
      await this.streamer.setMap(directory);
      // now that the map's tiles are known, everything around the camera loads (the camera may have been placed, and
      // a region set, before: e.g. reopening the editor inside a dungeon)
      this.emitCenter(true);
      await this.streamer.update(this.center);
    } catch (error) {
      this.error.set((error as Error).message);
    } finally {
      this.loading.set(false);
      this.requestRender();
    }
  }

  /** The server's collision changed: the line of sight uses it once there is some, and answers are worked out again. */
  private onCollisionLoaded(): void {
    // also called from effects (map changes): not something they depend on
    untracked(() => {
      this.world.setServerCollision(this.vmaps.active);
      const source = this.vmaps.active ? 'server' : 'client';
      const changed = source !== this.collisionSource;
      if (changed) {
        this.collisionSource = source;
        this.collisionSourceChanged.emit(source);
      }
      // the server's collision came in or changed: the Path / LOS answer may be another one
      if ((changed || this.vmaps.active) && this.probe()) {
        void this.runProbe(this.mapDirectory(), this.probe());
      }
      this.onTileLoaded();
    });
  }

  private onTileLoaded(): void {
    // what's under the waypoints is looked at again once tiles stop coming in (each look casts rays at everything)
    clearTimeout(this.classifyTimer);
    this.classifyTimer = setTimeout(() => {
      this.world.queueWaypointPlaces();
      this.workOutWaypointPlaces();
    }, CLASSIFY_DELAY);
    // what's under the checked points may have changed: check them again once loading calms down
    if (untracked(() => this.waypointCheck())) {
      clearTimeout(this.recheckTimer);
      this.recheckTimer = setTimeout(() => void this.runWaypointCheck(this.mapDirectory(), this.waypointCheck()), RECHECK_DELAY);
    }
    this.requestRender();
  }

  /** Works out the queued waypoints' places a slice per frame (nearest first), so the view keeps drawing. */
  private workOutWaypointPlaces(): void {
    if (this.placing) {
      return;
    }
    this.placing = true;
    const step = () => {
      if (!this.renderer) {
        this.placing = false;
        return;
      }
      const more = perfTime('waypoint places', () => this.world.workOutWaypointPlaces(PLACE_BUDGET));
      this.requestRender();
      if (more) {
        requestAnimationFrame(step);
      } else {
        this.placing = false;
      }
    };
    requestAnimationFrame(step);
  }

  private onCameraChange(): void {
    this.emitCenter(false);
    this.requestRender();
  }

  private emitCenter(force: boolean): void {
    const center = this.center;
    const last = this.lastEmittedCenter;
    if (!force && last && Math.hypot(center.x - last.x, center.y - last.y) < CENTER_EMIT_DISTANCE) {
      return;
    }
    this.lastEmittedCenter = center;
    perfTime('center changed (editor)', () => this.centerChanged.emit(center));
    // the graphics memory of textures left far behind goes back
    perfTime('textures release', () => this.textures.release(this.world.scene, TEXTURES_KEPT));
    // load what's in front first
    const look = new Vector3();
    this.world.camera.getWorldDirection(look);
    const facing = { x: -look.z, y: -look.x };
    for (const streamer of [this.streamer, this.objects, this.doodads, this.navMesh, this.prefetch]) {
      streamer.facing = facing;
    }
    // update() reports tile failures itself and never rejects.
    void this.streamer.update(center);
    void this.objects.update(center);
    void this.doodads.update(center);
    void this.navMesh.update(center);
    void this.vmaps.update(center);
    this.prefetch.update(center);
    this.spawnModels.update(center);
    this.zoneLighting.update(center);
  }

  private resize(): void {
    const element = this.host().nativeElement;
    const width = element.clientWidth || 1;
    const height = element.clientHeight || 1;
    this.world.camera.aspect = width / height;
    this.world.camera.updateProjectionMatrix();
    this.renderer?.setSize(width, height, false);
    this.requestRender();
  }

  private requestRender(): void {
    if (!this.renderer || this.frameRequested) {
      return;
    }
    this.frameRequested = true;
    requestAnimationFrame(() => {
      this.frameRequested = false;
      this.world.updateMarkerScale();
      const began = performance.now();
      perfTime('render', () => this.renderer?.render(this.world.scene, this.world.camera));
      perfFrame();
      this.countFrame(performance.now() - began);
      this.updateStatus();
      this.updateProbeLabels();
    });
  }

  /** Which mmtile the camera target is on (while the navigation mesh is shown), reported when it changes. */
  private updateNavMeshInfo(center: WorldPosition): void {
    let info: NavMeshTileInfo | undefined;
    const tile = worldToTile(center.x, center.y);
    this.navMesh.setCurrent(tileKey(tile));
    if (this.renderSettings().showNavMesh && this.mapId !== undefined) {
      const read = this.navMesh.tileAt(tileKey(tile));
      info = { file: mmtileName(this.mapId, tile), mapId: this.mapId, tile, config: read?.config, missing: read === null };
    }
    const current = this.navMeshInfo();
    if (info?.file !== current?.file || info?.config !== current?.config || info?.missing !== current?.missing) {
      this.navMeshInfo.set(info);
      this.navMeshTileChanged.emit(info);
    }
  }

  /** Looks up the area under the camera target when it moved to another chunk (the server keeps one area per chunk). */
  private async updateArea(center: WorldPosition): Promise<void> {
    const mapId = this.mapId;
    const chunk = `${mapId}:${Math.floor(center.x / CHUNK_SIZE)}:${Math.floor(center.y / CHUNK_SIZE)}`;
    if (chunk === this.areaChunk) {
      return;
    }
    this.areaChunk = chunk;
    if (mapId === undefined || !this.client.isSupported()) {
      this.areaName.set(undefined);
      return;
    }
    try {
      const [tile, names] = await Promise.all([
        this.client.getServerMap(mapId, worldToTile(center.x, center.y)),
        this.client.getAreaNames(),
      ]);
      const area = tile ? names.get(serverAreaAt(tile, center.x, center.y)) : undefined;
      const zone = area?.parent ? names.get(area.parent)?.name : undefined;
      if (chunk === this.areaChunk) {
        this.areaName.set(area?.name ? `${area.name}${zone ? ` (${zone})` : ''}` : undefined);
      }
    } catch {
      this.areaName.set(undefined);
    }
  }

  /** Frames drawn, and the time spent drawing them, since the stats were last shown. */
  private statsWindow = { start: 0, frames: 0, ms: 0 };

  /** Counts a drawn frame for the performance stats, shown twice a second (while they're on). */
  private countFrame(ms: number): void {
    if (!this.renderSettings().showStats) {
      return;
    }
    const now = performance.now();
    const window = this.statsWindow;
    window.frames++;
    window.ms += ms;
    if (now - window.start < STATS_INTERVAL) {
      return;
    }
    const info = this.renderer?.info;
    const heap = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;
    this.stats.set({
      fps: window.start ? Math.round((window.frames * 1000) / (now - window.start)) : 0,
      frameMs: window.ms / window.frames,
      calls: info?.render.calls ?? 0,
      triangles: info?.render.triangles ?? 0,
      geometries: info?.memory.geometries ?? 0,
      textures: info?.memory.textures ?? 0,
      programs: info?.programs?.length ?? 0,
      heapMb: heap === undefined ? undefined : Math.round(heap / 1_000_000),
      tiles: this.world.terrainKeys.length,
      buildings: this.objects.placedCount,
      props: this.doodads.drawnCount,
      models: this.spawnModels.shownCount,
      spawns: this.spawns().length,
    });
    this.statsWindow = { start: now, frames: 0, ms: 0 };
  }

  /** Camera target readout and the loading bar (polled while anything is still loading). */
  private updateStatus(): void {
    const center = this.center;
    const rounded = { x: Math.round(center.x * 10) / 10, y: Math.round(center.y * 10) / 10, z: Math.round(center.z * 10) / 10 };
    const current = this.cameraTarget();
    if (!current || current.x !== rounded.x || current.y !== rounded.y || current.z !== rounded.z) {
      this.cameraTarget.set(rounded);
    }
    this.updateNavMeshInfo(center);
    void this.updateArea(center);
    const activity = {
      terrain: this.streamer.pendingCount,
      buildings: this.objects.pendingCount,
      props: this.doodads.pendingCount,
      models: this.spawnModels.pendingCount,
      waypoints: this.world.waypointPlacesPending,
    };
    const pending = Object.values(activity).reduce((total, count) => total + count, 0);
    const busy = pending > 0;
    // new work adds to the total; what's no longer pending is done
    this.loadTotal = busy ? this.loadTotal + Math.max(0, pending - this.loadPending) : 0;
    this.loadPending = pending;
    const progress = { ...activity, percent: busy ? Math.floor((100 * (this.loadTotal - pending)) / this.loadTotal) : 0 };
    const shown = this.activity();
    // (set only when it changed: this runs every frame)
    if (busy ? JSON.stringify(shown) !== JSON.stringify(progress) : shown !== undefined) {
      this.activity.set(busy ? progress : undefined);
    }
    if (busy && !this.activityTimer) {
      this.activityTimer = setTimeout(() => {
        this.activityTimer = undefined;
        this.requestRender();
      }, ACTIVITY_POLL);
    }
  }
}
