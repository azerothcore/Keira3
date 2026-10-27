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
} from '@keira/shared/wow-data';
import { Object3D, Vector3 } from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { TerrainStreamer } from './terrain-streamer';
import { TextureCache } from './texture-cache';
import { SpawnModels } from './spawn-models';
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
import { PathProber, PathProbeRequest, PathProbeResult } from './path-probe';
import { WorldObjects } from './world-objects';
import { DEFAULT_WORLD_RENDER_SETTINGS, drawDistances, WorldRenderSettings } from './world-render-settings';
import { WORLD_RENDERER_FACTORY, WorldRenderer } from './world-renderer';
import { PickOptions, WorldScene } from './world-scene';
import {
  ContextRequest,
  GizmoMode,
  NavMeshTileInfo,
  ObjectMoved,
  parseWaypointKey,
  PickResult,
  WaypointPath,
  WorldAreaTrigger,
  WorldSpawn,
} from './world-viewer.model';

const CLICK_TOLERANCE_PX = 4;
const CENTER_EMIT_DISTANCE = 60;
/** How far the camera stands from a place it was sent to (close enough to see an NPC there). */
const FOCUS_DISTANCE = 40;
const RIGHT_BUTTON = 2;
/** Each Shift + wheel notch changes the camera speed by this factor. */
const SPEED_STEP = 1.25;
/** Keyboard movement speed (yards per second) when the camera is close; it grows with the camera distance. */
const KEY_MIN_SPEED = 20;
/** While something loads, how often (ms) the loading bar is refreshed. */
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
  /** Area trigger volumes to draw (empty = none). */
  readonly areaTriggers = input<WorldAreaTrigger[]>([]);
  readonly picked = output<PickResult>();
  /** The navigation mesh tile under the camera target, while the navigation mesh is shown (undefined otherwise). */
  readonly navMeshTileChanged = output<NavMeshTileInfo | undefined>();
  /** Shift + wheel asked for another camera speed (the caller saves it in `navigation`). */
  readonly speedChanged = output<number>();
  /** The answer to `probe`. */
  readonly probed = output<PathProbeResult>();
  /** Right-click on a spawn or waypoint, for a context menu. */
  readonly contextRequested = output<ContextRequest>();
  readonly objectMoved = output<ObjectMoved>();
  /** Camera target, emitted after it moved more than ~60 yards (use it to load nearby spawns). */
  readonly centerChanged = output<WorldPosition>();

  protected readonly hoverLabel = signal<HoverLabel | undefined>(undefined);
  protected readonly error = signal<string | undefined>(undefined);
  protected readonly loading = signal(false);
  /** What's still loading in the background (undefined when idle). */
  protected readonly activity = signal<{ terrain: number; buildings: number; props: number; models: number } | undefined>(undefined);
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
  private readonly textures = new TextureCache((path) => this.client.getTexture(path));
  private readonly streamer = new TerrainStreamer(this.client, this.world, this.textures, () => this.onTileLoaded());
  private readonly objects = new WorldObjects(this.client, this.world.buildingGroup, this.textures, () => this.requestRender());
  private readonly doodads = new WorldDoodads(this.client, this.world.doodadGroup, this.textures, () => this.requestRender());
  private readonly navMesh = new WorldNavMesh(this.client, this.world.navMeshGroup, () => this.requestRender());
  private readonly prober = new PathProber(this.client, this.world);
  private probeRequest = 0;
  /** Id of the shown map (for mmtile names), once known. */
  private mapId?: number;
  protected readonly navMeshInfo = signal<NavMeshTileInfo | undefined>(undefined);
  private readonly spawnModels = new SpawnModels(this.client, this.world, this.textures, () => this.requestRender());
  private readonly zoneLighting = new ZoneLighting(this.client, this.world, () => this.requestRender());
  private renderer?: WorldRenderer;
  // Created in ngAfterViewInit; effects may run before that, hence the guards in syncGizmo/lookAt.
  private controls?: MapControls;
  private gizmo!: TransformControls;
  private resizeObserver?: ResizeObserver;
  private frameRequested = false;
  private pointerDown?: { x: number; y: number };
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
        this.world.setRoofsVisible(settings.showRoofs);
        this.world.setCollisionVisible(settings.showCollision);
        this.world.setFacingArrowsVisible(settings.showFacingArrows);
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
        void this.streamer.update(this.center);
        void this.objects.update(this.center);
      });
    });
    effect(() => void this.loadMap(this.mapDirectory()));
    effect(() => {
      this.world.setSpawns(this.spawns());
      this.spawnModels.setSpawns(this.spawns());
      this.world.setWaypointPaths(this.paths());
      untracked(() => this.syncGizmo());
      this.requestRender();
    });
    effect(() => {
      const request = this.probe();
      const directory = this.mapDirectory();
      untracked(() => void this.runProbe(directory, request));
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
    this.renderer.setPixelRatio(window.devicePixelRatio);

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
    if (this.moveFrame !== undefined) {
      cancelAnimationFrame(this.moveFrame);
    }
    this.streamer.dispose();
    this.objects.dispose();
    this.doodads.dispose();
    this.navMesh.dispose();
    this.spawnModels.dispose();
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
    if (this.startAltDrag(event)) {
      return;
    }
    this.pointerDown = { x: event.clientX, y: event.clientY };
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.altDragging) {
      this.endAltDrag();
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
      this.picked.emit(result);
    }
  }

  /** A right-click that didn't rotate the view: a context menu for the spawn or waypoint under the cursor. */
  private requestContext(event: PointerEvent): void {
    const result = this.pickAt(event, { markersOnly: true });
    if (result?.type === 'spawn' || result?.type === 'waypoint') {
      const rect = this.host().nativeElement.getBoundingClientRect();
      this.contextRequested.emit({ key: result.key, x: event.clientX - rect.left, y: event.clientY - rect.top });
    }
  }

  protected onPointerMove(event: PointerEvent): void {
    this.lastPointer = event;
    if (this.altDragging) {
      this.altDragTo(event);
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
    const result = this.pickAt(event, { markersOnly: true, segments: true, areaTriggers: true });
    const text =
      result?.type === 'segment'
        ? this.segmentLabel(result)
        : result?.type === 'areatrigger'
          ? this.areaTriggers().find((trigger) => trigger.key === result.key)?.label
          : result
            ? this.labelFor((result as { key: string }).key)
            : undefined;
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

  private segmentLabel(segment: { pathKey: string; from: number; to: number }): string {
    const path = this.paths().find((p) => p.key === segment.pathKey) as WaypointPath;
    const owners = path.owners?.length ? ` — ${path.owners.join(', ')}` : '';
    return `${path.label} · #${segment.from} → #${segment.to}${owners}`;
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
    return `${path.label} · #${point}${info.map((line) => ` · ${line}`).join('')}${owners}`;
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

  /** Space: moves the camera target (and its marker) to the ground under the cursor, keeping the view's angle and zoom. */
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
    if (directory && this.client.isSupported()) {
      void this.client
        .getMaps()
        .then((maps) => {
          this.mapId = maps.find((map) => map.directory.toLowerCase() === directory.toLowerCase())?.id;
          this.requestRender();
        })
        .catch(() => undefined);
    }
    this.objects.setMap(directory);
    this.doodads.setMap(directory);
    this.navMesh.setMap(directory);
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
      await this.streamer.update(this.center);
      void this.objects.update(this.center);
      void this.doodads.update(this.center);
      void this.navMesh.update(this.center);
    } catch (error) {
      this.error.set((error as Error).message);
    } finally {
      this.loading.set(false);
      this.requestRender();
    }
  }

  private onTileLoaded(): void {
    this.requestRender();
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
    this.centerChanged.emit(center);
    // update() reports tile failures itself and never rejects.
    void this.streamer.update(center);
    void this.objects.update(center);
    void this.doodads.update(center);
    void this.navMesh.update(center);
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
      this.renderer?.render(this.world.scene, this.world.camera);
      this.updateStatus();
    });
  }

  /** Which mmtile the camera target is on (while the navigation mesh is shown), reported when it changes. */
  private updateNavMeshInfo(center: WorldPosition): void {
    let info: NavMeshTileInfo | undefined;
    if (this.renderSettings().showNavMesh && this.mapId !== undefined) {
      const tile = worldToTile(center.x, center.y);
      const read = this.navMesh.tileAt(tileKey(tile));
      info = { file: mmtileName(this.mapId, tile), mapId: this.mapId, tile, config: read?.config, missing: read === null };
    }
    const current = this.navMeshInfo();
    if (info?.file !== current?.file || info?.config !== current?.config || info?.missing !== current?.missing) {
      this.navMeshInfo.set(info);
      this.navMeshTileChanged.emit(info);
    }
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
    const activity = {
      terrain: this.streamer.pendingCount,
      buildings: this.objects.pendingCount,
      props: this.doodads.pendingCount,
      models: this.spawnModels.pendingCount,
    };
    const busy = Object.values(activity).some((count) => count > 0);
    this.activity.set(busy ? activity : undefined);
    if (busy && !this.activityTimer) {
      this.activityTimer = setTimeout(() => {
        this.activityTimer = undefined;
        this.requestRender();
      }, ACTIVITY_POLL);
    }
  }
}
