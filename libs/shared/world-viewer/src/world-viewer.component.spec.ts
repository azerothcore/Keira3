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
import { GizmoMode, ObjectMoved, PickResult, WaypointPath, WorldSpawn } from './world-viewer.model';
import { flatDetail, flatTile } from './world-viewer.mock';

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
      [groundOnly]="groundOnly()"
      [renderSettings]="render()"
      [focus]="focus()"
      [region]="region()"
      [navigation]="navigation()"
      (picked)="picks.push($event)"
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
  readonly groundOnly = signal(false);
  readonly render = signal<WorldRenderSettings>(DEFAULT_WORLD_RENDER_SETTINGS);
  readonly focus = signal<WorldPosition | undefined>(undefined);
  readonly region = signal<WorldBounds | undefined>(undefined);
  readonly navigation = signal<WorldControlsSettings>(DEFAULT_WORLD_CONTROLS_SETTINGS);
  readonly picks: PickResult[] = [];
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

  pointer(type: string, x: number, y: number, button = 0): void {
    const event = new MouseEvent(type, { clientX: x, clientY: y, button, bubbles: true });
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
