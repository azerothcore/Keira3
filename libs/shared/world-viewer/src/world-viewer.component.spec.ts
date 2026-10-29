import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import {
  EMPTY_COLLISION,
  M2Blend,
  MmapRecastConfig,
  NavMeshTile,
  tileCenter,
  WowClientService,
  WorldBounds,
  WorldPosition,
  worldToScene,
} from '@keira/shared/wow-data';
import { DebugHtmlElement, PageObjectModel } from 'ngx-page-object-model';
import { EventDispatcher, Group, Object3D, Vector3 } from 'three';
import { DEFAULT_WORLD_CONTROLS_SETTINGS, WorldControlsSettings } from './world-controls-settings';
import { DEFAULT_WORLD_RENDER_SETTINGS, WorldRenderSettings } from './world-render-settings';
import { WorldWeather } from './world-weather';
import { ExtraBuilding, WorldObjects } from './world-objects';
import { WORLD_RENDERER_FACTORY, WorldRenderer } from './world-renderer';
import { WorldViewerComponent } from './world-viewer.component';
import {
  ContextRequest,
  GizmoMode,
  NavMeshTileInfo,
  ObjectMoved,
  PickResult,
  WaypointPath,
  WorldAreaTrigger,
  WorldSpawn,
  NavMeshRebuildRequest,
  NavMeshRebuildState,
  WaypointCheck,
  WaypointCheckRequest,
  WorldLink,
  WorldBoundary,
  WorldMarker,
  MovementSimulation,
} from './world-viewer.model';
import { flatDetail, flatTile } from './world-viewer.mock';
import { WorldScene } from './world-scene';
import { PathProber, PathProbeRequest, PathProbeResult } from './path-probe';
import { WorldNavMesh } from './world-navmesh';
import { ZoneLighting } from './zone-lighting';
import { TextureCache } from './texture-cache';
import { SpawnModels } from './spawn-models';
import { WorldDoodads } from './world-doodads';
import { GamepadInputService, PadInput } from './gamepad-input';
import { Subject } from 'rxjs';

// ------------------------------------------------------------------ Three.js controls fakes (jsdom has no WebGL)

const rebuild = vi.hoisted(() => ({ loadRecast: vi.fn(), collectTileGeometry: vi.fn(), rebuildNavMeshTile: vi.fn() }));
vi.mock('./navmesh-rebuild', () => rebuild);
const controlsRegistry = vi.hoisted(() => ({ map: [] as unknown[], transform: [] as unknown[] }));

vi.mock('three/addons/controls/MapControls.js', async () => {
  const three = await import('three');
  class FakeMapControls extends three.EventDispatcher<{ change: object }> {
    target = new three.Vector3();
    enabled = true;
    screenSpacePanning = true;
    maxPolarAngle = Math.PI;
    minDistance = 0;
    maxDistance = Infinity;
    disposed = false;
    constructor(readonly camera: InstanceType<typeof three.PerspectiveCamera>) {
      super();
      controlsRegistry.map.push(this);
    }
    update(): void {
      this.camera.lookAt(this.target);
    }
    dispose(): void {
      this.disposed = true;
    }
  }
  return { MapControls: FakeMapControls };
});

vi.mock('three/addons/controls/TransformControls.js', async () => {
  const three = await import('three');
  class FakeTransformControls extends three.EventDispatcher<{ 'dragging-changed': { value: boolean }; objectChange: object }> {
    object?: InstanceType<typeof three.Object3D>;
    mode = 'translate';
    dragging = false;
    showX = true;
    showY = true;
    showZ = true;
    constructor() {
      super();
      controlsRegistry.transform.push(this);
    }
    getHelper(): InstanceType<typeof three.Object3D> {
      return new three.Object3D();
    }
    setMode(mode: string): void {
      this.mode = mode;
    }
    attach(object: InstanceType<typeof three.Object3D>): void {
      this.object = object;
    }
    detach(): void {
      this.object = undefined;
    }
    dispose(): void {
      this.object = undefined;
    }
  }
  return { TransformControls: FakeTransformControls };
});

interface FakeMapControls extends EventDispatcher<{ change: object }> {
  target: Vector3;
  enabled: boolean;
  disposed: boolean;
}
interface FakeTransformControls extends EventDispatcher<{ 'dragging-changed': { value: boolean }; objectChange: object }> {
  object?: Object3D;
  mode: string;
  dragging: boolean;
  showX: boolean;
  showZ: boolean;
}

// ------------------------------------------------------------------ host

@Component({
  imports: [WorldViewerComponent],
  template: `
    <keira-world-viewer
      [mapDirectory]="map()"
      [spawns]="spawns()"
      [paths]="paths()"
      [selectedKey]="selected()"
      [editableKey]="editable()"
      [gizmoMode]="mode()"
      [snapToGround]="snap()"
      [snapToWall]="wall()"
      [snapToWater]="water()"
      [groundOnly]="groundOnly()"
      [renderSettings]="render()"
      [focus]="focus()"
      [resetNorth]="resetNorth()"
      [topView]="topView()"
      [pathEnds]="pathEnds()"
      [region]="region()"
      [navigation]="navigation()"
      [areaTriggers]="triggers()"
      [links]="links()"
      [groupKeys]="group()"
      [simulation]="simulation()"
      [simulationRate]="simulationRate()"
      (simulationEnded)="simulationEnds = simulationEnds + 1"
      [groundQuery]="ground()"
      (groundHeights)="heights.push($event)"
      [markers]="markers()"
      [probe]="probe()"
      [navMeshRebuild]="rebuild()"
      [waypointCheck]="check()"
      (waypointsChecked)="checks.push($event)"
      (collisionSourceChanged)="collisionSources.push($event)"
      [hideRealNavMesh]="hideReal()"
      (navMeshRebuilt)="rebuilds.push($event)"
      (probed)="probes.push($event)"
      [boundaries]="boundaries()"
      [spawnsLoading]="spawnsLoading()"
      [cameraPhase]="cameraPhase()"
      [buildings]="buildings()"
      (probeMoved)="probeMoves.push($event)"
      (speedChanged)="speeds.push($event)"
      (navMeshTileChanged)="navMeshTiles.push($event)"
      (picked)="picks.push($event)"
      (contextRequested)="contexts.push($event)"
      [markerLookAt]="lookAt()"
      [placePreview]="preview()"
      (objectMoved)="moves.push($event)"
      (centerChanged)="centers.push($event)"
      (zoneChanged)="zones.push($event)"
      [weather]="weather()"
    />
  `,
})
class HostComponent {
  readonly map = signal<string | undefined>(undefined);
  readonly spawns = signal<WorldSpawn[]>([]);
  readonly paths = signal<WaypointPath[]>([]);
  readonly selected = signal<string | undefined>(undefined);
  readonly editable = signal<string | undefined>(undefined);
  readonly mode = signal<GizmoMode>('translate');
  readonly snap = signal(true);
  readonly water = signal(false);
  readonly wall = signal(false);
  readonly groundOnly = signal(false);
  readonly render = signal<WorldRenderSettings>(DEFAULT_WORLD_RENDER_SETTINGS);
  readonly focus = signal<WorldPosition | undefined>(undefined);
  readonly resetNorth = signal(0);
  readonly topView = signal(0);
  readonly pathEnds = signal<{ start: WorldPosition; end: WorldPosition } | undefined>(undefined);
  readonly region = signal<WorldBounds | undefined>(undefined);
  readonly navigation = signal<WorldControlsSettings>(DEFAULT_WORLD_CONTROLS_SETTINGS);
  readonly triggers = signal<WorldAreaTrigger[]>([]);
  readonly links = signal<WorldLink[]>([]);
  readonly group = signal<string[]>([]);
  readonly simulation = signal<MovementSimulation | undefined>(undefined);
  readonly simulationRate = signal(2);
  simulationEnds = 0;
  readonly ground = signal<{ key: string; position: WorldPosition }[] | undefined>(undefined);
  readonly heights: Record<string, number | null>[] = [];
  readonly markers = signal<WorldMarker[]>([]);
  readonly boundaries = signal<WorldBoundary[]>([]);
  readonly spawnsLoading = signal(false);
  readonly cameraPhase = signal<number | undefined>(undefined);
  readonly buildings = signal<ExtraBuilding[]>([]);
  readonly probe = signal<PathProbeRequest | undefined>(undefined);
  readonly probes: PathProbeResult[] = [];
  readonly probeMoves: { which: 'from' | 'to'; position: WorldPosition }[] = [];
  readonly rebuild = signal<NavMeshRebuildRequest | undefined>(undefined);
  readonly check = signal<WaypointCheckRequest | undefined>(undefined);
  readonly checks: WaypointCheck[][] = [];
  readonly collisionSources: string[] = [];
  readonly hideReal = signal(false);
  readonly rebuilds: NavMeshRebuildState[] = [];
  readonly speeds: number[] = [];
  readonly navMeshTiles: (NavMeshTileInfo | undefined)[] = [];
  readonly picks: PickResult[] = [];
  readonly contexts: ContextRequest[] = [];
  readonly lookAt = signal<WorldPosition | undefined>(undefined);
  readonly preview = signal<{ kind: 'creature' | 'gameobject'; displayId: number; scale: number } | undefined>(undefined);
  readonly moves: ObjectMoved[] = [];
  readonly centers: WorldPosition[] = [];
  readonly zones: (number | undefined)[] = [];
  readonly weather = signal<WorldWeather | undefined>(undefined);
}

class Page extends PageObjectModel<HostComponent> {
  viewer(): DebugHtmlElement<HTMLDivElement> {
    return this.getDebugElementByTestId('world-viewer');
  }
  label(assert = true): DebugHtmlElement<HTMLDivElement> {
    return this.getDebugElementByTestId('world-viewer-label', assert);
  }
  loading(assert = true): DebugHtmlElement<HTMLDivElement> {
    return this.getDebugElementByTestId('world-viewer-loading', assert);
  }
  error(assert = true): DebugHtmlElement<HTMLDivElement> {
    return this.getDebugElementByTestId('world-viewer-error', assert);
  }
  canvas(): DebugHtmlElement<HTMLCanvasElement> {
    return this.getDebugElementByTestId('world-viewer-canvas');
  }
  activity(assert = true): DebugHtmlElement<HTMLDivElement> {
    return this.getDebugElementByTestId('world-viewer-activity', assert);
  }
  target(): DebugHtmlElement<HTMLDivElement> {
    return this.getDebugElementByTestId('world-viewer-target');
  }

  pointer(type: string, x: number, y: number, button = 0, altKey = false, ctrlKey = false): void {
    const event = new MouseEvent(type, { clientX: x, clientY: y, button, altKey, ctrlKey, bubbles: true });
    this.viewer().nativeElement.dispatchEvent(event);
  }
  click(x = 50, y = 50, button = 0): void {
    this.pointer('pointerdown', x, y, button);
    this.pointer('pointerup', x, y, button);
  }
}

// ------------------------------------------------------------------ tests

const CENTER = tileCenter({ tx: 32, ty: 48 });
const GROUND = 50;
const at = (dx: number, dy: number, z = GROUND): WorldPosition => ({ x: CENTER.x + dx, y: CENTER.y + dy, z });
const spawn = (key: string, position: WorldPosition, label = key): WorldSpawn => ({
  key,
  kind: 'creature',
  guid: 1,
  entry: 1,
  label,
  position,
  orientation: 0,
});

