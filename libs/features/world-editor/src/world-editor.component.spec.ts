import { Component, input, output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import {
  DEFAULT_WORLD_RENDER_SETTINGS,
  GizmoMode,
  ObjectMoved,
  PickResult,
  WaypointPath,
  WorldRenderSettings,
  WorldSpawn,
  WorldViewerComponent,
} from '@keira/shared/world-viewer';
import { tileCenter, WOW_DATA_SETTINGS_KEY, WowClientService, WorldPosition } from '@keira/shared/wow-data';
import { DebugHtmlElement, PageObjectModel, typeInElement } from 'ngx-page-object-model';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';
import { WorldEditorComponent } from './world-editor.component';
import { SpawnRecord, WaypointRecord } from './world-editor.model';
import { WorldEditorService } from './world-editor.service';

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
  readonly groundOnly = input<boolean>(false);
  readonly renderSettings = input<WorldRenderSettings>(DEFAULT_WORLD_RENDER_SETTINGS);
  readonly focus = input<WorldPosition | undefined>(undefined);
  readonly picked = output<PickResult>();
  readonly objectMoved = output<ObjectMoved>();
  readonly centerChanged = output<WorldPosition>();
}

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
  type(id: string, value: string): void {
    typeInElement(value, this.byId<HTMLInputElement>(id).nativeElement);
  }
  submit(id: string): void {
    const form = this.byId(id).nativeElement.closest('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
  }
  key(key: string, target: HTMLElement = this.fixture.nativeElement as HTMLElement): void {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
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
const SPAWNS = [
  spawn('creature', 1, { pathId: 10, name: 'Deputy Willem' }),
  spawn('creature', 2, { name: '' }),
  spawn('gameobject', 3, { name: 'Mailbox' }),
];
const WAYPOINTS: WaypointRecord[] = [
  { pathId: 10, point: 1, x: -8901, y: -101, z: 80, delay: 0 },
  { pathId: 10, point: 2, x: -8902, y: -102, z: 81, delay: 1000 },
];
const CENTER = { x: -8913, y: -137, z: 82 };

describe(WorldEditorComponent.name, () => {
  const mocks = {
    client: { isSupported: vi.fn(), getMaps: vi.fn(), getMapTiles: vi.fn(), close: vi.fn() },
    service: {
      loadSpawns: vi.fn(),
      loadWaypoints: vi.fn(),
      getMaxGuid: vi.fn(),
      getFreePathId: vi.fn(),
      getEntryName: vi.fn(),
      searchTele: vi.fn(),
      execute: vi.fn(),
    },
    toastr: { error: vi.fn(), warning: vi.fn(), success: vi.fn() },
    clipboard: { copyFromContent: vi.fn() },
  };

  const setup = async (opts: { params?: Record<string, string>; configured?: boolean } = {}) => {
    localStorage.clear();
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
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(opts.params ?? {}) } } },
      ],
    });
    TestBed.overrideComponent(WorldEditorComponent, {
      remove: { imports: [WorldViewerComponent] },
      add: { imports: [FakeWorldViewerComponent] },
    });
    const fixture = TestBed.createComponent(WorldEditorComponent);
    const page = new Page(fixture);
    await settle(page);
    return { page, fixture };
  };

  const settle = async (page: Page): Promise<void> => {
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

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.client.isSupported.mockReturnValue(true);
    mocks.client.getMaps.mockResolvedValue(MAPS);
    mocks.client.getMapTiles.mockResolvedValue([
      { tx: 31, ty: 48 },
      { tx: 32, ty: 48 },
    ]);
    mocks.client.close.mockResolvedValue(undefined);
    mocks.service.loadSpawns.mockResolvedValue(SPAWNS);
    mocks.service.loadWaypoints.mockResolvedValue(WAYPOINTS);
    mocks.service.getMaxGuid.mockResolvedValue(1000);
    mocks.service.getFreePathId.mockResolvedValue(20);
    mocks.service.getEntryName.mockResolvedValue('Marshal McBride');
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
      });
      expect(mocks.client.close).toHaveBeenCalled();
      expect(page.byId('settings', false)).toBeFalsy();
      expect(page.byId<HTMLSelectElement>('map-select').nativeElement.options.length).toBe(2);
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
      const radius = page.byId<HTMLSelectElement>('view-terrain-radius').nativeElement;
      radius.value = '2';
      radius.dispatchEvent(new Event('change'));
      page.fixture.detectChanges();

      expect(page.viewer().renderSettings()).toEqual({ ...DEFAULT_WORLD_RENDER_SETTINGS, lowDetailTerrain: true, terrainRadius: 2 });
      expect(radius.options[1].textContent?.trim()).toBe('25 WORLD_EDITOR.TILES');
      expect(JSON.parse(localStorage.getItem('keira3.worldEditor.render') as string).terrainRadius).toBe(2);
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

    it('falls back to the origin for maps missing from Map.dbc', async () => {
      const { page } = await setup({ params: { map: '999', x: 'abc', y: '2' } });
      expect(page.viewer().mapDirectory()).toBeUndefined();
      expect(page.viewer().focus()).toEqual({ x: 0, y: 0, z: 0 });
      expect(mocks.client.getMapTiles).not.toHaveBeenCalled();
    });

    it('switches maps', async () => {
      const { page } = await setup();
      const select = page.byId<HTMLSelectElement>('map-select').nativeElement;
      mocks.client.getMapTiles.mockResolvedValue([]);
      select.value = '1';
      select.dispatchEvent(new Event('change'));
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
      expect(page.byId('loading-spawns')).toBeTruthy();

      resolve(SPAWNS);
      await settle(page);
      expect(page.byId('loading-spawns', false)).toBeFalsy();
      expect(mocks.service.loadSpawns).toHaveBeenCalledWith(0, CENTER);
      expect(mocks.service.loadWaypoints).toHaveBeenCalledWith([10]);
      expect(
        page
          .viewer()
          .spawns()
          .map((s) => s.label),
      ).toEqual(['Deputy Willem · creature 1 · path 10', '102 · creature 2', 'Mailbox · gameobject 3']);
      expect(page.viewer().paths()).toEqual([
        {
          key: 'path:10',
          label: 'Path 10',
          owners: ['Deputy Willem (1)'],
          closed: true,
          points: [
            { point: 1, position: { x: -8901, y: -101, z: 80 }, delay: 0 },
            { point: 2, position: { x: -8902, y: -102, z: 81 }, delay: 1000 },
          ],
        },
      ]);
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

      page.viewer().picked.emit({ type: 'ground', position: { x: 0, y: 0, z: 0 } });
      await settle(page);
      expect(page.byId('nothing-selected')).toBeTruthy();
      expect(page.viewer().editableKey()).toBeUndefined();
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
      page.click('snap-toggle');
      page.fixture.detectChanges();
      expect(page.viewer().gizmoMode()).toBe('translate');
      expect(page.viewer().snapToGround()).toBe(false);
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
          .find((s) => s.key === 'creature:1002')?.pending,
      ).toBe(true);
      expect(page.text('selected-title')).toContain('creature 1002');

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
