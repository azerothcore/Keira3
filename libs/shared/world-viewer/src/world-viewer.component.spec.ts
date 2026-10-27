import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { tileCenter, WowClientService, WorldBounds, WorldPosition, worldToScene } from '@keira/shared/wow-data';
import { DebugHtmlElement, PageObjectModel } from 'ngx-page-object-model';
import { EventDispatcher, Object3D, Vector3 } from 'three';
import { DEFAULT_WORLD_CONTROLS_SETTINGS, WorldControlsSettings } from './world-controls-settings';
import { DEFAULT_WORLD_RENDER_SETTINGS, WorldRenderSettings } from './world-render-settings';
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
} from './world-viewer.model';
import { flatDetail, flatTile } from './world-viewer.mock';
import { WorldScene } from './world-scene';
import { PathProbeRequest, PathProbeResult } from './path-probe';

// ------------------------------------------------------------------ Three.js controls fakes (jsdom has no WebGL)

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
      [groundOnly]="groundOnly()"
      [renderSettings]="render()"
      [focus]="focus()"
      [region]="region()"
      [navigation]="navigation()"
      [areaTriggers]="triggers()"
      [probe]="probe()"
      (probed)="probes.push($event)"
      (speedChanged)="speeds.push($event)"
      (navMeshTileChanged)="navMeshTiles.push($event)"
      (picked)="picks.push($event)"
      (contextRequested)="contexts.push($event)"
      (objectMoved)="moves.push($event)"
      (centerChanged)="centers.push($event)"
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
  readonly wall = signal(false);
  readonly groundOnly = signal(false);
  readonly render = signal<WorldRenderSettings>(DEFAULT_WORLD_RENDER_SETTINGS);
  readonly focus = signal<WorldPosition | undefined>(undefined);
  readonly region = signal<WorldBounds | undefined>(undefined);
  readonly navigation = signal<WorldControlsSettings>(DEFAULT_WORLD_CONTROLS_SETTINGS);
  readonly triggers = signal<WorldAreaTrigger[]>([]);
  readonly probe = signal<PathProbeRequest | undefined>(undefined);
  readonly probes: PathProbeResult[] = [];
  readonly speeds: number[] = [];
  readonly navMeshTiles: (NavMeshTileInfo | undefined)[] = [];
  readonly picks: PickResult[] = [];
  readonly contexts: ContextRequest[] = [];
  readonly moves: ObjectMoved[] = [];
  readonly centers: WorldPosition[] = [];
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

  pointer(type: string, x: number, y: number, button = 0, altKey = false): void {
    const event = new MouseEvent(type, { clientX: x, clientY: y, button, altKey, bubbles: true });
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
      batches: [],
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

  it('shows what is still loading, and where the camera looks', async () => {
    let finish: (value: unknown) => void = () => undefined;
    client.getTerrainDetail.mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const { page, fixture } = await setup((h) => {
      h.focus.set(at(0, 0));
      h.map.set('Azeroth');
    });
    await settle(fixture);
    vi.advanceTimersByTime(300);
    flushFrames();
    fixture.detectChanges();
    const text = page.activity().nativeElement.textContent?.replace(/\s+/g, ' ');
    expect(text).toContain('WORLD_EDITOR.TERRAIN 1');
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

    // up (E) changes the height; Shift goes faster; keys released stop the camera
    key('keyup', 'KeyW');
    key('keydown', 'KeyE', true);
    frameAt(200);
    expect(target()).not.toBe(moved);
    key('keyup', 'KeyE');
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

    it('reports clicks on spawns', async () => {
      const { page, host, fixture } = await pickSetup();
      await settle(fixture);
      page.click();
      expect(host.picks).toEqual([expect.objectContaining({ type: 'spawn', key: 'creature:7' })]);
    });

    it('asks for a context menu on right-clicks on spawns and waypoints, not on the ground or after rotating', async () => {
      const { page, host, fixture, update } = await pickSetup();
      await settle(fixture);
      page.pointer('pointerdown', 50, 50, 2);
      page.pointer('pointerup', 50, 50, 2);
      expect(host.contexts).toEqual([{ key: 'creature:7', x: 50, y: 50 }]);
      expect(host.picks).toEqual([]);
      // dragged with the right button: the view was rotated
      page.pointer('pointerdown', 50, 50, 2);
      page.pointer('pointerup', 80, 80, 2);
      await update(() => host.focus.set(at(300, 300)));
      page.pointer('pointerdown', 50, 50, 2);
      page.pointer('pointerup', 50, 50, 2);
      expect(host.contexts[1]).toEqual({ key: 'path:1#3', x: 50, y: 50 });
      await update(() => host.focus.set(at(-100, -100)));
      page.pointer('pointerdown', 50, 50, 2);
      page.pointer('pointerup', 50, 50, 2);
      // the middle button does nothing
      page.pointer('pointerdown', 50, 50, 1);
      page.pointer('pointerup', 50, 50, 1);
      expect(host.contexts).toHaveLength(2);
      expect(host.picks).toEqual([]);
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
      const label = () => page.label().nativeElement.textContent?.trim();
      page.pointer('pointermove', 50, 50);
      flushFrames();
      fixture.detectChanges();
      expect(label()).toBe('Deputy Willem\nPhase 2\nQuest 1 (A) +1 (Alt)');

      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }));
      // a second key event before the frame doesn't queue another update
      canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }));
      flushFrames();
      fixture.detectChanges();
      expect(label()).toBe('Deputy Willem\nPhase 2\nQuest 1 (A)\nQuest 2 (B)');
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
      expect(page.label().nativeElement.textContent?.trim()).toBe('Path 1 · #3 — Guard (7)');
      await update(() => host.paths.set([{ key: 'path:1', label: 'Path 1', points: [{ point: 3, position: at(300, 300) }] }]));
      hover(50, 50);
      expect(page.label().nativeElement.textContent?.trim()).toBe('Path 1 · #3');
      await update(() =>
        host.paths.set([{ key: 'path:1', label: 'Path 1', points: [{ point: 3, position: at(300, 300), info: ['wait 5 s', 'run'] }] }]),
      );
      hover(50, 50);
      expect(page.label().nativeElement.textContent?.trim()).toBe('Path 1 · #3 · wait 5 s · run');

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
      expect(page.getDebugElementByTestId('world-viewer-mmtile').nativeElement.textContent.trim()).toBe('mmtile 0004832.mmtile');
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
      expect(page.label().nativeElement.textContent?.trim()).toBe('Path 2 · #4 → #5 — Guard (7)');

      await update(() => host.paths.set([path()]));
      page.pointer('pointermove', 50, 50);
      flushFrames();
      fixture.detectChanges();
      expect(page.label().nativeElement.textContent?.trim()).toBe('Path 2 · #4 → #5');

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
    });

    it('shows which snapping is on above the crosshair', async () => {
      const { page, host, update } = await setup();
      expect(page.getDebugElementByTestId('world-viewer-snap').nativeElement.textContent.trim()).toBe(
        'WORLD_EDITOR.SNAP_TO: WORLD_EDITOR.SNAP_GROUND',
      );
      await update(() => {
        host.snap.set(false);
        host.wall.set(true);
      });
      expect(page.getDebugElementByTestId('world-viewer-snap').nativeElement.textContent.trim()).toBe(
        'WORLD_EDITOR.SNAP_TO: WORLD_EDITOR.SNAP_WALL',
      );
      await update(() => host.wall.set(false));
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