describe(WorldViewerComponent.name, () => {
  let frames: FrameRequestCallback[];
  const flushFrames = (): void => {
    const pending = frames;
    frames = [];
    pending.forEach((frame) => frame(0));
  };

  const renderer: WorldRenderer & {
    render: ReturnType<typeof vi.fn>;
    setSize: ReturnType<typeof vi.fn>;
    dispose: ReturnType<typeof vi.fn>;
  } = {
    setPixelRatio: vi.fn(),
    setSize: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
  };

  const client = {
    isSupported: vi.fn(),
    getMaps: vi.fn(),
    getNavMeshTile: vi.fn(),
    getMapTiles: vi.fn(),
    getTerrain: vi.fn(),
    getMinimap: vi.fn(),
    getTerrainDetail: vi.fn(),
    getTexture: vi.fn(),
    getTilePlacements: vi.fn(),
    getWmo: vi.fn(),
    getM2: vi.fn(),
    getCreatureDisplay: vi.fn(),
    getZoneLights: vi.fn(),
    getGameObjectDisplay: vi.fn(),
    getServerMap: vi.fn(),
    getVmapTile: vi.fn(),
    getVmapModel: vi.fn(),
    getAreaNames: vi.fn(),
    getPlayerDisplay: vi.fn(),
    getGpuTexture: vi.fn(),
    getMapBuilding: vi.fn(),
    memoryUsage: vi.fn(),
    graphicsMemory: vi.fn().mockResolvedValue(6_000_000_000),
    trimMemory: vi.fn(),
  };

  beforeEach(async () => {
    frames = [];
    controlsRegistry.map.length = 0;
    controlsRegistry.transform.length = 0;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
    Object.values(renderer).forEach((fn) => (fn as ReturnType<typeof vi.fn>).mockReset());
    client.isSupported.mockReturnValue(true);
    client.getMaps.mockResolvedValue([{ id: 0, directory: 'Azeroth', name: 'Eastern Kingdoms', instanceType: 0 }]);
    client.getMapTiles.mockResolvedValue([{ tx: 32, ty: 48 }]);
    client.getTerrain.mockImplementation(() => Promise.resolve(flatTile(GROUND)));
    client.getMinimap.mockResolvedValue(undefined);
    client.getTerrainDetail.mockImplementation(() => Promise.resolve(flatDetail(GROUND)));
    client.getTexture.mockResolvedValue(undefined);
    client.getTilePlacements.mockResolvedValue({ wmos: [], doodads: [] });
    client.getWmo.mockResolvedValue(undefined);
    client.getM2.mockResolvedValue(undefined);
    client.getZoneLights.mockResolvedValue([]);
    client.getMapBuilding.mockResolvedValue(undefined);
    client.getServerMap.mockResolvedValue(undefined);
    client.getVmapTile.mockResolvedValue(undefined);
    client.getVmapModel.mockResolvedValue(undefined);
    client.getAreaNames.mockResolvedValue(new Map());

    await TestBed.configureTestingModule({
      imports: [HostComponent, TranslateTestingModule],
      providers: [
        { provide: WowClientService, useValue: client },
        { provide: WORLD_RENDERER_FACTORY, useValue: () => renderer },
      ],
    }).compileComponents();
  });

  afterEach(() => vi.unstubAllGlobals());

  const setup = async (init: (host: HostComponent) => void = () => undefined) => {
    const fixture = TestBed.createComponent(HostComponent);
    const page = new Page(fixture);
    const host = fixture.componentInstance;
    init(host);
    fixture.detectChanges();
    await fixture.whenStable();
    flushFrames();
    const mapControls = (): FakeMapControls => controlsRegistry.map[0] as FakeMapControls;
    const gizmo = (): FakeTransformControls => controlsRegistry.transform[0] as FakeTransformControls;
    const update = async (change: () => void): Promise<void> => {
      change();
      fixture.detectChanges();
      await fixture.whenStable();
      flushFrames();
    };
    return { fixture, page, host, mapControls, gizmo, update };
  };

  /** Settles pending promises (tile loads triggered by the camera). */
  const settle = async (fixture: { whenStable: () => Promise<unknown>; detectChanges: () => void }): Promise<void> => {
    for (let i = 0; i < 5; i++) {
      await Promise.resolve();
    }
    fixture.detectChanges();
    await fixture.whenStable();
    flushFrames();
  };

  it('renders the scene and looks at the origin by default', async () => {
    const { host } = await setup();
    expect(renderer.setPixelRatio).toHaveBeenCalled();
    expect(renderer.setSize).toHaveBeenCalledWith(1, 1, false);
    expect(renderer.render).toHaveBeenCalled();
    expect(host.centers[0].x).toBeCloseTo(0);
  });

  it('renders once per frame however many changes happened', async () => {
    const { host, fixture } = await setup();
    renderer.render.mockClear();
    host.spawns.set([spawn('creature:1', at(0, 0))]);
    host.selected.set('creature:1');
    host.paths.set([{ key: 'path:1', label: 'Path 1', points: [] }]);
    fixture.detectChanges();
    await fixture.whenStable();
    flushFrames();
    expect(renderer.render).toHaveBeenCalledTimes(1);
  });

  it('draws nearby spawns with their real model', async () => {
    client.getCreatureDisplay.mockResolvedValue({ model: 'Creature\\Wolf\\Wolf.mdx', scale: 1, textures: {} });
    client.getM2.mockResolvedValue({
      positions: new Float32Array(9),
      normals: new Float32Array(9),
      uvs: new Float32Array(6),
      indices: new Uint16Array([0, 1, 2]),
      batches: [{ start: 0, count: 3, textureType: 0, blend: 0, geoset: 0, twoSided: false, unlit: false, alpha: 1 }],
    });
    const { fixture } = await setup((h) => {
      h.focus.set(at(0, 0));
      h.spawns.set([{ ...spawn('creature:1', at(0, 0)), displayId: 5 }]);
    });
    await new Promise((resolve) => setTimeout(resolve));
    renderer.render.mockClear();
    await fixture.whenStable();
    flushFrames();
    expect(client.getCreatureDisplay).toHaveBeenCalledWith(5);
    expect(client.getM2).toHaveBeenCalledWith('Creature\\Wolf\\Wolf.mdx');
    expect(renderer.render).toHaveBeenCalled();
  });

  it('works out where waypoints are a slice per frame, and stops when closed', async () => {
    const slice = vi.spyOn(WorldScene.prototype, 'workOutWaypointPlaces');
    slice.mockReturnValueOnce(true).mockReturnValueOnce(false);
    const { fixture, host } = await setup();
    const path = (key: string): WaypointPath => ({ key, label: key, points: [{ point: 1, position: at(0, 0) }] });
    host.paths.set([path('path:1')]);
    await settle(fixture);
    // asked again while working: the same run carries on
    host.paths.set([path('path:1'), path('path:2')]);
    await settle(fixture);
    flushFrames();
    flushFrames();
    flushFrames();
    // a slice with some left, then the next frame's
    expect(slice.mock.calls.length).toBeGreaterThanOrEqual(2);
    // closed before the next slice
    host.paths.set([path('path:3')]);
    await settle(fixture);
    const before = slice.mock.calls.length;
    fixture.destroy();
    flushFrames();
    expect(slice).toHaveBeenCalledTimes(before);
    slice.mockRestore();
  });

  it('places the buildings the editor asks for (a transport on its map)', async () => {
    const setExtras = vi.spyOn(WorldObjects.prototype, 'setExtras');
    const { fixture, host } = await setup();
    const ship = { key: 'transport:1', path: 'ship.wmo', position: { x: 0, y: 0, z: 0 }, orientation: 0 };
    host.buildings.set([ship]);
    await settle(fixture);
    expect(setExtras).toHaveBeenLastCalledWith([ship]);
    setExtras.mockRestore();
  });

  it('shows performance stats when asked: frames, draws, graphics memory and what is loaded', async () => {
    const clock = { now: 1000 };
    vi.spyOn(performance, 'now').mockImplementation(() => clock.now);
    const { page, fixture, host } = await setup((h) => h.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, showStats: true }));
    const draw = async () => {
      clock.now += 600;
      host.spawns.set([...host.spawns()]);
      await settle(fixture);
      flushFrames();
      fixture.detectChanges();
    };
    // without what the renderer tells (a fake one) and the browser's memory; frames close together are counted
    await draw();
    clock.now -= 500;
    await draw();
    await draw();
    expect(page.getDebugElementByTestId('world-viewer-stats').nativeElement.textContent).toContain('WORLD_EDITOR.STATS_DRAWS 0');
    expect(page.getDebugElementByTestId('world-viewer-memory', false)).toBeFalsy();
    renderer.info = { render: { calls: 12, triangles: 3400 }, memory: { geometries: 5, textures: 7 }, programs: [1, 2] };
    Object.defineProperty(performance, 'memory', { configurable: true, value: { usedJSHeapSize: 250_000_000 } });
    try {
      // (memory is measured every 2 seconds)
      clock.now += 3000;
      await draw();
      const text = page.getDebugElementByTestId('world-viewer-stats').nativeElement.textContent.replace(/\s+/g, ' ');
      expect(text).toContain('WORLD_EDITOR.STATS_DRAWS 12 · WORLD_EDITOR.STATS_TRIANGLES 3400');
      expect(text).toContain('5 WORLD_EDITOR.STATS_GEOMETRIES · 7 WORLD_EDITOR.STATS_TEXTURES · 2 WORLD_EDITOR.STATS_SHADERS');
      expect(text).toContain('WORLD_EDITOR.STATS_MEMORY 250 MB');
      // off: hidden
      expect(text).toContain('WORLD_EDITOR.STATS_GPU_MEMORY ~');
      // the desktop app: the window's memory and the computer's; over the limits set, what isn't used is let go
      client.memoryUsage.mockReturnValue({ used: 2_000_000_000, total: 8_000_000_000 });
      const release = vi.spyOn(TextureCache.prototype, 'release');
      host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, showStats: true, memoryCapMb: 1024, gpuCapMb: 1 });
      clock.now += 3000;
      await draw();
      const capped = page.getDebugElementByTestId('world-viewer-stats').nativeElement.textContent.replace(/\s+/g, ' ');
      expect(capped).toContain('WORLD_EDITOR.STATS_MEMORY 2.0 GB / 8.0 GB (WORLD_EDITOR.STATS_CAPPED 1.0 GB)');
      expect(capped).toContain('(WORLD_EDITOR.STATS_CAPPED 1 MB)');
      // and the graphics card's own memory
      expect(capped).toMatch(/STATS_GPU_MEMORY ~\S+ \S+ \/ 6\.0 GB/);
      expect(capped).toContain('WORLD_EDITOR.STATS_OVER');
      expect(client.trimMemory).toHaveBeenCalled();
      expect(release).toHaveBeenCalledWith(expect.anything(), 0, true);
      // back under: loading ahead again
      client.memoryUsage.mockReturnValue({ used: 100_000_000, total: 8_000_000_000 });
      host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, showStats: true, memoryCapMb: 1024 });
      clock.now += 3000;
      await draw();
      expect(page.getDebugElementByTestId('world-viewer-over-budget', false)).toBeFalsy();
      // a limit without the stats still measures; nothing measured too often
      host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, memoryCapMb: 1024 });
      clock.now += 3000;
      await draw();
      await draw();
      release.mockRestore();
      client.memoryUsage.mockReturnValue(undefined);
      host.render.set(DEFAULT_WORLD_RENDER_SETTINGS);
      await draw();
      expect(page.getDebugElementByTestId('world-viewer-stats', false)).toBeFalsy();
    } finally {
      delete renderer.info;
      delete (performance as unknown as { memory?: unknown }).memory;
    }
  });

  it('keeps the pins of a kind of model turned off, and passes trees and props apart', async () => {
    const models = vi.spyOn(SpawnModels.prototype, 'configure');
    const doodads = vi.spyOn(WorldDoodads.prototype, 'configure');
    await setup((h) =>
      h.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, showCreatureModels: false, showGameobjectModels: false, showTrees: false }),
    );
    expect(models).toHaveBeenLastCalledWith(expect.objectContaining({ creatureDistance: 0, gameobjectDistance: 0 }));
    expect(doodads).toHaveBeenLastCalledWith(expect.objectContaining({ trees: false, props: true }));
    models.mockRestore();
    doodads.mockRestore();
  });

  it('hides the indoor parts of buildings when asked, except on a map made of one building', async () => {
    const indoor = vi.spyOn(WorldObjects.prototype, 'setIndoorVisible');
    const { fixture, host } = await setup((h) => {
      h.map.set('Azeroth');
      h.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, showIndoor: false });
    });
    await settle(fixture);
    expect(indoor).toHaveBeenLastCalledWith(false);
    // a dungeon of one building: always shown
    client.getMapBuilding.mockResolvedValue({ placement: {}, bounds: {} });
    host.map.set('Dungeon');
    fixture.detectChanges();
    await settle(fixture);
    expect(indoor).toHaveBeenLastCalledWith(true);
    // the answer for a map left meanwhile is dropped; a failure is ignored
    let answer: (value: unknown) => void = () => undefined;
    client.getMapBuilding.mockReturnValueOnce(new Promise((resolve) => (answer = resolve)));
    host.map.set('Azeroth');
    fixture.detectChanges();
    client.getMapBuilding.mockRejectedValueOnce(new Error('no wdt'));
    host.map.set('Kalimdor');
    fixture.detectChanges();
    answer(undefined);
    await settle(fixture);
    indoor.mockRestore();
  });

  it("draws a wall at the map's edge, hidden when turned off, for the map shown only", async () => {
    const { fixture, host } = await setup((h) => h.map.set('Azeroth'));
    await settle(fixture);
    flushFrames();
    const scene = () => renderer.render.mock.calls.at(-1)?.[0] as Object3D;
    const edge = () => scene().getObjectByName('map-edge') as Object3D;
    expect(edge().children).toHaveLength(1);
    expect(edge().visible).toBe(true);
    host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, showMapEdge: false });
    fixture.detectChanges();
    expect(edge().visible).toBe(false);
    // the answer for a map left meanwhile is dropped; a failure is ignored
    let answer: (value: unknown) => void = () => undefined;
    client.getMapTiles.mockReturnValueOnce(new Promise((resolve) => (answer = resolve)));
    host.map.set('Kalimdor');
    fixture.detectChanges();
    client.getMapTiles.mockRejectedValueOnce(new Error('no wdt'));
    host.map.set('Northrend');
    fixture.detectChanges();
    answer([{ tx: 1, ty: 1 }]);
    await settle(fixture);
    expect(edge().children).toHaveLength(0);
  });

  it('draws the skybox chosen around the camera, turning slowly when asked', async () => {
    client.getM2.mockResolvedValue({
      positions: new Float32Array([0, 0, 0, 100, 0, 0, 0, 100, 0]),
      normals: new Float32Array(9),
      uvs: new Float32Array(6),
      indices: new Uint16Array([0, 1, 2]),
      batches: [{ start: 0, count: 3, textureType: 0, blend: 0, geoset: 0, twoSided: false, unlit: true }],
      collision: { positions: new Float32Array(0), indices: new Uint16Array(0) },
    });
    const { fixture, host } = await setup((h) =>
      h.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, skyboxModel: 'Environments\\Stars\\Stars.m2', skyboxSpin: true }),
    );
    await fixture.whenStable();
    flushFrames();
    const scene = renderer.render.mock.calls.at(-1)?.[0] as Object3D;
    expect(client.getM2).toHaveBeenCalledWith('Environments\\Stars\\Stars.m2');
    expect(scene.getObjectByName('skybox')?.children).toHaveLength(1);
    // turning: it keeps drawing
    expect(frames.length).toBeGreaterThan(0);
    host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, skybox: false });
    fixture.detectChanges();
    flushFrames();
    flushFrames();
    expect(scene.getObjectByName('skybox')?.children).toHaveLength(0);
    expect(frames).toHaveLength(0);
  });

  it('draws the weather around the camera, drawing on while it falls', async () => {
    const { fixture, host } = await setup();
    await fixture.whenStable();
    flushFrames();
    const scene = renderer.render.mock.calls.at(-1)?.[0] as Object3D;
    expect(scene.getObjectByName('weather')?.children).toHaveLength(0);
    expect(frames).toHaveLength(0);
    host.weather.set({ kind: 'snow', intensity: 0.5 });
    fixture.detectChanges();
    flushFrames();
    expect(scene.getObjectByName('weather')?.children).toHaveLength(1);
    expect(frames.length).toBeGreaterThan(0);
    flushFrames();
    host.weather.set(undefined);
    fixture.detectChanges();
    flushFrames();
    flushFrames();
    expect(scene.getObjectByName('weather')?.children).toHaveLength(0);
    expect(frames).toHaveLength(0);
  });

  it("lights the zone at the time of day chosen, or at the computer's time checked every minute", async () => {
    const configure = vi.spyOn(ZoneLighting.prototype, 'configure');
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    vi.setSystemTime(new Date(2026, 9, 28, 21, 30));
    const { fixture, host } = await setup((h) => h.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, zoneLighting: true, timeOfDay: 600 }));
    expect(configure).toHaveBeenLastCalledWith(true, 1200, 1);
    // with the brightness of the time of day: 21:30 is between the evening (18:00) and the night (midnight)
    host.render.set({
      ...DEFAULT_WORLD_RENDER_SETTINGS,
      zoneLighting: true,
      timeFollowsClock: true,
      brightnessEvening: 200,
      brightnessNight: 50,
    });
    fixture.detectChanges();
    expect(configure.mock.lastCall?.[2]).toBeCloseTo(2 + (0.5 - 2) * (210 / 360));
    expect(configure).toHaveBeenLastCalledWith(true, (21 * 60 + 30) * 2, expect.any(Number));
    // (the clock moves on with the timers)
    vi.advanceTimersByTime(60_000);
    expect(configure).toHaveBeenLastCalledWith(true, (21 * 60 + 31) * 2, expect.any(Number));
    fixture.destroy();
    vi.useRealTimers();
    configure.mockRestore();
  });

  it('shows what is still loading, and where the camera looks', async () => {
    let finish: (value: unknown) => void = () => undefined;
    client.getTerrainDetail.mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const { page, fixture } = await setup((h) => {
      h.focus.set(at(0, 0));
      h.map.set('Azeroth');
      h.resetNorth.set(1);
    });
    await settle(fixture);
    vi.advanceTimersByTime(300);
    flushFrames();
    fixture.detectChanges();
    const text = page.activity().nativeElement.textContent?.replace(/\s+/g, ' ');
    expect(text).toContain('WORLD_EDITOR.TERRAIN 1');
    // the compass: the camera looks north-east at first
    expect(page.getDebugElementByTestId('world-compass-degrees').nativeElement.textContent).toBe('45°');
    // clicking it turns the camera north, as asking from outside does (a turn asked before the view was ready is dropped)
    page.getDebugElementByTestId('world-viewer-compass').nativeElement.click();
    vi.advanceTimersByTime(300);
    flushFrames();
    fixture.detectChanges();
    expect(page.getDebugElementByTestId('world-compass-degrees').nativeElement.textContent).toBe('0°');
    fixture.componentInstance.resetNorth.set(2);
    fixture.detectChanges();
    vi.advanceTimersByTime(300);
    flushFrames();
    fixture.detectChanges();
    expect(page.getDebugElementByTestId('world-compass-degrees').nativeElement.textContent).toBe('0°');
    fixture.componentInstance.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, compass: false });
    fixture.detectChanges();
    expect(page.getDebugElementByTestId('world-compass', false)).toBeFalsy();
    // how much of it is done
    expect(page.getDebugElementByTestId('world-viewer-activity-percent').nativeElement.textContent).toBe('0%');
    expect(page.getDebugElementByTestId('world-viewer-activity-bar').nativeElement.style.width).toBe('0%');
    expect(page.target().nativeElement.textContent?.trim()).toBe(
      `WORLD_EDITOR.CAMERA: X ${CENTER.x} Y ${Math.round(CENTER.y * 10) / 10} Z ${GROUND}`,
    );

    finish(flatDetail(GROUND));
    for (let i = 0; i < 5; i++) {
      await settle(fixture);
      vi.advanceTimersByTime(300);
      flushFrames();
    }
    fixture.detectChanges();
    expect(page.activity(false)).toBeFalsy();
    // the editor loading spawns shows in the same bar
    fixture.componentInstance.spawnsLoading.set(true);
    fixture.detectChanges();
    expect(page.activity().nativeElement.textContent?.replace(/\s+/g, ' ')).toContain('· WORLD_EDITOR.SPAWNS');
    vi.useRealTimers();
  });

  it('changes the camera speed with Shift + wheel instead of zooming, and shows it', async () => {
    const { page, host, fixture, update } = await setup();
    const viewer = page.getDebugElementByTestId('world-viewer').nativeElement as HTMLElement;
    const wheel = (init: WheelEventInit) => {
      const event = new WheelEvent('wheel', { cancelable: true, bubbles: true, ...init });
      page.canvas().nativeElement.dispatchEvent(event);
      return event;
    };
    expect(wheel({ deltaY: -100, shiftKey: true }).defaultPrevented).toBe(true);
    wheel({ deltaX: 100, shiftKey: true });
    wheel({ shiftKey: true });
    expect(host.speeds).toEqual([1.25, 0.8]);
    // a plain wheel zooms as usual
    wheel({ deltaY: -100 });
    expect(host.speeds).toHaveLength(2);
    await update(() => host.navigation.set({ ...DEFAULT_WORLD_CONTROLS_SETTINGS, speed: 2.5 }));
    expect(page.getDebugElementByTestId('world-viewer-speed').nativeElement.textContent.trim()).toBe('WORLD_EDITOR.SPEED ×2.5');
    expect(viewer).toBeTruthy();
    fixture.destroy();
  });

  it('moves the camera with the navigation keys while the view has the focus', async () => {
    vi.spyOn(performance, 'now').mockReturnValue(0);
    const { page, host, fixture, update } = await setup((h) => h.focus.set(at(0, 0)));
    const canvas = page.canvas().nativeElement;
    const key = (type: 'keydown' | 'keyup', code: string, shiftKey = false): KeyboardEvent => {
      const event = new KeyboardEvent(type, { code, shiftKey, cancelable: true });
      canvas.dispatchEvent(event);
      return event;
    };
    // a movement frame, then (at the same time, so without moving further) the render frame it asked for
    const frameAt = (time: number): void => {
      for (let i = 0; i < 2; i++) {
        const pending = frames;
        frames = [];
        pending.forEach((frame) => frame(time));
      }
      fixture.detectChanges();
    };
    const target = () => page.target().nativeElement.textContent?.trim();
    flushFrames();
    fixture.detectChanges();
    const start = target();

    expect(key('keydown', 'KeyW').defaultPrevented).toBe(true);
    key('keydown', 'KeyW');
    frameAt(100);
    const moved = target();
    expect(moved).not.toBe(start);

    // up (Q) changes the height; Shift goes faster; keys released stop the camera
    key('keyup', 'KeyW');
    key('keydown', 'KeyQ', true);
    frameAt(200);
    expect(target()).not.toBe(moved);
    key('keyup', 'KeyQ');
    frameAt(300);
    const stopped = target();
    frameAt(400);
    expect(target()).toBe(stopped);

    // other keys pass through; losing the focus releases held keys
    expect(key('keydown', 'KeyP').defaultPrevented).toBe(false);
    key('keyup', 'KeyP');
    key('keydown', 'ArrowLeft');
    canvas.dispatchEvent(new FocusEvent('blur'));
    frameAt(500);
    expect(target()).toBe(stopped);

    // turned off
    await update(() => host.navigation.set({ ...DEFAULT_WORLD_CONTROLS_SETTINGS, keyboardNavigation: true }));
    key('keydown', 'KeyD');
    await update(() => host.navigation.set({ ...DEFAULT_WORLD_CONTROLS_SETTINGS, keyboardNavigation: false }));
    expect(key('keydown', 'KeyW').defaultPrevented).toBe(false);
    // closing the view while a key is held stops the movement
    fixture.destroy();
  });

  it('streams terrain around the focus of the selected map', async () => {
    const { host, fixture } = await setup((h) => {
      h.focus.set(at(0, 0));
      h.map.set('Azeroth');
    });
    await settle(fixture);
    expect(client.getMapTiles).toHaveBeenCalledWith('Azeroth');
    expect(client.getTerrainDetail).toHaveBeenCalledWith('Azeroth', { tx: 32, ty: 48 });
    expect(client.getTexture).toHaveBeenCalledWith('base.blp');
    expect(client.getTilePlacements).toHaveBeenCalledWith('Azeroth', { tx: 32, ty: 48 });
    expect(host.centers.at(-1)?.x).toBeCloseTo(CENTER.x);
  });

  it('loads a whole region on top of the tiles around the camera', async () => {
    client.getMapTiles.mockResolvedValue([
      { tx: 32, ty: 48 },
      { tx: 32, ty: 52 },
    ]);
    const { fixture, host, update } = await setup((h) => {
      h.focus.set(at(0, 0));
      h.map.set('Azeroth');
    });
    await settle(fixture);
    expect(client.getTerrainDetail).not.toHaveBeenCalledWith('Azeroth', { tx: 32, ty: 52 });
    const far = tileCenter({ tx: 32, ty: 52 });
    await update(() => host.region.set({ minX: far.x - 10, maxX: far.x + 10, minY: far.y - 10, maxY: far.y + 10 }));
    await settle(fixture);
    // far from the camera, the region is drawn with the cheap terrain
    expect(client.getTerrain).toHaveBeenCalledWith('Azeroth', { tx: 32, ty: 52 });
    expect(client.getTilePlacements).toHaveBeenCalledWith('Azeroth', { tx: 32, ty: 52 });
  });

  it('switches to low-poly minimap terrain when asked', async () => {
    const { host, fixture, update } = await setup((h) => {
      h.focus.set(at(0, 0));
      h.map.set('Azeroth');
    });
    await settle(fixture);
    await update(() => host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, lowDetailTerrain: true }));
    await settle(fixture);
    expect(client.getTerrain).toHaveBeenCalledWith('Azeroth', { tx: 32, ty: 48 });
  });

  it('shows a loading indicator while the map loads, then hides it', async () => {
    let resolveTiles: (tiles: unknown[]) => void = () => undefined;
    client.getMapTiles.mockReturnValue(new Promise((resolve) => (resolveTiles = resolve)));
    const { page, update, fixture } = await setup();
    await update(() => fixture.componentInstance.map.set('Azeroth'));
    expect(page.loading().nativeElement.textContent).toContain('WORLD_EDITOR.LOADING_TERRAIN');

    resolveTiles([]);
    await settle(fixture);
    expect(page.loading(false)).toBeFalsy();
  });

  it('explains that the 3D view needs the desktop app', async () => {
    client.isSupported.mockReturnValue(false);
    const { page } = await setup((h) => h.map.set('Azeroth'));
    expect(page.error().nativeElement.textContent).toContain('WORLD_EDITOR.ERROR_DESKTOP_ONLY');
  });

  it('shows errors from the game data and clears them when the map is unset', async () => {
    client.getMapTiles.mockRejectedValue(new Error('Set the WoW client folder first.'));
    const { page, update, fixture } = await setup((h) => h.map.set('Azeroth'));
    await settle(fixture);
    expect(page.error().nativeElement.textContent).toContain('Set the WoW client folder first.');

    await update(() => fixture.componentInstance.map.set(undefined));
    await settle(fixture);
    expect(page.error(false)).toBeFalsy();
  });

  describe('picking', () => {
    const pickSetup = () =>
      setup((h) => {
        h.map.set('Azeroth');
        h.spawns.set([spawn('creature:7', at(0, 0), 'Deputy Willem')]);
        h.paths.set([{ key: 'path:1', label: 'Path 1', owners: ['Guard (7)'], points: [{ point: 3, position: at(300, 300) }] }]);
        h.focus.set(at(0, 0));
      });

    it('tells on hover why a spawn shows its pin instead of its model', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { page, fixture } = await pickSetup();
      await settle(fixture);
      page.pointer('pointermove', 50, 50);
      flushFrames();
      fixture.detectChanges();
      expect(page.label().nativeElement.textContent).toContain('Pin: it has no display');
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Pin instead of a model: Deputy Willem'));
      warn.mockRestore();
    });

    it('names what the map shows under the resting cursor, and puts hover labels away from the edges', async () => {
      const describe = vi.spyOn(WorldScene.prototype, 'describe').mockReturnValue({
        kind: 'building',
        path: 'Hall.wmo',
        group: 3,
        id: 5,
        faces: 12,
        batches: 2,
        invisible: true,
        position: at(0, 0),
      });
      const { page, host, fixture } = await pickSetup();
      await settle(fixture);
      const line = () => page.getDebugElementByTestId('world-viewer-mouseover', false)?.nativeElement.textContent?.replace(/\s+/g, ' ');
      const rest = async (x: number, y: number) => {
        page.pointer('pointermove', x, y);
        await new Promise((resolve) => setTimeout(resolve, 150));
        flushFrames();
        fixture.detectChanges();
      };
      await rest(80, 80);
      expect(line()).toContain('WORLD_EDITOR.MOUSE_OVER_BUILDING Hall.wmo · WORLD_EDITOR.MOUSE_OVER_GROUP 3');
      expect(line()).toContain('WORLD_EDITOR.MOUSE_OVER_INVISIBLE');
      expect(line()).toContain('2 WORLD_EDITOR.MOUSE_OVER_BATCHES, 12 WORLD_EDITOR.MOUSE_OVER_FACES · id 5');
      // a doodad without a placement id or group; the terrain
      describe.mockReturnValue({ kind: 'doodad', path: 'Box.m2', faces: 1, batches: 1, position: at(0, 0) });
      await rest(70, 70);
      expect(line()).toContain('WORLD_EDITOR.MOUSE_OVER_DOODAD Box.m2 · 1');
      expect(line()).not.toContain('id');
      describe.mockReturnValue({ kind: 'terrain', tile: { tx: 32, ty: 48 }, position: at(0, 0) });
      await rest(70, 70);
      expect(line()).toContain('WORLD_EDITOR.MOUSE_OVER_TERRAIN 32_48');
      // a canvas of no size: nothing looked up
      describe.mockClear();
      vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockReturnValue(new DOMRect(0, 0, 0, 0));
      await rest(70, 70);
      expect(describe).not.toHaveBeenCalled();
      vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockReturnValue(new DOMRect(0, 0, 100, 100));
      // leaving the view, or turned off: gone
      page.pointer('pointerleave', 70, 70);
      fixture.detectChanges();
      expect(line()).toBeUndefined();
      host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, showMouseOver: false });
      await rest(70, 70);
      expect(line()).toBeUndefined();
      describe.mockRestore();

      // the hover label of a spawn in the lower right: left of and above the cursor
      page.pointer('pointermove', 50, 50);
      flushFrames();
      fixture.detectChanges();
      expect(page.label().nativeElement.classList).not.toContain('flip-x');
      page.pointer('pointermove', 51, 51);
      flushFrames();
      fixture.detectChanges();
      expect(page.label().nativeElement.classList).toContain('flip-x');
      expect(page.label().nativeElement.classList).toContain('flip-y');
    });

    it('looks straight down when asked, and labels the ends of a path', async () => {
      const { page, host, fixture } = await pickSetup();
      await settle(fixture);
      host.topView.set(1);
      fixture.detectChanges();
      host.pathEnds.set({ start: at(0, 0), end: at(5, 5) });
      fixture.detectChanges();
      flushFrames();
      fixture.detectChanges();
      expect(page.getDebugElementByTestId('world-viewer-path-start').nativeElement.textContent).toContain('WORLD_EDITOR.PATH_START');
      expect(page.getDebugElementByTestId('world-viewer-path-end').nativeElement.textContent).toContain('WORLD_EDITOR.PATH_END');
      // an end behind the camera isn't labelled; no path: none
      host.pathEnds.set({ start: at(0, 0), end: { ...at(0, 0), z: 100_000 } });
      fixture.detectChanges();
      flushFrames();
      fixture.detectChanges();
      expect(page.getDebugElementByTestId('world-viewer-path-end', false)).toBeFalsy();
      host.pathEnds.set(undefined);
      fixture.detectChanges();
      flushFrames();
      fixture.detectChanges();
      expect(page.getDebugElementByTestId('world-viewer-path-start', false)).toBeFalsy();
    });

    it('reports Ctrl + clicks as additive (to select more)', async () => {
      const { page, host, fixture } = await pickSetup();
      await settle(fixture);
      page.pointer('pointerdown', 50, 50, 0, false, true);
      page.pointer('pointerup', 50, 50, 0, false, true);
      expect(host.picks).toEqual([expect.objectContaining({ type: 'spawn', key: 'creature:7', additive: true })]);
    });

    it('tells the ground under positions', async () => {
      const { host, fixture, update } = await pickSetup();
      for (let i = 0; i < 4; i++) {
        await settle(fixture);
      }
      await update(() =>
        host.ground.set([
          { key: 'creature:7', position: at(0, 0, GROUND + 5) },
          { key: 'far', position: { x: 0, y: 0, z: 0 } },
        ]),
      );
      expect(host.heights.at(-1)?.['creature:7']).toBeCloseTo(GROUND);
      expect(host.heights.at(-1)?.['far']).toBeNull();
    });

    it('highlights the spawns selected along with the main one', async () => {
      const groups = vi.spyOn(WorldScene.prototype, 'setGroupSelection');
      const { host, update } = await pickSetup();
      await update(() => host.group.set(['creature:7']));
      expect(groups).toHaveBeenLastCalledWith(['creature:7']);
    });

    it('names the area under the camera from the server terrain', async () => {
      const areas = new Uint16Array(256).fill(87);
      client.getServerMap.mockResolvedValue({
        areas,
        liquid: { types: new Uint8Array(256).fill(0x12), offsetX: 0, offsetY: 0, width: 128, height: 128, level: 5 },
      });
      client.getAreaNames.mockResolvedValue(
        new Map([
          [87, { name: 'Goldshire', parent: 12 }],
          [12, { name: 'Elwynn Forest', parent: 0 }],
          [5, { name: 'Zone', parent: 0 }],
        ]),
      );
      const { page, host, fixture, update } = await pickSetup();
      await settle(fixture);
      flushFrames();
      await settle(fixture);
      expect(page.getDebugElementByTestId('world-viewer-area').nativeElement.textContent).toContain('Goldshire (Elwynn Forest)');
      // the zone, for its weather
      expect(host.zones.at(-1)).toBe(12);
      // the liquid there: deep ocean
      expect(page.getDebugElementByTestId('world-viewer-liquid').nativeElement.textContent.replace(/\s+/g, ' ').trim()).toBe(
        '· WORLD_EDITOR.LIQUID_OCEAN (WORLD_EDITOR.LIQUID_DEEP)',
      );
      // the camera's phase, when told
      expect(page.getDebugElementByTestId('world-viewer-phase', false)).toBeFalsy();
      await update(() => host.cameraPhase.set(3));
      expect(page.getDebugElementByTestId('world-viewer-phase').nativeElement.textContent?.trim()).toBe('· WORLD_EDITOR.PHASE 3');
      // a zone without parent; a tile without terrain data; a failure
      areas.fill(5);
      await update(() => host.focus.set(at(100, 0)));
      await settle(fixture);
      flushFrames();
      await settle(fixture);
      expect(page.getDebugElementByTestId('world-viewer-area').nativeElement.textContent?.trim()).toBe('· Zone');
      expect(host.zones.at(-1)).toBe(5);
      client.getServerMap.mockResolvedValue(undefined);
      await update(() => host.focus.set(at(200, 0)));
      await settle(fixture);
      flushFrames();
      await settle(fixture);
      expect(page.getDebugElementByTestId('world-viewer-area', false)).toBeFalsy();
      expect(host.zones.at(-1)).toBeUndefined();
      client.getServerMap.mockRejectedValue(new Error('locked'));
      await update(() => host.focus.set(at(300, 0)));
      await settle(fixture);
      flushFrames();
      await settle(fixture);
      expect(page.getDebugElementByTestId('world-viewer-area', false)).toBeFalsy();
    });

    it('plays the movement simulation with a copy of the creature, stops it, and replaces it', async () => {
      let now = 0;
      vi.spyOn(performance, 'now').mockImplementation(() => now);
      const ghost = vi.spyOn(WorldScene.prototype, 'moveGhost');
      // a flat navigation mesh around the centre: the first leg walks on it
      const corners = [at(-100, -100), at(100, -100), at(100, 100), at(-100, 100)].map((p) => worldToScene({ ...p, z: GROUND }));
      const positions = [0, 1, 2, 0, 2, 3].flatMap((k) => [corners[k].x, corners[k].y, corners[k].z]);
      client.getNavMeshTile.mockResolvedValue({ positions: Float32Array.from(positions), colors: new Float32Array(positions.length) });
      const { page, host, fixture, update } = await pickSetup();
      await settle(fixture);
      const plan: MovementSimulation = {
        key: 'creature:7',
        // off the mesh's diagonal (where its two triangles meet)
        start: at(0, -5),
        legs: [
          { to: at(10, -5), speed: 5, wait: 4, label: 'point 1', actions: ['script 5'] },
          { to: at(10, 10), speed: 5, wait: 2, label: 'point 2', fly: true },
        ],
      };
      await update(() => host.simulation.set(plan));
      await settle(fixture);
      fixture.detectChanges();
      expect(page.getDebugElementByTestId('world-viewer-simulation').nativeElement.textContent).toContain('point 1');
      // a bubble over its head tells what it does
      flushFrames();
      fixture.detectChanges();
      expect(page.getDebugElementByTestId('world-viewer-bubble').nativeElement.textContent).toContain('WORLD_EDITOR.SIM_WALK → point 1');
      // 1.5 s at ×2: 3 s in, at point 1 and waiting
      now = 1500;
      flushFrames();
      fixture.detectChanges();
      const [position, orientation] = ghost.mock.calls.at(-1) as [WorldPosition, number];
      // at the end of the route walked on the navigation mesh
      expect(Math.hypot(position.x - at(10, -5).x, position.y - at(10, -5).y)).toBeLessThan(0.01);
      expect(Number.isFinite(orientation)).toBe(true);
      expect(page.getDebugElementByTestId('world-viewer-simulation').nativeElement.textContent).toContain('WORLD_EDITOR.SIM_WAITING');
      // what it does there, and the time since it started
      expect(page.getDebugElementByTestId('world-viewer-simulation').nativeElement.textContent).toContain('script 5');
      expect(page.getDebugElementByTestId('world-viewer-simulation').nativeElement.textContent).toContain('3.0 s (3000 ms)');
      // hovering the copy tells the same
      const near = vi.spyOn(WorldScene.prototype, 'ghostNear').mockReturnValue(true);
      page.pointer('pointermove', 50, 50);
      flushFrames();
      fixture.detectChanges();
      expect(page.label().nativeElement.textContent).toContain('WORLD_EDITOR.SIM_WAITING');
      near.mockRestore();
      // slower from now on, without starting over: 1 s more at ×1 is 4 s in
      host.simulationRate.set(1);
      fixture.detectChanges();
      now = 2500;
      flushFrames();
      fixture.detectChanges();
      expect(page.getDebugElementByTestId('world-viewer-simulation').nativeElement.textContent).toContain('4.0 s (4000 ms)');
      // 6.5 s more: waiting at point 2, which does nothing
      now = 9000;
      flushFrames();
      fixture.detectChanges();
      expect(page.getDebugElementByTestId('world-viewer-simulation').nativeElement.textContent).toContain(
        'point 2: WORLD_EDITOR.SIM_WAITING',
      );
      // played once: it stops at the end, and says so
      await update(() => host.simulation.set({ ...plan, once: true }));
      await settle(fixture);
      now = 100_000;
      flushFrames();
      fixture.detectChanges();
      expect(host.simulationEnds).toBe(1);
      expect(page.getDebugElementByTestId('world-viewer-simulation', false)).toBeFalsy();
      flushFrames();
      fixture.detectChanges();
      expect(page.getDebugElementByTestId('world-viewer-bubble', false)).toBeFalsy();
      // a newer simulation replaces it; an unknown creature shows none
      await update(() => host.simulation.set({ ...plan, key: 'creature:404' }));
      await settle(fixture);
      expect(page.getDebugElementByTestId('world-viewer-simulation', false)).toBeFalsy();
      await update(() => host.simulation.set({ ...plan, legs: [] }));
      await settle(fixture);
      await update(() => host.simulation.set(plan));
      await update(() => host.simulation.set(undefined));
      await settle(fixture);
      expect(page.getDebugElementByTestId('world-viewer-simulation', false)).toBeFalsy();
      await update(() => host.simulation.set(plan));
      await settle(fixture);
      fixture.destroy();
    });

    it('reports clicks on spawns', async () => {
      const { page, host, fixture } = await pickSetup();
      await settle(fixture);
      page.click();
      expect(host.picks).toEqual([expect.objectContaining({ type: 'spawn', key: 'creature:7' })]);
    });

    it('asks for a context menu on right-clicks on spawns, waypoints and the ground, not after rotating', async () => {
      const { page, host, fixture, update } = await pickSetup();
      await settle(fixture);
      page.pointer('pointerdown', 50, 50, 2);
      page.pointer('pointerup', 50, 50, 2);
      expect(host.contexts).toEqual([expect.objectContaining({ key: 'creature:7', x: 50, y: 50, label: expect.any(String) })]);
      expect(host.picks).toEqual([]);
      // dragged with the right button: the view was rotated
      page.pointer('pointerdown', 50, 50, 2);
      page.pointer('pointerup', 80, 80, 2);
      await update(() => host.focus.set(at(300, 300)));
      page.pointer('pointerdown', 50, 50, 2);
      page.pointer('pointerup', 50, 50, 2);
      expect(host.contexts[1]).toEqual(expect.objectContaining({ key: 'path:1#3', x: 50, y: 50 }));
      await update(() => host.focus.set(at(-100, -100)));
      page.pointer('pointerdown', 50, 50, 2);
      page.pointer('pointerup', 50, 50, 2);
      // the ground: its place, and where the player marker is
      expect(host.contexts[2]).toEqual(expect.objectContaining({ key: 'ground', label: expect.stringMatching(/^-?\d+\.\d\d /) }));
      expect(host.contexts[2].position).toBeTruthy();
      // the middle button does nothing
      page.pointer('pointerdown', 50, 50, 1);
      page.pointer('pointerup', 50, 50, 1);
      expect(host.contexts).toHaveLength(3);
      // nothing at all under the cursor (no terrain): no menu
      await update(() => host.map.set(undefined));
      page.pointer('pointerdown', 50, 50, 2);
      page.pointer('pointerup', 50, 50, 2);
      expect(host.contexts).toHaveLength(3);
      expect(host.picks).toEqual([]);
    });

    it('tells the liquid over the ground right-clicked, and whether it is deep water', async () => {
      const { page, host, fixture, update } = await pickSetup();
      await settle(fixture);
      await update(() => host.focus.set(at(-100, -100)));
      const liquidAt = vi.spyOn(WorldScene.prototype, 'liquidAt').mockReturnValue({ z: 10_000, kind: 'ocean', type: 2 });
      const types = new Uint8Array(256).fill(2 | 16);
      const rightClick = async () => {
        page.pointer('pointerdown', 50, 50, 2);
        page.pointer('pointerup', 50, 50, 2);
        await settle(fixture);
        return host.contexts.at(-1) as ContextRequest;
      };
      client.getServerMap.mockResolvedValue({ liquid: { types, offsetX: 0, offsetY: 0, width: 129, height: 129, level: 10_000 } });
      expect((await rightClick()).liquid).toEqual({ z: 10_000, kind: 'ocean', type: 2, deep: true });
      client.getServerMap.mockResolvedValue({
        liquid: { types: new Uint8Array(256).fill(1), offsetX: 0, offsetY: 0, width: 129, height: 129, level: 1 },
      });
      expect((await rightClick()).liquid?.deep).toBe(false);
      client.getServerMap.mockRejectedValue(new Error('no maps'));
      expect((await rightClick()).liquid).toEqual({ z: 10_000, kind: 'ocean', type: 2 });
      // a liquid under the ground (a cave's floor over a lake): just the ground
      liquidAt.mockReturnValue({ z: -10_000, kind: 'water', type: 1 });
      expect((await rightClick()).liquid).toBeUndefined();
      // the view closed before the server's map was read: no menu
      liquidAt.mockReturnValue({ z: 10_000, kind: 'water', type: 1 });
      const count = host.contexts.length;
      page.pointer('pointerdown', 50, 50, 2);
      page.pointer('pointerup', 50, 50, 2);
      fixture.destroy();
      await new Promise((resolve) => setTimeout(resolve));
      expect(host.contexts).toHaveLength(count);
      liquidAt.mockRestore();
    });

    it('previews the model about to be placed under the cursor, or at the crosshair', async () => {
      const { page, host, fixture, update } = await pickSetup();
      await settle(fixture);
      const place = vi.spyOn(WorldScene.prototype, 'setPlacePreviewPosition');
      const model = new Group();
      const instance = vi.spyOn(SpawnModels.prototype, 'instance').mockResolvedValue({ object: model, scale: 2 });
      await update(() => host.preview.set({ kind: 'creature', displayId: 5, scale: 1.5 }));
      await settle(fixture);
      flushFrames();
      expect(instance).toHaveBeenCalledWith('creature', 5);
      const preview = (renderer.render.mock.calls.at(-1)?.[0] as Object3D).getObjectByName('place-preview') as Group;
      expect(preview.children).toEqual([model]);
      expect(model.scale.x).toBe(3);
      // the cursor out of the view: at the crosshair; over it: under the cursor
      expect(place).toHaveBeenCalledWith(expect.objectContaining({ x: expect.any(Number) }));
      place.mockClear();
      page.pointer('pointermove', 50, 50);
      flushFrames();
      expect(place).toHaveBeenCalled();
      // another model asked meanwhile: only the last shown; then none
      let first: (value: { object: Object3D; scale: number }) => void = () => undefined;
      instance.mockReturnValueOnce(new Promise((resolve) => (first = resolve)));
      await update(() => host.preview.set({ kind: 'gameobject', displayId: 6, scale: 1 }));
      await update(() => host.preview.set(undefined));
      first({ object: new Group(), scale: 1 });
      await settle(fixture);
      expect(preview.children).toHaveLength(0);
      place.mockClear();
      page.pointer('pointermove', 60, 60);
      flushFrames();
      expect(place).not.toHaveBeenCalled();
      instance.mockRestore();
      place.mockRestore();
    });

    it('reports the ground under spawns when placing', async () => {
      const { page, host, fixture, update } = await pickSetup();
      await settle(fixture);
      await update(() => host.groundOnly.set(true));
      page.click();
      expect(host.picks[0].type).toBe('ground');
    });

    it('reports clicks on the ground', async () => {
      const { page, host, fixture, update } = await pickSetup();
      await settle(fixture);
      await update(() => host.focus.set(at(-100, -100)));
      await settle(fixture);
      page.click();
      expect(host.picks[0].type).toBe('ground');
      expect(host.picks[0].position.z).toBeCloseTo(GROUND, 0);
    });

    it('ignores drags, other buttons, stray pointer-ups and empty sky', async () => {
      const { page, host, fixture, update } = await pickSetup();
      await settle(fixture);
      page.pointer('pointerdown', 10, 10);
      page.pointer('pointerup', 60, 60);
      page.click(50, 50, 2);
      page.pointer('pointerup', 50, 50);
      await update(() => host.focus.set(at(5000, 5000)));
      page.click();
      expect(host.picks).toEqual([]);
    });

    it('ignores clicks while the canvas has no size', async () => {
      const { page, host, fixture } = await pickSetup();
      await settle(fixture);
      vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockReturnValue(new DOMRect(0, 0, 0, 0));
      page.click();
      expect(host.picks).toEqual([]);
    });

    it('shows the details of a hovered spawn, and all of them while Alt is held', async () => {
      const { page, host, fixture, update } = await pickSetup();
      await settle(fixture);
      // (models off: no pin to explain)
      await update(() => host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, showModels: false }));
      await update(() =>
        host.spawns.set([
          {
            ...spawn('creature:7', at(0, 0), 'Deputy Willem'),
            details: ['Phase 2', 'Quest 1 (A) +1 (Alt)'],
            allDetails: ['Phase 2', 'Quest 1 (A)', 'Quest 2 (B)'],
          },
        ]),
      );
      const canvas = page.canvas().nativeElement;
      const label = () =>
        page
          .label()
          .nativeElement.textContent?.replace(/\s*WORLD_EDITOR\.ALT_FOR_MORE/, '')
          .trim();
      const hint = () => !!page.getDebugElementByTestId('world-viewer-label-hint', false);
      page.pointer('pointermove', 50, 50);
      flushFrames();
      fixture.detectChanges();
      expect(label()).toBe('Deputy Willem\nPhase 2\nQuest 1 (A) +1 (Alt)');
      // the label tells to hold Alt for more, until Alt is held
      expect(hint()).toBe(true);

      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }));
      // a second key event before the frame doesn't queue another update
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }));
      flushFrames();
      fixture.detectChanges();
      expect(label()).toBe('Deputy Willem\nPhase 2\nQuest 1 (A)\nQuest 2 (B)');
      expect(hint()).toBe(false);
      canvas.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt' }));
      flushFrames();
      fixture.detectChanges();
      expect(label()).toContain('+1 (Alt)');

      // a spawn without the long version keeps its details; one without details shows only its name
      await update(() => host.spawns.set([{ ...spawn('creature:7', at(0, 0), 'Deputy Willem'), details: ['Phase 2'] }]));
      page.pointer('pointermove', 50, 50, 0, true);
      flushFrames();
      fixture.detectChanges();
      expect(label()).toBe('Deputy Willem\nPhase 2');
      expect(hint()).toBe(false);
      // nothing more with Alt: no hint
      await update(() =>
        host.spawns.set([{ ...spawn('creature:7', at(0, 0), 'Deputy Willem'), details: ['Phase 2'], allDetails: ['Phase 2'] }]),
      );
      page.pointer('pointermove', 50, 50);
      flushFrames();
      fixture.detectChanges();
      expect(hint()).toBe(false);
      // after leaving the view, Alt does nothing
      page.pointer('pointerleave', 50, 50);
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }));
      flushFrames();
      fixture.detectChanges();
      expect(page.label(false)).toBeFalsy();
    });

    it('shows the name of the hovered spawn or waypoint, at most once per frame', async () => {
      const { page, host, fixture, update } = await pickSetup();
      await settle(fixture);
      // (models off: no pin to explain)
      await update(() => host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, showModels: false }));
      const hover = (x: number, y: number): void => {
        page.pointer('pointermove', x, y);
        flushFrames();
        fixture.detectChanges();
      };

      page.pointer('pointermove', 10, 10);
      page.pointer('pointermove', 50, 50);
      flushFrames();
      fixture.detectChanges();
      expect(page.label().nativeElement.textContent?.trim()).toBe('Deputy Willem');
      expect(page.label().nativeElement.style.left).toBe('64px');

      page.pointer('pointerleave', 50, 50);
      fixture.detectChanges();
      expect(page.label(false)).toBeFalsy();

      await update(() => host.focus.set(at(300, 300)));
      hover(50, 50);
      expect(page.label().nativeElement.textContent?.trim()).toBe('Path 1 · #3 · on the ground - Guard (7)');
      await update(() => host.paths.set([{ key: 'path:1', label: 'Path 1', points: [{ point: 3, position: at(300, 300) }] }]));
      hover(50, 50);
      expect(page.label().nativeElement.textContent?.trim()).toBe('Path 1 · #3 · on the ground');
      await update(() =>
        host.paths.set([{ key: 'path:1', label: 'Path 1', points: [{ point: 3, position: at(300, 300), info: ['wait 5 s', 'run'] }] }]),
      );
      hover(50, 50);
      expect(page.label().nativeElement.textContent?.trim()).toBe('Path 1 · #3 · on the ground · wait 5 s · run');

      page.pointer('pointerdown', 50, 50);
      hover(52, 52);
      expect(page.label(false)).toBeFalsy();
      page.pointer('pointerup', 52, 52);

      await update(() => host.focus.set(at(-100, -100)));
      hover(50, 50);
      expect(page.label(false)).toBeFalsy();
    });

    it('shows which mmtile the camera is on while the navigation mesh is shown, with its settings', async () => {
      const { page, host, fixture, update } = await pickSetup();
      const config = { walkableSlopeAngle: 60 } as never;
      client.getNavMeshTile.mockImplementation((_d: string, tile: { tx: number; ty: number }) =>
        Promise.resolve(
          tile.tx === 32 && tile.ty === 48 ? { positions: new Float32Array(9), colors: new Float32Array(9), config } : undefined,
        ),
      );
      await settle(fixture);
      expect(page.getDebugElementByTestId('world-viewer-mmtile', false)).toBeFalsy();
      await update(() => host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, showNavMesh: true }));
      await settle(fixture);
      flushFrames();
      fixture.detectChanges();
      expect(page.getDebugElementByTestId('world-viewer-mmtile').nativeElement.textContent.trim()).toBe('0004832.mmtile');
      expect(host.navMeshTiles.at(-1)).toEqual({ file: '0004832.mmtile', mapId: 0, tile: { tx: 32, ty: 48 }, config, missing: false });

      // a tile without a file
      await update(() => host.focus.set({ x: CENTER.x + 600, y: CENTER.y, z: 0 }));
      await settle(fixture);
      flushFrames();
      fixture.detectChanges();
      expect(page.getDebugElementByTestId('world-viewer-mmtile').nativeElement.textContent).toContain('WORLD_EDITOR.MMTILE_MISSING');
      // turned off: nothing to report
      await update(() => host.render.set(DEFAULT_WORLD_RENDER_SETTINGS));
      flushFrames();
      fixture.detectChanges();
      expect(host.navMeshTiles.at(-1)).toBeUndefined();
    });

    it('works without knowing the map id', async () => {
      client.getMaps.mockRejectedValue(new Error('no Map.dbc'));
      const { page, host, fixture, update } = await pickSetup();
      await update(() => host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, showNavMesh: true }));
      await settle(fixture);
      flushFrames();
      fixture.detectChanges();
      expect(page.getDebugElementByTestId('world-viewer-mmtile', false)).toBeFalsy();
    });

    it('answers Path / LOS questions, keeping only the latest answer, and clears them', async () => {
      const { host, fixture, update } = await pickSetup();
      await settle(fixture);
      client.getNavMeshTile.mockResolvedValue(undefined);
      const from = at(0, 0);
      await update(() => host.probe.set({ from, to: at(10, 0), range: 30, height: 2 }));
      await settle(fixture);
      expect(host.probes.at(-1)).toEqual(expect.objectContaining({ from, noNavMesh: true }));

      // a newer question wins over one still being answered
      let resolveFirst: (tile: undefined) => void = () => undefined;
      client.getNavMeshTile.mockReturnValueOnce(new Promise((resolve) => (resolveFirst = resolve)));
      await update(() => host.probe.set({ from, to: at(300, 300), range: 30, height: 2 }));
      await update(() => host.probe.set({ from, range: 30, height: 2 }));
      await settle(fixture);
      resolveFirst(undefined);
      await settle(fixture);
      expect(host.probes.at(-1)).toEqual({ from });
      const count = host.probes.length;
      await update(() => host.probe.set(undefined));
      expect(host.probes).toHaveLength(count);
    });

    it('checks a path, marks its points, drops answers a newer check replaced, and checks again after loading', async () => {
      const ok: WaypointCheck = { key: 'path:1#3', point: 3, place: 'ground', status: 'ok', reason: 'WORLD_EDITOR.CHECK_OK' };
      let finishFirst: (checks: WaypointCheck[]) => void = () => undefined;
      const checkPath = vi
        .spyOn(PathProber.prototype, 'checkPath')
        .mockReturnValueOnce(new Promise((resolve) => (finishFirst = resolve)))
        .mockResolvedValue([ok]);
      const marks = vi.spyOn(WorldScene.prototype, 'setWaypointChecks');
      const { host, fixture, update } = await pickSetup();
      const request: WaypointCheckRequest = { pathKey: 'path:1', points: [{ point: 3, position: at(300, 300) }] };
      await update(() => host.check.set(request));
      await update(() => host.check.set({ ...request }));
      await settle(fixture);
      finishFirst([{ ...ok, status: 'bad' }]);
      await settle(fixture);
      expect(host.checks).toEqual([[ok]]);
      expect(marks).toHaveBeenLastCalledWith([ok]);
      expect(checkPath).toHaveBeenCalledWith('Azeroth', request);

      // terrain loaded under the points: checked again a moment later
      await update(() => host.focus.set(at(1200, 0)));
      await settle(fixture);
      await new Promise((resolve) => setTimeout(resolve, 600));
      expect(host.checks.length).toBeGreaterThan(1);

      await update(() => host.check.set(undefined));
      expect(marks).toHaveBeenLastCalledWith([]);
    });

    it("uses the server's collision while it's needed, and works the Path / LOS answer out again as it loads", async () => {
      client.getVmapTile.mockImplementation((_m: number, tile: { tx: number }) =>
        Promise.resolve(
          tile.tx === 32 ? [{ flags: 0, id: 1, position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, name: 'Bank.wmo' }] : undefined,
        ),
      );
      client.getVmapModel.mockResolvedValue([
        { vertices: Float32Array.from([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: Uint32Array.from([0, 1, 2]) },
      ]);
      client.getNavMeshTile.mockResolvedValue(undefined);
      client.getVmapTile.mockClear();
      const { host, fixture, update } = await pickSetup();
      await settle(fixture);
      expect(host.collisionSources).toEqual(['client']);
      expect(client.getVmapTile).not.toHaveBeenCalled();
      await update(() => host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, showCollision: true }));
      await settle(fixture);
      expect(host.collisionSources).toEqual(['client', 'server']);
      // a probe, then another vmap tile coming in: answered again
      await update(() => host.probe.set({ from: at(0, 0), to: at(10, 0), range: 30, height: 2 }));
      await settle(fixture);
      const answers = host.probes.length;
      client.getVmapTile.mockResolvedValue([{ flags: 0, id: 2, position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, name: 'Bank.wmo' }]);
      await update(() => host.focus.set(at(1200, 0)));
      await settle(fixture);
      await new Promise((resolve) => setTimeout(resolve, 50));
      await settle(fixture);
      expect(host.probes.length).toBeGreaterThan(answers);
    });

    describe('navigation mesh rebuild', () => {
      const config = { cellSizeHorizontal: 0.5 } as MmapRecastConfig;
      const built: NavMeshTile = { positions: new Float32Array(18), colors: new Float32Array(18) };
      const request = (): NavMeshRebuildRequest => ({ tile: { tx: 32, ty: 48 }, config });

      beforeEach(() => {
        Object.values(rebuild).forEach((fn) => fn.mockClear());
        rebuild.loadRecast.mockResolvedValue('recast');
        rebuild.collectTileGeometry.mockResolvedValue('geometry');
        rebuild.rebuildNavMeshTile.mockImplementation((_r, _g, _t, _c, onProgress: (done: number, total: number) => void) => {
          onProgress(1, 4);
          return Promise.resolve(built);
        });
      });

      it('rebuilds the tile from the client files, draws it over the real one and reports how it goes', async () => {
        const setPreview = vi.spyOn(WorldNavMesh.prototype, 'setPreview');
        const setRealHidden = vi.spyOn(WorldNavMesh.prototype, 'setRealHidden');
        const { host, fixture, update } = await pickSetup();
        await update(() => host.rebuild.set(request()));
        await settle(fixture);
        expect(rebuild.collectTileGeometry).toHaveBeenCalledWith(client, 'Azeroth', { tx: 32, ty: 48 });
        expect(rebuild.rebuildNavMeshTile).toHaveBeenCalledWith(
          'recast',
          'geometry',
          { tx: 32, ty: 48 },
          config,
          expect.any(Function),
          expect.any(Function),
        );
        expect(host.rebuilds).toEqual([
          { status: 'reading', done: 0, total: 0, triangles: 0 },
          { status: 'building', done: 1, total: 4, triangles: 0 },
          { status: 'done', done: 0, total: 0, triangles: 2, source: 'client' },
        ]);
        expect(setPreview).toHaveBeenLastCalledWith('32_48', built);
        await update(() => host.hideReal.set(true));
        expect(setRealHidden).toHaveBeenLastCalledWith(true);
        await update(() => host.rebuild.set(undefined));
        expect(setPreview).toHaveBeenLastCalledWith(undefined);
        expect(host.rebuilds).toHaveLength(3);
      });

      it("rebuilds from the server's maps and vmaps when it has them", async () => {
        // a tile of water only
        const liquid = { types: new Uint8Array(256).fill(1), offsetX: 0, offsetY: 0, width: 129, height: 129, level: 10 };
        client.getServerMap.mockImplementation((_m: number, tile: { tx: number }) =>
          Promise.resolve(tile.tx === 32 ? { liquid } : undefined),
        );
        const { host, fixture, update } = await pickSetup();
        await settle(fixture);
        await update(() => host.rebuild.set(request()));
        await settle(fixture);
        await new Promise((resolve) => setTimeout(resolve, 50));
        await settle(fixture);
        expect(client.getServerMap).toHaveBeenCalledWith(0, { tx: 32, ty: 48 });
        expect(rebuild.collectTileGeometry).not.toHaveBeenCalled();
        expect(rebuild.rebuildNavMeshTile.mock.calls[0][1].areas[0]).toBe(8);
        expect(host.rebuilds.at(-1)?.source).toBe('server');
      });

      it('rebuilds from the client files when the map id is unknown', async () => {
        client.getMaps.mockRejectedValue(new Error('no Map.dbc'));
        client.getServerMap.mockClear();
        const { host, fixture, update } = await pickSetup();
        await update(() => host.rebuild.set(request()));
        await settle(fixture);
        expect(client.getServerMap).not.toHaveBeenCalled();
        expect(rebuild.collectTileGeometry).toHaveBeenCalled();
      });

      it('drops a rebuild a newer one replaced, and says when it fails', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        let finish: (tile: NavMeshTile | undefined) => void = () => undefined;
        let cancelled: () => boolean = () => false;
        let progress: (done: number, total: number) => void = () => undefined;
        rebuild.rebuildNavMeshTile.mockImplementationOnce((_r, _g, _t, _c, onProgress, isCancelled: () => boolean) => {
          cancelled = isCancelled;
          progress = onProgress;
          return new Promise((resolve) => (finish = resolve));
        });
        const { host, fixture, update } = await pickSetup();
        await update(() => host.rebuild.set(request()));
        await settle(fixture);
        expect(cancelled()).toBe(false);
        rebuild.collectTileGeometry.mockRejectedValueOnce(new Error('no ADT'));
        await update(() => host.rebuild.set(request()));
        await settle(fixture);
        expect(cancelled()).toBe(true);
        progress(2, 4);
        finish(built);
        await settle(fixture);
        expect(host.rebuilds.map((state) => state.status)).toEqual(['reading', 'reading', 'failed']);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('no ADT'));
      });
    });

    it('draws links and names the hovered marker', async () => {
      const { page, host, fixture, update } = await pickSetup();
      await settle(fixture);
      const focus = at(800, -800);
      await update(() => {
        host.focus.set(focus);
        // the diamond stands 2.4 yards above its position: right on the focus
        host.markers.set([
          { key: 'graveyard:1', label: 'Graveyard: Goldshire', color: 0xffffff, position: { ...focus, z: focus.z - 2.4 } },
        ]);
        host.links.set([{ key: 'link:1', from: focus, to: at(810, -800), color: 0xff0000, arrow: true }]);
      });
      page.pointer('pointermove', 50, 50);
      flushFrames();
      fixture.detectChanges();
      expect(page.label().nativeElement.textContent?.trim()).toBe('Graveyard: Goldshire');
      await update(() => host.markers.set([]));
      page.pointer('pointermove', 50, 50);
      flushFrames();
      fixture.detectChanges();
      expect(page.label(false)).toBeFalsy();
    });

    it('names a hovered flight path arrow with its way, and offers a menu for it', async () => {
      const { page, host, fixture, update } = await pickSetup();
      await settle(fixture);
      const focus = at(800, -800);
      await update(() => {
        host.focus.set(focus);
        // the arrow of the stretch sits in its middle, right on the focus
        host.links.set([
          {
            key: 'flight:1',
            label: 'Flight path 1',
            from: at(790, -800, GROUND - 0.4),
            via: [],
            to: at(810, -800, GROUND - 0.4),
            color: 0xf0c419,
          },
        ]);
      });
      page.pointer('pointermove', 50, 50);
      flushFrames();
      fixture.detectChanges();
      expect(page.label().nativeElement.textContent?.trim()).toBe('Flight path 1\n→ N (0.00)');
      page.pointer('pointerdown', 50, 50, 2);
      page.pointer('pointerup', 50, 50, 2);
      expect(host.contexts.at(-1)).toEqual(expect.objectContaining({ key: 'flight:1', label: 'Flight path 1\n→ N (0.00)' }));
    });

    it('names the hovered boss boundary', async () => {
      const { page, host, fixture, update } = await pickSetup();
      await settle(fixture);
      const focus = at(800, 800);
      await update(() => {
        host.focus.set(focus);
        host.boundaries.set([
          {
            key: 'boundary:1',
            label: 'Patchwerk',
            color: 0xff00ff,
            z: GROUND - 0.3,
            shapes: [{ type: 'circle', center: { x: focus.x, y: focus.y }, radius: 30, inverted: false }],
          },
        ]);
      });
      page.pointer('pointermove', 50, 50);
      flushFrames();
      fixture.detectChanges();
      expect(page.label().nativeElement.textContent?.trim()).toBe('Patchwerk');
    });

    it('names the hovered area trigger', async () => {
      const { page, host, fixture, update } = await pickSetup();
      await settle(fixture);
      const focus = at(800, 800);
      await update(() => {
        host.focus.set(focus);
        host.triggers.set([{ key: 'areatrigger:45', label: 'Area trigger 45 · teleport', position: focus, radius: 5 }]);
      });
      page.pointer('pointermove', 50, 50);
      flushFrames();
      fixture.detectChanges();
      expect(page.label().nativeElement.textContent?.trim()).toBe('Area trigger 45 · teleport');
      // a trigger removed meanwhile has no label
      await update(() => host.triggers.set([]));
      page.pointer('pointermove', 50, 50);
      flushFrames();
      fixture.detectChanges();
      expect(page.label(false)).toBeFalsy();
    });

    it('names the path, its points and who walks it when hovering a direction arrow', async () => {
      const { page, host, fixture, update } = await pickSetup();
      // the camera looks at the focus: the arrow (drawn 0.4 above the points) sits right on it
      const focus = at(500, 500);
      const path = (owners?: string[]): WaypointPath => ({
        key: 'path:2',
        label: 'Path 2',
        owners,
        points: [
          { point: 4, position: at(500, 400, GROUND - 0.4) },
          { point: 5, position: at(500, 600, GROUND - 0.4) },
        ],
      });
      await update(() => {
        host.paths.set([path(['Guard (7)'])]);
        host.focus.set(focus);
      });
      await settle(fixture);
      page.pointer('pointermove', 50, 50);
      flushFrames();
      fixture.detectChanges();
      expect(page.label().nativeElement.textContent?.trim()).toBe(
        'Path 2 · #4 (on the ground) → #5 (on the ground) - Guard (7)\n→ W (1.57), 200.0 yd',
      );

      await update(() => host.paths.set([path()]));
      page.pointer('pointermove', 50, 50);
      flushFrames();
      fixture.detectChanges();
      expect(page.label().nativeElement.textContent?.trim()).toBe('Path 2 · #4 (on the ground) → #5 (on the ground)\n→ W (1.57), 200.0 yd');

      // right-clicking an arrow: a menu for that stretch
      page.pointer('pointerdown', 50, 50, 2);
      page.pointer('pointerup', 50, 50, 2);
      expect(host.contexts.at(-1)).toEqual(expect.objectContaining({ key: 'path:2:4-5' }));

      // clicking an arrow selects nothing
      page.pointer('pointerdown', 50, 50);
      page.pointer('pointerup', 50, 50);
      expect(host.picks.at(-1)?.type).not.toBe('segment');
    });
  });

  it('reports the camera centre after it moved far enough', async () => {
    const { host, mapControls } = await setup();
    const count = host.centers.length;
    mapControls().target.set(10, 0, 10);
    mapControls().dispatchEvent({ type: 'change' });
    expect(host.centers.length).toBe(count);

    const target = worldToScene(at(0, 0));
    mapControls().target.set(target.x, target.y, target.z);
    mapControls().dispatchEvent({ type: 'change' });
    expect(host.centers.length).toBe(count + 1);
    expect(host.centers.at(-1)?.x).toBeCloseTo(CENTER.x);
  });

  describe('compressed textures', () => {
    it('takes DXT textures as they are when the graphics card can', async () => {
      const extensions = { has: vi.fn().mockReturnValue(true) };
      Object.assign(renderer, { extensions });
      try {
        client.getGpuTexture.mockResolvedValue(undefined);
        client.getTerrainDetail.mockImplementation(() =>
          Promise.resolve({ ...flatDetail(GROUND), chunks: [{ ...flatDetail(GROUND).chunks[0], textures: ['grass.blp'] }] }),
        );
        const { fixture } = await setup((h) => {
          h.map.set('Azeroth');
          h.focus.set(at(0, 0));
        });
        for (let i = 0; i < 6; i++) {
          await settle(fixture);
          flushFrames();
        }
        expect(extensions.has).toHaveBeenCalledWith('WEBGL_compressed_texture_s3tc_srgb');
        expect(client.getGpuTexture).toHaveBeenCalledWith('grass.blp');
        expect(client.getTexture).not.toHaveBeenCalledWith('grass.blp');
      } finally {
        delete (renderer as { extensions?: unknown }).extensions;
      }
    });
  });

  describe('reading ahead', () => {
    it('reads the tiles beyond those drawn: terrain, textures, buildings and models', async () => {
      client.getMapTiles.mockResolvedValue([
        { tx: 32, ty: 48 },
        { tx: 34, ty: 48 },
      ]);
      client.getTilePlacements.mockImplementation((_d: string, tile: { tx: number }) =>
        Promise.resolve(tile.tx === 34 ? { wmos: [{ path: 'Far.wmo' }], doodads: [{ path: 'Far\\Tree.mdx' }] } : { wmos: [], doodads: [] }),
      );
      client.getWmo.mockRejectedValue(new Error('broken'));
      client.getTerrainDetail.mockImplementation((_d: string, tile: { tx: number }) =>
        Promise.resolve(
          tile.tx === 34
            ? { ...flatDetail(GROUND), chunks: [{ ...flatDetail(GROUND).chunks[0], textures: ['far.blp'] }] }
            : flatDetail(GROUND),
        ),
      );
      const { fixture } = await setup((h) => {
        h.map.set('Azeroth');
        h.focus.set(at(0, 0));
      });
      for (let i = 0; i < 6; i++) {
        await settle(fixture);
        flushFrames();
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
      await settle(fixture);
      expect(client.getTerrainDetail).toHaveBeenCalledWith('Azeroth', { tx: 34, ty: 48 });
      expect(client.getTexture).toHaveBeenCalledWith('far.blp');
      expect(client.getWmo).toHaveBeenCalledWith('Far.wmo');
      expect(client.getM2).toHaveBeenCalledWith('Far\\Tree.mdx');
    });
  });

  describe('Path / LOS handles, resolution and marker model', () => {
    it('labels A and C, drags them along the ground and reports where they were dropped', async () => {
      const { page, host, fixture, update } = await setup((h) => {
        h.map.set('Azeroth');
        h.focus.set(at(0, 0));
      });
      client.getNavMeshTile.mockResolvedValue(undefined);
      // C far behind the camera: no label for it
      await update(() => host.probe.set({ from: at(0, 0), to: at(-200, 200), range: 30, height: 2 }));
      await settle(fixture);
      flushFrames();
      fixture.detectChanges();
      expect(page.getDebugElementByTestId('world-viewer-probe-from').nativeElement.textContent?.trim()).toBe('WORLD_EDITOR.PROBE_START');
      expect(page.getDebugElementByTestId('world-viewer-probe-to', false)).toBeFalsy();

      // pressing next to the handles, or with another button, drags nothing
      page.pointer('pointerdown', 2, 2);
      page.pointer('pointerup', 2, 2);
      page.pointer('pointerdown', 50, 50, 2);
      page.pointer('pointerup', 50, 50, 2);
      expect(host.probeMoves).toEqual([]);
      page.pointer('pointerdown', 50, 50);
      page.pointer('pointermove', 60, 60);
      // off the ground: it stays where it was
      vi.spyOn(WorldScene.prototype, 'pick').mockReturnValueOnce(undefined);
      page.pointer('pointermove', 70, 70);
      page.pointer('pointerup', 60, 60);
      expect(host.probeMoves).toEqual([{ which: 'from', position: expect.objectContaining({ z: expect.any(Number) }) }]);
      expect(host.probeMoves[0].position.x).not.toBeCloseTo(CENTER.x, 1);
      // only the click next to the handles picked something; the drag didn't
      expect(host.picks).toHaveLength(1);

      await update(() => host.probe.set(undefined));
      flushFrames();
      fixture.detectChanges();
      expect(page.getDebugElementByTestId('world-viewer-probe-from', false)).toBeFalsy();
    });

    it('draws a share of the resolution', async () => {
      const { host, update } = await setup();
      renderer.setPixelRatio.mockClear();
      await update(() => host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, renderScale: 0.5 }));
      expect(renderer.setPixelRatio).toHaveBeenCalledWith(window.devicePixelRatio * 0.5);
      await update(() => host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, renderScale: 0.5, showRoofs: false }));
      expect(renderer.setPixelRatio).toHaveBeenCalledTimes(1);
    });

    it('puts a player character on the marker, or the beam alone', async () => {
      const beacon = vi.spyOn(WorldScene.prototype, 'setBeaconModel');
      client.getPlayerDisplay.mockImplementation((race: number) =>
        Promise.resolve(race === 1 ? { model: 'Character\\Human\\Male\\HumanMale.m2', scale: 1, textures: {}, hairGeoset: 1 } : undefined),
      );
      client.getM2.mockResolvedValue({
        positions: new Float32Array(9),
        normals: new Float32Array(9),
        uvs: new Float32Array(6),
        indices: new Uint16Array([0, 1, 2]),
        batches: [{ start: 0, count: 3, textureType: 1, blend: M2Blend.Opaque, geoset: 0, twoSided: false, unlit: false }],
        collision: EMPTY_COLLISION,
      });
      const { host, fixture, update } = await setup();
      const marker = async (markerModel: string) => {
        await update(() => host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, markerModel }));
        await settle(fixture);
      };
      await marker('1:0');
      expect(client.getPlayerDisplay).toHaveBeenCalledWith(1, 0);
      expect(beacon.mock.lastCall?.[0]).toBeInstanceOf(Object3D);
      // not a playable race, or unreadable: the beam alone
      await marker('9:0');
      expect(beacon).toHaveBeenLastCalledWith(undefined);
      client.getPlayerDisplay.mockRejectedValueOnce(new Error('broken'));
      await marker('2:1');
      expect(beacon).toHaveBeenLastCalledWith(undefined);
      // changed again while loading: only the last choice is shown
      beacon.mockClear();
      host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, markerModel: '1:1' });
      fixture.detectChanges();
      await marker('');
      expect(beacon.mock.calls).toEqual([[undefined]]);
    });
  });

  describe('gizmo', () => {
    const gizmoSetup = () =>
      setup((h) => {
        h.map.set('Azeroth');
        h.focus.set(at(0, 0));
        h.spawns.set([spawn('creature:1', at(0, 0, 80)), spawn('creature:2', at(5000, 5000, 80))]);
        h.paths.set([{ key: 'path:1', label: 'Path 1', points: [{ point: 1, position: at(10, 0, 90) }] }]);
      });

    it('attaches to the editable object, translating or rotating', async () => {
      const { host, gizmo, update } = await gizmoSetup();
      expect(gizmo().object).toBeUndefined();

      await update(() => host.editable.set('creature:1'));
      expect(gizmo().object?.name).toBe('creature:1');
      expect(gizmo().mode).toBe('translate');
      expect(gizmo().showX).toBe(true);

      await update(() => host.mode.set('rotate'));
      expect(gizmo().mode).toBe('rotate');
      expect(gizmo().showX).toBe(false);
      expect(gizmo().showZ).toBe(false);

      await update(() => host.editable.set('path:1#1'));
      expect(gizmo().mode).toBe('translate');

      await update(() => host.editable.set('missing'));
      expect(gizmo().object).toBeUndefined();
    });

    it('re-attaches after the spawns were reloaded', async () => {
      const { host, gizmo, update } = await gizmoSetup();
      await update(() => host.editable.set('creature:1'));
      const before = gizmo().object;
      await update(() => host.spawns.set([spawn('creature:1', at(1, 1, 80))]));
      expect(gizmo().object).not.toBe(before);
      expect(gizmo().object?.name).toBe('creature:1');
    });

    it('snaps moved objects to the ground and reports the new placement when the drag ends', async () => {
      const { host, gizmo, mapControls, fixture, update } = await gizmoSetup();
      await settle(fixture);
      await update(() => host.editable.set('creature:1'));

      gizmo().dispatchEvent({ type: 'dragging-changed', value: true });
      expect(mapControls().enabled).toBe(false);
      gizmo().object?.position.setX(gizmo().object!.position.x + 3);
      gizmo().dispatchEvent({ type: 'objectChange' });
      gizmo().dispatchEvent({ type: 'dragging-changed', value: false });

      expect(mapControls().enabled).toBe(true);
      expect(host.moves).toEqual([
        { key: 'creature:1', position: expect.objectContaining({ z: expect.closeTo(GROUND, 3) }), orientation: 0 },
      ]);
      expect(host.moves[0].position.y).toBeCloseTo(CENTER.y - 3);

      // onto the water where there is some, onto the ground elsewhere
      await update(() => {
        host.snap.set(false);
        host.water.set(true);
      });
      const liquid = vi.spyOn(WorldScene.prototype, 'liquidAt').mockReturnValue({ z: GROUND + 5, kind: 'water', type: 1 });
      const drag = () => {
        gizmo().dispatchEvent({ type: 'dragging-changed', value: true });
        gizmo().object?.position.setX(gizmo().object!.position.x + 1);
        gizmo().dispatchEvent({ type: 'objectChange' });
        gizmo().dispatchEvent({ type: 'dragging-changed', value: false });
      };
      drag();
      expect(host.moves.at(-1)?.position.z).toBeCloseTo(GROUND + 5, 3);
      liquid.mockReturnValue(undefined);
      drag();
      expect(host.moves.at(-1)?.position.z).toBeCloseTo(GROUND, 3);
      liquid.mockRestore();
    });

    it('puts the editable object under the cursor with Alt+click, and drags it while held', async () => {
      const { page, host, mapControls, fixture, update } = await setup((h) => {
        h.map.set('Azeroth');
        h.spawns.set([spawn('creature:7', at(0, 0), 'Deputy Willem')]);
        h.paths.set([{ key: 'path:1', label: 'Path 1', points: [{ point: 3, position: at(300, 300) }] }]);
        h.focus.set(at(0, 0));
      });
      await settle(fixture);
      await update(() => host.focus.set(at(-100, -100)));
      await settle(fixture);
      // without an editable object, Alt+click is a normal click
      page.pointer('pointerdown', 50, 50, 0, true);
      page.pointer('pointerup', 50, 50, 0, true);
      expect(host.picks).toHaveLength(1);

      await update(() => host.editable.set('creature:7'));
      page.pointer('pointerdown', 50, 50, 0, true);
      expect(mapControls().enabled).toBe(false);
      page.pointer('pointermove', 70, 30, 0, true);
      // where nothing can be picked (here: a view without size) it doesn't move
      vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockReturnValueOnce(new DOMRect(0, 0, 0, 0));
      page.pointer('pointermove', 10, 10, 0, true);
      page.pointer('pointermove', 50, 50, 0, true);
      page.pointer('pointerup', 50, 50, 0, true);
      expect(mapControls().enabled).toBe(true);
      expect(host.picks).toHaveLength(1);
      expect(host.moves).toEqual([
        { key: 'creature:7', position: expect.objectContaining({ z: expect.closeTo(GROUND, 3) }), orientation: 0 },
      ]);
      expect(host.moves[0].position.x).toBeCloseTo(CENTER.x - 100, 0);

      // a right-button Alt+click doesn't move it; neither does a waypoint go under the ground
      page.pointer('pointerdown', 50, 50, 2, true);
      page.pointer('pointerup', 50, 50, 2, true);
      expect(host.moves).toHaveLength(1);
      await update(() => host.editable.set('path:1#3'));
      page.pointer('pointerdown', 50, 50, 0, true);
      page.pointer('pointerup', 50, 50, 0, true);
      expect(host.moves[1].position.z).toBeCloseTo(GROUND, 3);
      await update(() => host.editable.set('creature:404'));
      page.pointer('pointerdown', 50, 50, 0, true);
      page.pointer('pointerup', 50, 50, 0, true);
      expect(host.moves).toHaveLength(2);
      // the object vanishing during a drag (spawns reloaded) ends it quietly
      await update(() => host.editable.set('creature:7'));
      page.pointer('pointerdown', 50, 50, 0, true);
      await update(() => host.spawns.set([]));
      page.pointer('pointerup', 50, 50, 0, true);
      expect(host.moves).toHaveLength(2);
      expect(mapControls().enabled).toBe(true);
    });

    it('puts the marker under the crosshair with Space, and brings the camera back to it with Home', async () => {
      vi.spyOn(performance, 'now').mockReturnValue(0);
      const { page, host, fixture, update } = await setup((h) => {
        h.map.set('Azeroth');
        h.focus.set(at(0, 0));
      });
      await settle(fixture);
      await update(() => host.focus.set(at(-100, -100)));
      await settle(fixture);
      const canvas = page.canvas().nativeElement;
      const key = (type: 'keydown' | 'keyup', code: string): KeyboardEvent => {
        const event = new KeyboardEvent(type, { code, cancelable: true });
        canvas.dispatchEvent(event);
        return event;
      };
      const frameAt = (time: number): void => {
        for (let i = 0; i < 2; i++) {
          const pending = frames;
          frames = [];
          pending.forEach((frame) => frame(time));
        }
        fixture.detectChanges();
      };
      const target = () => page.target().nativeElement.textContent?.trim();
      frameAt(0);
      const start = target();
      expect(key('keydown', 'Space').defaultPrevented).toBe(true);
      // walk away, then Home comes back to the marker
      key('keydown', 'KeyW');
      frameAt(100);
      key('keyup', 'KeyW');
      frameAt(200);
      expect(target()).not.toBe(start);
      expect(key('keydown', 'Home').defaultPrevented).toBe(true);
      frameAt(300);
      expect(target()).toBe(start);
      // nothing under the crosshair (a view without size): the marker stays
      key('keydown', 'KeyW');
      frameAt(400);
      key('keyup', 'KeyW');
      frameAt(500);
      const moved = target();
      vi.spyOn(WorldScene.prototype, 'pick').mockReturnValueOnce(undefined);
      key('keydown', 'Space');
      key('keydown', 'Home');
      frameAt(600);
      expect(target()).toBe(start);
      expect(moved).not.toBe(start);
      // on a liquid: Shift + Space (or always, when the marker stands on liquids)
      const beacon = vi.spyOn(WorldScene.prototype, 'setBeacon');
      const liquidAt = vi.spyOn(WorldScene.prototype, 'liquidAt').mockReturnValue({ z: 10_000, kind: 'water', type: 1 });
      canvas.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', shiftKey: true, cancelable: true }));
      expect(beacon.mock.calls.at(-1)?.[0].z).toBe(10_000);
      key('keydown', 'Space');
      expect(beacon.mock.calls.at(-1)?.[0].z).not.toBe(10_000);
      await update(() => host.render.set({ ...DEFAULT_WORLD_RENDER_SETTINGS, markerOnLiquid: true }));
      key('keydown', 'Space');
      expect(beacon.mock.calls.at(-1)?.[0].z).toBe(10_000);
      // no liquid there
      liquidAt.mockReturnValue(undefined);
      key('keydown', 'Space');
      expect(beacon.mock.calls.at(-1)?.[0].z).not.toBe(10_000);
      liquidAt.mockRestore();
      // turned to face a place: the editor's menu, or Alt + right-click (no menu then)
      host.lookAt.set(at(0, 1_000_000));
      fixture.detectChanges();
      expect(beacon.mock.calls.at(-1)?.[1]).toBeCloseTo(Math.PI / 2, 1);
      const contexts = host.contexts.length;
      page.pointer('pointerdown', 50, 50, 2, true);
      page.pointer('pointerup', 50, 50, 2, true);
      expect(host.contexts).toHaveLength(contexts);
      expect(beacon.mock.calls.at(-1)?.[1]).not.toBeCloseTo(Math.PI / 2, 1);
      vi.spyOn(WorldScene.prototype, 'pick').mockReturnValueOnce(undefined);
      const turns = beacon.mock.calls.length;
      page.pointer('pointerdown', 50, 50, 2, true);
      page.pointer('pointerup', 50, 50, 2, true);
      expect(beacon.mock.calls).toHaveLength(turns);
      beacon.mockRestore();
    });

    it('takes the marker and camera moves from a gamepad and from mouse buttons bound to them', async () => {
      const { page, host, fixture, update } = await setup((h) => {
        h.map.set('Azeroth');
        h.focus.set(at(0, 0));
      });
      await settle(fixture);
      await update(() => host.focus.set(at(-100, -100)));
      await settle(fixture);
      flushFrames();
      const beacon = vi.spyOn(WorldScene.prototype, 'setBeacon');
      const pad = (TestBed.inject(GamepadInputService) as unknown as { changes: Subject<PadInput> }).changes;
      pad.next({ input: 'PadA', pressed: true, type: 'paddown' });
      expect(beacon).toHaveBeenCalled();
      const target = () => page.target().nativeElement.textContent?.trim();
      const start = target();
      pad.next({ input: 'PadLeftStickUp', pressed: true, type: 'paddown' });
      for (const time of [0, 100, 200]) {
        frames.splice(0).forEach((frame) => frame(time));
      }
      pad.next({ input: 'PadLeftStickUp', pressed: false, type: 'padup' });
      fixture.detectChanges();
      expect(target()).not.toBe(start);
      // the right stick turns the camera around what it looks at
      const camera = (renderer.render.mock.calls.at(-1)?.[1] as { position: Vector3 }).position;
      const before = camera.clone();
      for (const [input, time] of [
        ['PadRightStickLeft', 300],
        ['PadRightStickUp', 400],
      ] as const) {
        pad.next({ input, pressed: true, type: 'paddown' });
        frames.splice(0).forEach((frame) => frame(time));
        frames.splice(0).forEach((frame) => frame(time + 100));
        pad.next({ input, pressed: false, type: 'padup' });
      }
      fixture.detectChanges();
      expect(camera.equals(before)).toBe(false);
      // the bumpers zoom (in, then out faster with the left stick pressed in)
      const zoomed = (input: string, time: number): boolean => {
        const from = camera.clone();
        pad.next({ input, pressed: true, type: 'paddown' });
        frames.splice(0).forEach((frame) => frame(time));
        frames.splice(0).forEach((frame) => frame(time + 100));
        pad.next({ input, pressed: false, type: 'padup' });
        return !camera.equals(from);
      };
      expect(zoomed('PadRB', 500)).toBe(true);
      pad.next({ input: 'PadLeftStickPress', pressed: true, type: 'paddown' });
      expect(zoomed('PadLB', 700)).toBe(true);
      pad.next({ input: 'PadLeftStickPress', pressed: false, type: 'padup' });
      // Mouse 4 bound to Home (the camera back to the marker)
      await update(() =>
        host.navigation.set({
          ...DEFAULT_WORLD_CONTROLS_SETTINGS,
          bindings: { ...DEFAULT_WORLD_CONTROLS_SETTINGS.bindings, cameraToMarker: ['Mouse4'] },
        }),
      );
      page.pointer('pointerdown', 50, 50, 3);
      page.pointer('pointerup', 50, 50, 3);
      flushFrames();
      fixture.detectChanges();
      expect(target()).toBe(start);
      // a wheel step bound to the marker (and one bound to nothing)
      await update(() =>
        host.navigation.set({
          ...DEFAULT_WORLD_CONTROLS_SETTINGS,
          bindings: { ...DEFAULT_WORLD_CONTROLS_SETTINGS.bindings, markerToCursor: ['WheelDown'] },
        }),
      );
      beacon.mockClear();
      const viewer = page.getDebugElementByTestId('world-viewer').nativeElement as HTMLElement;
      const wheel = new WheelEvent('wheel', { deltaY: 1, cancelable: true });
      viewer.dispatchEvent(wheel);
      expect(beacon).toHaveBeenCalled();
      expect(wheel.defaultPrevented).toBe(true);
      viewer.dispatchEvent(new WheelEvent('wheel', { deltaY: -1, cancelable: true }));
      expect(beacon).toHaveBeenCalledTimes(1);
      beacon.mockRestore();
    });

    it('shows which snapping is on above the crosshair', async () => {
      const { page, host, update } = await setup();
      const text = () => page.getDebugElementByTestId('world-viewer-snap').nativeElement.textContent.replace(/\s+/g, ' ').trim();
      expect(text()).toBe('WORLD_EDITOR.SNAP_TO: WORLD_EDITOR.SNAP_GROUND');
      await update(() => {
        host.snap.set(false);
        host.wall.set(true);
      });
      expect(text()).toBe('WORLD_EDITOR.SNAP_TO: WORLD_EDITOR.SNAP_WALL');
      await update(() => {
        host.wall.set(false);
        host.water.set(true);
      });
      expect(text()).toBe('WORLD_EDITOR.SNAP_TO: WORLD_EDITOR.SNAP_WATER');
      await update(() => host.water.set(false));
      expect(page.getDebugElementByTestId('world-viewer-snap', false)).toBeFalsy();
    });

    it('has no marker to go to before the view was sent anywhere', async () => {
      const { page, fixture } = await setup();
      await settle(fixture);
      flushFrames();
      fixture.detectChanges();
      const before = page.target().nativeElement.textContent;
      page.canvas().nativeElement.dispatchEvent(new KeyboardEvent('keydown', { code: 'Home' }));
      flushFrames();
      fixture.detectChanges();
      expect(page.target().nativeElement.textContent).toBe(before);
    });

    it('snaps moved objects against the nearest wall, facing away from it', async () => {
      // a building made of one wall, 3 yards east of the creature, facing west
      const east = CENTER.y - 3;
      client.getTilePlacements.mockResolvedValue({
        wmos: [{ uniqueId: 1, path: 'wall.wmo', position: [CENTER.x, east, GROUND], rotation: [0, 0, 0, 1], scale: 1 }],
        doodads: [],
      });
      client.getWmo.mockResolvedValue({
        materials: [],
        groups: [
          {
            // a quad in the server plane y = 0 (scene x = 0), normal towards +y (west), 200 yards tall
            positions: new Float32Array([0, -100, -10, 0, 100, -10, 0, -100, 10, 0, 100, 10]),
            normals: new Float32Array([-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0]),
            uvs: new Float32Array(8),
            indices: new Uint16Array([0, 1, 2, 2, 1, 3, 0, 2, 1, 2, 3, 1]),
            batches: [{ start: 0, count: 12, material: 0 }],
            indoor: false,
          },
        ],
      });
      const { host, gizmo, fixture, update } = await gizmoSetup();
      for (let i = 0; i < 4; i++) {
        await settle(fixture);
      }
      await update(() => {
        host.wall.set(true);
        host.editable.set('creature:1');
      });
      gizmo().dispatchEvent({ type: 'dragging-changed', value: true });
      gizmo().dispatchEvent({ type: 'objectChange' });
      gizmo().dispatchEvent({ type: 'dragging-changed', value: false });
      expect(host.moves[0].position.y).toBeCloseTo(east + 0.1, 1);
      // facing away from the wall: west (+y), orientation π/2
      expect(host.moves[0].orientation).toBeCloseTo(Math.PI / 2, 2);

      // far from any wall it stays where it was
      gizmo().object?.position.setX(gizmo().object!.position.x + 50);
      gizmo().dispatchEvent({ type: 'objectChange' });
      gizmo().dispatchEvent({ type: 'dragging-changed', value: false });
      expect(host.moves[1].position.y).toBeCloseTo(east + 0.1 - 50, 0);
      // waypoints snap without turning
      await update(() => host.editable.set('path:1#1'));
      gizmo().object?.position.set(worldToScene(at(0, 0)).x, worldToScene(at(0, 0)).y, worldToScene(at(0, 0)).z);
      gizmo().dispatchEvent({ type: 'objectChange' });
      gizmo().dispatchEvent({ type: 'dragging-changed', value: false });
      expect(host.moves[2].position.y).toBeCloseTo(east + 0.1, 1);
    });

    it('moves waypoints with their path line, and keeps the height without snapping or ground', async () => {
      const { host, gizmo, fixture, update } = await gizmoSetup();
      await settle(fixture);
      await update(() => host.editable.set('path:1#1'));
      gizmo().dispatchEvent({ type: 'objectChange' });
      gizmo().dispatchEvent({ type: 'dragging-changed', value: false });
      expect(host.moves[0].position.z).toBeCloseTo(GROUND);

      await update(() => {
        host.snap.set(false);
        host.editable.set('creature:1');
      });
      gizmo().dispatchEvent({ type: 'objectChange' });
      gizmo().dispatchEvent({ type: 'dragging-changed', value: false });
      expect(host.moves[1].position.z).toBeCloseTo(80);

      await update(() => {
        host.snap.set(true);
        host.editable.set('creature:2');
      });
      gizmo().dispatchEvent({ type: 'objectChange' });
      gizmo().dispatchEvent({ type: 'dragging-changed', value: false });
      expect(host.moves[2].position.z).toBeCloseTo(80);
    });

    it('does not snap while rotating, and reports nothing without an editable object', async () => {
      const { host, gizmo, fixture, update } = await gizmoSetup();
      await settle(fixture);
      await update(() => {
        host.mode.set('rotate');
        host.editable.set('creature:1');
      });
      gizmo().object?.rotation.set(0, 1.25, 0);
      gizmo().dispatchEvent({ type: 'objectChange' });
      gizmo().dispatchEvent({ type: 'dragging-changed', value: false });
      expect(host.moves[0]).toEqual({
        key: 'creature:1',
        position: expect.objectContaining({ z: expect.closeTo(80, 3) }),
        orientation: 1.25,
      });

      await update(() => host.editable.set(undefined));
      gizmo().dispatchEvent({ type: 'objectChange' });
      gizmo().dispatchEvent({ type: 'dragging-changed', value: false });
      expect(host.moves.length).toBe(1);
    });

    it('ignores clicks while dragging', async () => {
      const { page, host, gizmo, fixture } = await gizmoSetup();
      await settle(fixture);
      gizmo().dragging = true;
      page.click();
      page.pointer('pointermove', 50, 50);
      expect(host.picks).toEqual([]);
    });
  });

  it('follows the size of its container and cleans up on destroy', async () => {
    let onResize: () => void = () => undefined;
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          onResize = callback;
        }
        observe = vi.fn();
        disconnect = disconnect;
      },
    );
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600);
    const { fixture, mapControls } = await setup();

    onResize();
    expect(renderer.setSize).toHaveBeenLastCalledWith(800, 600, false);

    fixture.destroy();
    expect(disconnect).toHaveBeenCalled();
    expect(renderer.dispose).toHaveBeenCalled();
    expect(mapControls().disposed).toBe(true);
  });
});
