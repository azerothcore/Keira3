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
import { WowClientService, WorldBounds, WorldPosition, worldToScene, sceneToWorld } from '@keira/shared/wow-data';
import { Vector3 } from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { TerrainStreamer } from './terrain-streamer';
import { TextureCache } from './texture-cache';
import { SpawnModels } from './spawn-models';
import { WorldDoodads } from './world-doodads';
import { ZoneLighting } from './zone-lighting';
import { WorldObjects } from './world-objects';
import { DEFAULT_WORLD_RENDER_SETTINGS, drawDistances, WorldRenderSettings } from './world-render-settings';
import { WORLD_RENDERER_FACTORY, WorldRenderer } from './world-renderer';
import { PickOptions, WorldScene } from './world-scene';
import { GizmoMode, ObjectMoved, parseWaypointKey, PickResult, WaypointPath, WorldSpawn } from './world-viewer.model';

const CLICK_TOLERANCE_PX = 4;
const CENTER_EMIT_DISTANCE = 60;
const FOCUS_DISTANCE = 90;

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
  /** Clicks report the terrain under the cursor even over markers (for placing things). */
  readonly groundOnly = input<boolean>(false);
  /** Moves the camera to look at this position whenever it changes. */
  readonly focus = input<WorldPosition | undefined>(undefined);
  /** Quality and range of what is drawn. */
  readonly renderSettings = input<WorldRenderSettings>(DEFAULT_WORLD_RENDER_SETTINGS);
  /** An area (e.g. a zone) whose terrain and buildings are loaded whole, on top of what's around the camera. */
  readonly region = input<WorldBounds | undefined>(undefined);

  readonly picked = output<PickResult>();
  readonly objectMoved = output<ObjectMoved>();
  /** Camera target, emitted after it moved more than ~60 yards (use it to load nearby spawns). */
  readonly centerChanged = output<WorldPosition>();

  protected readonly hoverLabel = signal<HoverLabel | undefined>(undefined);
  protected readonly error = signal<string | undefined>(undefined);
  protected readonly loading = signal(false);

  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private readonly world = new WorldScene();
  private readonly textures = new TextureCache((path) => this.client.getTexture(path));
  private readonly streamer = new TerrainStreamer(this.client, this.world, this.textures, () => this.onTileLoaded());
  private readonly objects = new WorldObjects(this.client, this.world.buildingGroup, this.textures, () => this.requestRender());
  private readonly doodads = new WorldDoodads(this.client, this.world.doodadGroup, this.textures, () => this.requestRender());
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
        this.world.setRoofsVisible(settings.showRoofs);
        this.world.setFacingArrowsVisible(settings.showFacingArrows);
        void this.streamer.update(this.center);
        void this.objects.update(this.center);
        void this.doodads.update(this.center);
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
        untracked(() => this.lookAt(target));
      }
    });
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef().nativeElement;
    this.renderer = this.rendererFactory(canvas);
    this.renderer.setPixelRatio(window.devicePixelRatio);

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
    this.streamer.dispose();
    this.objects.dispose();
    this.doodads.dispose();
    this.spawnModels.dispose();
    this.resizeObserver?.disconnect();
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
    this.pointerDown = { x: event.clientX, y: event.clientY };
  }

  protected onPointerUp(event: PointerEvent): void {
    const start = this.pointerDown;
    this.pointerDown = undefined;
    if (!start || event.button !== 0 || this.gizmo.dragging) {
      return;
    }
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > CLICK_TOLERANCE_PX) {
      return;
    }
    const result = this.pickAt(event, { groundOnly: this.groundOnly() });
    if (result) {
      this.picked.emit(result);
    }
  }

  protected onPointerMove(event: PointerEvent): void {
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
    const result = this.pickAt(event, { markersOnly: true, segments: true });
    const text =
      result?.type === 'segment' ? this.segmentLabel(result) : result ? this.labelFor((result as { key: string }).key) : undefined;
    const rect = this.host().nativeElement.getBoundingClientRect();
    this.hoverLabel.set(text ? { text, x: event.clientX - rect.left + 14, y: event.clientY - rect.top + 14 } : undefined);
  }

  protected onPointerLeave(): void {
    this.hoverEvent = undefined;
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
      return spawn.label;
    }
    // Every other pickable object is a waypoint of one of the paths.
    const { pathKey, point } = parseWaypointKey(key) as { pathKey: string; point: number };
    const path = this.paths().find((p) => p.key === pathKey) as WaypointPath;
    const owners = path.owners?.length ? ` — ${path.owners.join(', ')}` : '';
    const info = path.points.find((p) => p.point === point)?.info ?? [];
    return `${path.label} · #${point}${info.map((line) => ` · ${line}`).join('')}${owners}`;
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
    if (this.snapToGround() && this.gizmoMode() === 'translate') {
      const state = this.world.getObjectState(key) as { position: WorldPosition };
      const ground = this.world.groundHeightAt(state.position.x, state.position.y, state.position.z);
      if (ground !== undefined) {
        object.position.y = ground + (waypoint ? 0.4 : 0);
      }
    }
    if (waypoint) {
      this.world.refreshPathLine(waypoint.pathKey);
    }
    this.requestRender();
  }

  // ---------------------------------------------------------------- rendering & streaming

  private async loadMap(directory: string | undefined): Promise<void> {
    this.error.set(undefined);
    this.objects.setMap(directory);
    this.doodads.setMap(directory);
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
    });
  }
}
