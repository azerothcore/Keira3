import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { GameMapData, Ring, WorldBounds, WorldPosition, WowClientService, WowMap } from '@keira/shared/wow-data';
import { DebugHtmlElement, PageObjectModel } from 'ngx-page-object-model';
import { GameMapComponent } from './game-map.component';
import {
  GAME_MAP_LAYERS_KEY,
  GAME_MAP_MARKER_KEY,
  GameMapPoi,
  GameMapPortal,
  GameMapSpawnLevel,
  GameMapTeleport,
  GameMapTransport,
} from './game-map-pois';
import { WorldMapDot } from './world-map.component';

@Component({
  imports: [GameMapComponent],
  template: `
    <keira-game-map
      [mapId]="mapId()"
      [camera]="camera()"
      [zoneId]="zoneId()"
      [dots]="dots()"
      [pois]="pois()"
      [teleports]="teleports()"
      [portals]="portals()"
      [spawnLevels]="spawnLevels"
      [transports]="transports()"
      [maps]="maps()"
      (regionSelected)="regions.push($event)"
      (closed)="closes = closes + 1"
    />
  `,
})
class HostComponent {
  readonly mapId = signal<number | undefined>(0);
  readonly camera = signal<WorldPosition | undefined>({ x: -9000, y: -250, z: 55 });
  readonly zoneId = signal(12);
  readonly dots = signal<WorldMapDot[]>([
    { key: 'creature:1', position: { x: -9000, y: 0, z: 50 }, color: '#ff0', title: 'Hogger' },
    { key: 'creature:2', position: { x: 0, y: 0, z: 0 }, color: '#ff0' },
    { key: 'creature:3', position: { x: -9100, y: 0, z: 50 }, color: '#0ff' },
  ]);
  readonly pois = signal<GameMapPoi[]>([
    { kind: 'flight', mapId: 0, x: -9100, y: -300, z: 1, name: 'Thor', subname: 'Gryphon Master', faction: 11 },
    { kind: 'spirit', mapId: 0, x: -9200, y: -300, z: 1, name: 'Spirit Healer', faction: 12 },
    { kind: 'bank', mapId: 0, x: -9300, y: -300, z: 1, name: 'Banker', faction: 99 },
    { kind: 'flight', mapId: 530, x: 9000, y: -7000, z: 1, name: 'Eversong flight master' },
    { kind: 'inn', mapId: 530, x: 0, y: 0, z: 1, name: 'Outland innkeeper' },
    { kind: 'unknown', mapId: 0, x: -9300, y: -300, z: 1, name: 'Nobody' },
    { kind: 'boat', mapId: 0, x: -9300, y: -300, z: 1, name: 'A layer without an icon' },
    // on top of the first: shown as one
    { kind: 'flight', mapId: 0, x: -9101, y: -301, z: 1, name: 'Thor again', faction: 11 },
    { kind: 'flight', mapId: 0, x: -9102, y: -302, z: 1, name: 'Thor thrice', faction: 11 },
    // in Stormwind (on Elwynn's picture, but not in Elwynn)
    { kind: 'flight', mapId: 0, x: -8500, y: 1000, z: 1, name: 'Stormwind flight master', faction: 11 },
    // the server says in which zone these are
    { kind: 'spirit', mapId: 0, x: -9300, y: -400, z: 1, name: 'In Westfall', zoneId: 40 },
    { kind: 'spirit', mapId: 0, x: -9300, y: -500, z: 1, name: 'In Elwynn', zoneId: 12 },
    { kind: 'flight', mapId: 603, x: 0, y: 0, z: 1, name: 'Ulduar flight master' },
    { kind: 'stone', mapId: 0, x: -9300, y: -350, z: 1, name: 'Meeting Stone', faction: 11 },
  ]);
  readonly teleports = signal<GameMapTeleport[]>([
    { id: 100, name: 'Naxx', targetMap: 533, target: { x: 3000, y: -3000 } },
    { id: 101, name: 'Deadmines', targetMap: 36 },
    // (into the zone it is in: no way anywhere)
    { id: 102, name: 'Elsewhere', targetMap: 0, target: { x: -9000, y: 0 } },
    { id: 103, name: 'Naxx again (Leap of Faith)', targetMap: 533, target: { x: 3000, y: -3000 } },
    // a crossing to another zone
    { id: 104, name: 'To Eversong', targetMap: 530, target: { x: 9000, y: -7000 } },
  ]);
  readonly portals = signal<GameMapPortal[]>([
    { name: 'Portal to Eversong', mapId: 0, x: -9300, y: -400, targetMap: 530, tx: 9000, ty: -7000 },
    // (to a place on no zone's map)
    { name: 'Portal to nowhere', mapId: 0, x: -9300, y: -450, targetMap: 530, tx: -1800, ty: 5300 },
  ]);
  readonly transports = signal<GameMapTransport[]>([
    {
      entry: 1,
      name: 'Boat (The Bravery)',
      path: 7,
      faction: 11,
      description: 'Elwynn and Somewhere (Boat, Alliance ("The Bravery"))',
      speed: 30,
      accel: 1,
    },
    { entry: 2, name: 'Zeppelin', path: 8, faction: 0 },
    { entry: 6, name: 'Boat (The Neutral)', path: 9, faction: 0 },
    { entry: 3, name: 'Tram', path: 9, faction: 0 },
    { entry: 4, name: 'Lost', path: 99, faction: 0 },
    // (no stops at all)
    { entry: 7, name: 'Zeppelin (circling)', path: 10, faction: 0 },
    { entry: 5, name: "Orgrim's Hammer", path: 9, faction: 0, description: 'Icecrown (Gunship, Horde ("Orgrim\'s Hammer"))' },
  ]);
  readonly maps = signal<WowMap[]>([
    { id: 0, directory: 'Azeroth', name: 'Eastern Kingdoms', instanceType: 0 },
    { id: 36, directory: 'DeadminesInstance', name: 'Deadmines', instanceType: 1 },
    { id: 530, directory: 'Expansion01', name: 'Outland', instanceType: 0, expansion: 1 },
    { id: 533, directory: 'Stratholme Raid', name: 'Naxxramas', instanceType: 2, expansion: 2 },
    { id: 603, directory: 'UlduarRaid', name: 'Ulduar', instanceType: 2 },
  ]);
  readonly regions: WorldBounds[] = [];
  /** Creatures in Goldshire (levels 5-7), a friendly one, and one outside Elwynn's outline; none elsewhere. */
  readonly spawns: GameMapSpawnLevel[] = [
    ...[5, 6, 7, 6].map((level) => ({ x: -9000, y: -250, minLevel: level, maxLevel: level, faction: 14 })),
    { x: -9000, y: -250, minLevel: 60, maxLevel: 60, faction: 11 },
    { x: -9900, y: -1900, minLevel: 60, maxLevel: 60, faction: 14 },
  ];
  spawnLevels?: (mapId: number, bounds: WorldBounds) => Promise<GameMapSpawnLevel[]> = vi.fn((mapId: number, bounds: WorldBounds) =>
    bounds.minX === -10000 ? Promise.resolve(this.spawns) : Promise.reject(new Error(`no creatures on ${mapId}`)),
  );
  closes = 0;
}

class Page extends PageObjectModel<HostComponent> {
  byId<T extends HTMLElement = HTMLElement>(id: string, assert = true): DebugHtmlElement<T> {
    return this.getDebugElementByTestId(id, assert);
  }
  viewport(): HTMLElement {
    return this.byId('game-map-viewport').nativeElement;
  }
  title(): string {
    return this.byId('game-map-title').nativeElement.textContent?.trim() ?? '';
  }
  pointer(type: string, x: number, y: number, init: PointerEventInit = {}): void {
    this.viewport().dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true, ...init }));
    this.fixture.detectChanges();
  }
  hoverAt(x: number, y: number): void {
    this.pointer('pointermove', x, y);
  }
  clickAt(x: number, y: number, init: PointerEventInit = {}): void {
    this.hoverAt(x, y);
    this.pointer('pointerdown', x, y, init);
    this.pointer('pointerup', x, y, init);
  }
  rightClickAt(x: number, y: number): void {
    this.hoverAt(x, y);
    this.viewport().dispatchEvent(new MouseEvent('contextmenu', { clientX: x, clientY: y, bubbles: true, cancelable: true }));
    this.fixture.detectChanges();
  }
  click(id: string): void {
    this.byId(id).nativeElement.click();
    this.fixture.detectChanges();
  }
  tooltip(id = 'game-map-tooltip'): string {
    return [...this.byId(id).nativeElement.children].map((line) => line.textContent?.trim()).join(' ');
  }
  stage(): HTMLElement {
    return this.byId('game-map-stage').nativeElement;
  }
}

const bounds = (minX: number, maxX: number, minY: number, maxY: number) => ({ minX, maxX, minY, maxY });
const area = (id: number, mapId: number, areaId: number, folder: string, b = bounds(0, 0, 0, 0), parent = 0, defaultFloor = 0) => ({
  id,
  mapId,
  areaId,
  folder,
  bounds: b,
  parent,
  defaultFloor,
});

const data = (): GameMapData => ({
  areas: [
    area(14, 0, 0, 'Azeroth', bounds(-16000, 12000, -22000, 18000)),
    area(466, 530, 0, 'Expansion01', bounds(-6000, 6000, -4500, 13000)),
    area(301, 0, 1519, 'Stormwind', bounds(-8900, -8100, 600, 1400)),
    area(30, 0, 12, 'Elwynn', bounds(-10000, -8000, -2000, 1500)),
    area(31, 0, 40, 'Westfall', bounds(-12000, -9000, -3000, 0)),
    area(32, 0, 10, 'Duskwood', bounds(-11500, -10500, -2000, 1000)),
    area(36, 0, 44, 'Redridge', bounds(-10500, -9500, -4000, -2500)),
    area(1001, 0, 6001, 'Fargodeepmine1_', bounds(-9860, -9700, 42, 282), 30),
    area(462, 530, 3430, 'EversongWoods', bounds(7700, 11000, -9400, -4500)),
    area(535, 533, 3456, 'Naxxramas', bounds(2300, 3600, -4400, -2500), 30),
    area(529, 603, 4273, 'Ulduar', bounds(-1000, 1200, -1700, 1600), 0, -1),
    area(501, 0, 4197, 'LakeWintergrasp', bounds(0, 1000, 0, 1000)),
  ],
  overlays: [
    {
      mapAreaId: 30,
      areaIds: [87],
      texture: 'Goldshire',
      width: 10,
      height: 10,
      x: 0,
      y: 0,
      hit: { left: 0, top: 0, right: 0, bottom: 0 },
    },
    {
      mapAreaId: 30,
      areaIds: [88],
      texture: 'Northshire',
      width: 10,
      height: 10,
      x: 0,
      y: 0,
      hit: { left: 0, top: 0, right: 0, bottom: 0 },
    },
  ],
  floors: [
    { id: 56, mapId: 533, floor: 1, bounds: bounds(2886, 3615, -3734, -2640), parent: 0 },
    { id: 57, mapId: 533, floor: 2, bounds: bounds(2886, 3615, -3734, -2640), parent: 0 },
    { id: 69, mapId: 603, floor: 1, bounds: bounds(1400, 1800, -450, 220), parent: 0 },
  ],
  transforms: [
    { mapId: 530, region: bounds(4800, 16000, -10000, -2600), newMapId: 0, offsetX: -2400, offsetY: 2400 },
    // (a corner of the Eastern Kingdoms drawn on Outland: not on the Eastern Kingdoms' own map)
    { mapId: 0, region: bounds(15000, 15001, 15000, 15001), newMapId: 530, offsetX: 0, offsetY: 0 },
  ],
  zones: new Map([
    [12, { name: 'Elwynn Forest', flags: 64, levels: [1, 10] as [number, number], faction: 1 }],
    [1519, { name: 'Stormwind City', flags: 0x100 | 0x800, faction: 1 }],
    [10, { name: 'Duskwood', flags: 0, levels: [18, 30] as [number, number], faction: 0 }],
    [44, { name: 'Redridge Mountains', flags: 0 }],
    [40, { name: 'Westfall', flags: 64, levels: [10, 20] as [number, number], faction: 0 }],
    [3430, { name: 'Eversong Woods', flags: 0, faction: -1 }],
    [87, { name: 'Goldshire', flags: 0 }],
    [88, { name: 'Northshire', flags: 0x100 }],
    [6001, { name: 'Fargodeep Mine', flags: 0 }],
    [3456, { name: 'Naxxramas', flags: 0 }],
  ]),
});

const square = (x0: number, y0: number, x1: number, y1: number): Ring => [x0, y0, x1, y0, x1, y1, x0, y1];
/** The outlines of the pages with regions (percent of their pictures), by the page each opens. */
const outlines: Record<string, [string, Ring[]][]> = {
  'area:14': [
    ['area:30', [square(43, 72, 48, 78)]],
    // (inside Elwynn, where Elwynn's shield goes)
    ['area:301', [square(44, 74, 46, 76)]],
    ['area:32', [square(43, 78.5, 49, 85)]],
    ['area:36', [square(48.5, 76, 55, 81)]],
    ['area:462', [square(54, 15, 59, 21)]],
    ['area:501', [square(70, 40, 75, 45)]],
    // a region whose page the client doesn't have
    ['area:999', [square(60, 60, 65, 65)]],
  ],
  world: [['area:14', [square(80, 10, 98, 90)]]],
  cosmic: [
    ['world', [square(65, 40, 90, 88)]],
    ['outland', [square(20, 10, 42, 58)]],
  ],
};
/** Elwynn's sub-zones (Goldshire in the middle, Northshire top left, Stormwind, which has its own map) and neighbours. */
const elwynnSubzones: [string, Ring[]][] = [
  ['87', [square(40, 45, 60, 60)]],
  ['88', [square(3, 9, 14, 21)]],
  ['1519', [square(10, 22, 25, 35)]],
];
const elwynnNeighbours: [string, Ring[]][] = [
  // (its chip would sit on Stormwind's)
  ['area:31', [square(26, 24, 30, 34)]],
  ['area:998', [square(80, 80, 90, 90)]],
];

describe(GameMapComponent.name, () => {
  const lit = { width: 4, height: 4, data: new Uint8Array(64).fill(40) };
  const icon = { width: 1, height: 1, data: new Uint8Array(4).fill(255) };
  const pictureOf = () => ({ image: { width: 2, height: 2, data: new Uint8Array(16).fill(100) } });
  const client = {
    getGameMap: vi.fn(),
    getGameMapPicture: vi.fn(),
    getGameMapOutlines: vi.fn(),
    getGameMapSubzones: vi.fn(),
    getGameMapNeighbours: vi.fn(),
    getTexture: vi.fn(),
    getFactions: vi.fn(),
    getAreaTriggers: vi.fn(),
    getTaxiPathNodes: vi.fn(),
    getMinimap: vi.fn(),
  };
  const clipboard = { writeText: vi.fn() };

  beforeEach(async () => {
    localStorage.clear();
    // the picture is drawn at its own size: pixels on screen are pixels of the map
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 1002, 668));
    Object.defineProperty(navigator, 'clipboard', { value: clipboard, configurable: true });
    clipboard.writeText.mockReset().mockResolvedValue(undefined);
    client.getGameMap.mockReset().mockResolvedValue(data());
    client.getGameMapPicture
      .mockReset()
      .mockImplementation((page: { prefix: string }) =>
        page.prefix.startsWith('Westfall')
          ? Promise.resolve(undefined)
          : page.prefix.startsWith('Expansion')
            ? Promise.reject(new Error('bad'))
            : Promise.resolve(pictureOf()),
      );
    client.getTexture
      .mockReset()
      .mockImplementation((path: string) =>
        path.includes('POIIcons')
          ? Promise.resolve({ width: 256, height: 256, data: new Uint8Array(256 * 256 * 4).fill(200) })
          : path.includes('Tracking') || path.includes('Icons')
            ? Promise.resolve(path.includes('Banker') ? undefined : icon)
            : Promise.resolve(lit),
      );
    client.getGameMapOutlines.mockReset().mockImplementation((page: { key: string }) => Promise.resolve(new Map(outlines[page.key] ?? [])));
    client.getGameMapSubzones
      .mockReset()
      .mockImplementation((page: { key: string }) =>
        page.key === 'area:31' ? Promise.reject(new Error('bad')) : Promise.resolve(new Map(page.key === 'area:30' ? elwynnSubzones : [])),
      );
    client.getGameMapNeighbours
      .mockReset()
      .mockImplementation((page: { key: string }) => Promise.resolve(new Map(page.key === 'area:30' ? elwynnNeighbours : [])));
    client.getFactions.mockReset().mockResolvedValue({
      templates: new Map([
        [11, { id: 11, faction: 1, flags: 0, ourMask: 2, friendMask: 0, enemyMask: 4, enemies: [], friends: [] }],
        [12, { id: 12, faction: 2, flags: 0, ourMask: 4, friendMask: 0, enemyMask: 2, enemies: [], friends: [] }],
      ]),
      factions: new Map(),
    });
    client.getAreaTriggers
      .mockReset()
      .mockImplementation((mapId: number) =>
        mapId === 0
          ? Promise.resolve([100, 101, 102, 103, 104].map((id) => ({ id, mapId: 0, x: -9500 + id, y: 500, z: 1, radius: 5 })))
          : Promise.reject(new Error('no dbc')),
      );
    const node = (x: number, y: number, delay = 0) => ({ mapId: 0, x, y, z: 0, flags: 0, delay });
    client.getTaxiPathNodes.mockReset().mockResolvedValue(
      new Map([
        // the boat waits at two docks, and goes off the picture between them
        [7, [node(-9000, 0, 30), node(-9500, 0), node(0, 0), node(-8500, 0, 60), node(-8600, 0)]],
        [8, [node(-9000, 0)]],
        // (its stops off the picture)
        [9, [node(-9000, 0), node(-9100, 0), node(0, 0, 10), node(100, 0, 10)]],
        [10, [node(-9200, 0), node(-9250, 0)]],
      ]),
    );
    client.getMinimap
      .mockReset()
      .mockImplementation((directory: string, tile: { tx: number; ty: number }) =>
        tile.tx === 31 && tile.ty === 48
          ? Promise.reject(new Error('bad'))
          : Promise.resolve(directory === 'Expansion01' || (tile.tx === 32 && tile.ty === 48) ? icon : undefined),
      );
    await TestBed.configureTestingModule({
      imports: [HostComponent, TranslateTestingModule],
      providers: [{ provide: WowClientService, useValue: client }],
    }).compileComponents();
  });
  afterEach(() => vi.restoreAllMocks());

  const settle = async (page: Page) => {
    for (let i = 0; i < 6; i++) {
      page.fixture.detectChanges();
      await page.fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve));
    }
    page.fixture.detectChanges();
  };
  const setup = async (change?: (host: HostComponent) => void) => {
    const fixture = TestBed.createComponent(HostComponent);
    change?.(fixture.componentInstance);
    const page = new Page(fixture);
    fixture.detectChanges();
    expect(page.byId('game-map-loading')).toBeTruthy();
    await settle(page);
    return { page, host: fixture.componentInstance };
  };

  it('opens the zone the camera is in, with its sub-zones, neighbours, markers and coordinates', async () => {
    const { page, host } = await setup();
    expect(page.title()).toBe('Elwynn Forest');
    expect(page.byId('game-map-image')).toBeTruthy();
    // Westfall, a neighbour, dotted (not a neighbour whose page the client doesn't have); the sub-zones outlined,
    // Stormwind (it has its own map) like a neighbour
    expect(page.byId('game-map-shape-area:31').nativeElement.getAttribute('class')).toBe('neighbour');
    expect(page.byId('game-map-shape-area:998', false)).toBeFalsy();
    expect(page.byId('game-map-sub-87').nativeElement.getAttribute('class')).toBe('sub');
    expect(page.byId('game-map-sub-1519').nativeElement.getAttribute('class')).toBe('sub link');
    expect(client.getGameMapPicture.mock.calls[0][1]).toHaveLength(2);
    expect(page.byId('game-map-camera-pin').nativeElement.style.left).toBe('50%');
    // markers of the kinds shown: flight masters with their icon and badges, spirit healers (AoWoW's icon); no spawns
    expect(page.byId('game-map-pin-creature:1', false)).toBeFalsy();
    expect(page.byId('game-map-pin-poi:0').nativeElement.querySelector('img')).toBeTruthy();
    expect(page.byId('game-map-side-poi:0').nativeElement.querySelectorAll('img')).toHaveLength(1);
    expect(page.byId('game-map-pin-poi:1').nativeElement.querySelector('img').getAttribute('src')).toBe('assets/img/map/poi/sh.png');
    // three flight masters on one spot: one marker; only the zone's own markers
    expect(page.byId('game-map-more-poi:0').nativeElement.textContent?.trim()).toBe('3');
    page.click('game-map-layer-camera');
    page.click('game-map-layer-camera');
    expect(page.byId('game-map-more-poi:0').nativeElement.textContent?.trim()).toBe('3');
    expect(page.byId('game-map-pin-poi:7', false)).toBeFalsy();
    expect(page.byId('game-map-pin-poi:9', false)).toBeFalsy();
    expect(page.byId('game-map-pin-poi:10', false)).toBeFalsy();
    expect(page.byId('game-map-pin-poi:11')).toBeTruthy();
    // (a meeting stone: no badges)
    expect(page.byId('game-map-pin-poi:13')).toBeTruthy();
    expect(page.byId('game-map-side-poi:13', false)).toBeFalsy();
    expect(page.byId('game-map-pin-poi:2', false)).toBeFalsy();
    expect(page.byId('game-map-pin-poi:5', false)).toBeFalsy();
    expect(page.byId('game-map-pin-poi:6').nativeElement.querySelector('img')).toBeTruthy();
    // instance entrances (one per instance) with AoWoW's icons, the raid's opening its map
    expect(page.byId('game-map-pin-entrance:raid:533').nativeElement.querySelector('img').getAttribute('src')).toBe(
      'assets/img/map/poi/rd.png',
    );
    expect(page.byId('game-map-pin-entrance:dungeon:36')).toBeTruthy();
    // a crossing and a portal object to Eversong Woods (not the others)
    expect(page.byId('game-map-pin-portal:t104')).toBeTruthy();
    expect(page.byId('game-map-pin-portal:o0')).toBeTruthy();
    expect(page.fixture.nativeElement.querySelectorAll('[data-testid^="game-map-pin-portal:"]')).toHaveLength(2);
    // the boat's route, in its runs on the picture; a route of one point isn't drawn
    expect(page.byId('game-map-route:1')).toBeTruthy();
    // its icon (an Alliance anchor) where each run starts
    expect(page.byId('game-map-pin-transport:1:0').nativeElement.querySelector('img').getAttribute('src')).toBe(
      'assets/img/map/poi/boat-a.png',
    );
    expect(page.byId('game-map-pin-transport:3:0').nativeElement.querySelector('i.fa-train')).toBeTruthy();
    expect(page.byId('game-map-pin-transport:5:0').nativeElement.querySelector('img').getAttribute('src')).toBe(
      'assets/img/map/poi/zep-h.png',
    );
    expect(page.byId('game-map-pin-transport:6:0').nativeElement.querySelector('img').getAttribute('src')).toBe(
      'assets/img/map/poi/boat-n.png',
    );
    expect(page.byId('game-map-route:5').nativeElement.getAttribute('class')).toBe('side-h');
    expect(page.byId('game-map-pin-transport:7:0').nativeElement.querySelector('img').getAttribute('src')).toBe(
      'assets/img/map/poi/zep-n.png',
    );
    expect(page.byId('game-map-side-poi:1')).toBeTruthy();
    expect(page.byId('game-map-route:2', false)).toBeFalsy();
    expect(page.byId('game-map-route:3').nativeElement.getAttribute('class')).toBe('side-n');
    expect(page.byId('game-map-route:1').nativeElement.getAttribute('class')).toBe('side-a');
    expect(page.byId('game-map-route:1-no').nativeElement.textContent?.trim()).toBe('1');
    // a dock at each of its stops
    expect(page.byId('game-map-pin-transport:1:1')).toBeTruthy();
    // on its line: what it is, where it goes, how long it takes
    page.hoverAt(429, 420);
    expect(page.byId('game-map-route:1').nativeElement.getAttribute('class')).toBe('side-a hl');
    expect(page.tooltip()).toBe(
      '1 · The Bravery WORLD_EDITOR.GAME_MAP_BOATS Elwynn ↔ Somewhere WORLD_EDITOR.GAME_MAP_ARROWS ' +
        'WORLD_EDITOR.GAME_MAP_WAIT_TIME WORLD_EDITOR.GAME_MAP_ONE_WAY WORLD_EDITOR.GAME_MAP_TWO_WAY',
    );
    // Stormwind (a city with its map) and Westfall (a neighbour) have chips that open them, kept apart; Duskwood, a
    // neighbour not shown, one at the edge facing it
    const stormwind = page.byId('game-map-chip-area:301').nativeElement;
    const westfall = page.byId('game-map-chip-area:31').nativeElement;
    expect(stormwind.textContent).toContain('Stormwind City');
    expect(westfall.textContent).toContain('10–20');
    expect(stormwind.style.top).not.toBe(westfall.style.top);
    expect(page.byId('game-map-chip-area:32').nativeElement.classList).toContain('edge');
    expect(page.byId('game-map-chip-area:32').nativeElement.textContent).toContain('˅');
    expect(page.byId('game-map-chip-area:998', false)).toBeFalsy();

    // sub-zones and the coordinates as the game says them, with the ids
    page.hoverAt(501, 334);
    expect(page.tooltip()).toBe(
      'Goldshire WORLD_EDITOR.GAME_MAP_LEVELS Elwynn Forest WORLD_EDITOR.GAME_MAP_MAP_ID WORLD_EDITOR.GAME_MAP_ZONE_ID WORLD_EDITOR.GAME_MAP_AREA_ID',
    );
    expect(page.byId('game-map-sub-87').nativeElement.getAttribute('class')).toBe('sub hover');
    expect(page.byId('game-map-coords').nativeElement.textContent?.trim()).toBe('(50.0, 50.0)');
    // (a city among them)
    page.hoverAt(100, 100);
    expect(page.tooltip()).toContain('Northshire WORLD_EDITOR.GAME_MAP_CITY Elwynn Forest');
    page.hoverAt(980, 600);
    expect(page.byId('game-map-tooltip', false)).toBeFalsy();
    expect(page.byId('game-map-coords').nativeElement.textContent?.trim()).toBe('(97.8, 89.8)');
    // a click on the zone itself does nothing
    page.clickAt(501, 334);
    expect(page.title()).toBe('Elwynn Forest');

    // a marker says what it is; an entrance opens its instance's map, a portal where it leads
    const pin = page.byId('game-map-pin-poi:0').nativeElement;
    pin.dispatchEvent(new PointerEvent('pointerenter', { clientX: 10, clientY: 10 }));
    page.fixture.detectChanges();
    expect(page.tooltip('game-map-pin-tooltip')).toBe(
      'Thor <Gryphon Master> WORLD_EDITOR.POI_FLIGHT WORLD_EDITOR.GAME_MAP_MORE WORLD_EDITOR.GAME_MAP_ALLIANCE',
    );
    expect(page.byId('game-map-tooltip', false)).toBeFalsy();
    pin.click();
    pin.dispatchEvent(new PointerEvent('pointerleave'));
    page.fixture.detectChanges();
    expect(page.byId('game-map-pin-tooltip', false)).toBeFalsy();
    page.byId('game-map-pin-transport:1:0').nativeElement.dispatchEvent(new PointerEvent('pointerenter'));
    page.fixture.detectChanges();
    expect(page.tooltip('game-map-pin-tooltip')).toContain('WORLD_EDITOR.GAME_MAP_TRANSPORT_ID');
    page.click('game-map-pin-entrance:raid:533');
    expect(page.title()).toBe('Naxxramas – WORLD_EDITOR.GAME_MAP_FLOOR');
    page.click('game-map-back');
    page.click('game-map-pin-entrance:dungeon:36');
    expect(page.title()).toBe('Elwynn Forest');
    page.click('game-map-pin-portal:t104');
    expect(page.title()).toBe('Eversong Woods');
    expect(page.byId('game-map-title-exp').nativeElement.getAttribute('src')).toBe('assets/img/map/poi/exp-bc.gif');
    page.click('game-map-camera');

    page.click('game-map-load-zone');
    expect(host.regions).toEqual([bounds(-10000, -8000, -2000, 1500)]);
    page.click('game-map-close');
    expect(host.closes).toBe(1);
  });

  it('opens a neighbouring zone or a city with a click on it, and the maps inside a zone from its menu', async () => {
    const { page } = await setup();
    // Stormwind on Elwynn's picture: a city with its own map
    page.hoverAt(143, 167);
    expect(page.tooltip()).toBe(
      'Stormwind City WORLD_EDITOR.GAME_MAP_CITY WORLD_EDITOR.GAME_MAP_SANCTUARY Elwynn Forest · WORLD_EDITOR.GAME_MAP_CLICK_OPENS ' +
        'WORLD_EDITOR.GAME_MAP_MAP_ID WORLD_EDITOR.GAME_MAP_ZONE_ID',
    );
    expect(page.byId('game-map-sub-1519').nativeElement.getAttribute('class')).toBe('sub link hover');
    expect(page.byId('game-map-chip-area:301').nativeElement.classList).toContain('hover');
    expect(page.viewport().classList).toContain('pointer');
    page.clickAt(143, 167);
    expect(page.title()).toBe('Stormwind City');
    await settle(page);
    // a city's picture shows everything on it
    expect(page.byId('game-map-pin-poi:9')).toBeTruthy();
    page.click('game-map-camera');
    await settle(page);
    page.click('game-map-chip-area:301');
    expect(page.title()).toBe('Stormwind City');
    page.click('game-map-camera');
    await settle(page);
    // a neighbour
    page.hoverAt(281, 194);
    expect(page.tooltip()).toContain('Westfall WORLD_EDITOR.GAME_MAP_LEVELS WORLD_EDITOR.GAME_MAP_HORDE WORLD_EDITOR.GAME_MAP_OTHER_AREA');
    expect(page.byId('game-map-shape-area:31').nativeElement.getAttribute('class')).toBe('neighbour hover');
    // Westfall: no picture, no outline, its sub-zones can't be traced
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    page.click('game-map-chip-area:31');
    await settle(page);
    expect(page.title()).toBe('Westfall');
    expect(page.byId('game-map-no-picture')).toBeTruthy();
    expect(warn).toHaveBeenCalledWith("[World Editor] Could not trace the world map's subzones:area:31:", expect.any(Error));

    page.click('game-map-camera');
    await settle(page);
    const inside = page.byId<HTMLSelectElement>('game-map-children').nativeElement;
    expect([...inside.options].map((o) => o.textContent?.trim())).toEqual(['WORLD_EDITOR.GAME_MAP_INSIDE', 'Fargodeep Mine', 'Naxxramas']);
    inside.value = 'area:1001';
    inside.dispatchEvent(new Event('change'));
    page.fixture.detectChanges();
    expect(page.title()).toBe('Fargodeep Mine');
    expect(page.byId('game-map-children', false)).toBeFalsy();
  });

  it("opens any map from AoWoW's menus: the continents' zones, then the instances by expansion", async () => {
    const { page } = await setup();
    page.click('game-map-nav-cosmic');
    expect(page.title()).toBe('WORLD_EDITOR.GAME_MAP_COSMIC');
    page.click('game-map-nav-world');
    expect(page.title()).toBe('WORLD_EDITOR.GAME_MAP_AZEROTH');
    page.click('game-map-menu-area:14');
    const zones = page.byId('game-map-menu-list-area:14').nativeElement;
    expect([...zones.querySelectorAll('button')].map((b) => b.textContent?.trim())).toEqual([
      'Duskwood',
      'Elwynn Forest',
      'Eversong Woods',
      'LakeWintergrasp',
      'Redridge Mountains',
      'Stormwind City',
      'Westfall',
    ]);
    expect(page.byId('game-map-menu-item-area:462').nativeElement.querySelector('img').getAttribute('src')).toBe(
      'assets/img/map/poi/exp-bc.gif',
    );
    // another menu closes it; a second click closes it too
    page.click('game-map-menu-RAIDS');
    expect(page.byId('game-map-menu-list-area:14', false)).toBeFalsy();
    // (Ulduar here without its expansion: Classic)
    expect(page.byId('game-map-menu-list-RAIDS').nativeElement.querySelectorAll('ul')).toHaveLength(2);
    page.click('game-map-menu-RAIDS');
    expect(page.byId('game-map-menu-list-RAIDS', false)).toBeFalsy();
    expect(page.byId('game-map-menu-DUNGEONS', false)).toBeFalsy();
    page.click('game-map-menu-RAIDS');
    page.click('game-map-menu-item-area:535:1');
    expect(page.title()).toBe('Naxxramas – WORLD_EDITOR.GAME_MAP_FLOOR');
    expect(page.byId('game-map-menu-list-RAIDS', false)).toBeFalsy();
    page.click('game-map-menu-area:14');
    page.click('game-map-menu-item-area:30');
    expect(page.title()).toBe('Elwynn Forest');
  });

  it('goes back to the continent, where zones light up with their levels and land, coloured by level or faction', async () => {
    const { page } = await setup();
    page.click('game-map-back');
    expect(page.title()).toBe('Eastern Kingdoms');
    await settle(page);
    expect(page.byId('game-map-load-zone', false)).toBeFalsy();
    // Eversong Woods' flight master, from Outland's map, is drawn on the Eastern Kingdoms; only travel and instances
    expect(page.byId('game-map-pin-poi:3')).toBeTruthy();
    expect(page.byId('game-map-pin-poi:4', false)).toBeFalsy();
    expect(page.byId('game-map-pin-poi:1', false)).toBeFalsy();
    expect(page.byId('game-map-pin-poi:0')).toBeTruthy();
    // no names (the picture has them); shields on the zones of a side, swords on Wintergrasp
    expect(page.fixture.nativeElement.querySelector('.game-map-chip')).toBeFalsy();
    // (not on capital cities)
    expect(page.byId('game-map-pin-relations:area:30').nativeElement.querySelector('img').getAttribute('src')).toBe(
      'assets/img/map/poi/ta.png',
    );
    expect(page.byId('game-map-pin-relations:area:301', false)).toBeFalsy();
    expect(page.byId('game-map-pin-relations:area:32').nativeElement.querySelector('img').getAttribute('src')).toBe(
      'assets/img/map/poi/th.png',
    );
    expect(page.byId('game-map-pin-relations:area:36', false)).toBeFalsy();
    expect(page.byId('game-map-pin-relations:area:462', false)).toBeFalsy();
    const swords = page.byId('game-map-pin-pvp:area:501').nativeElement;
    swords.dispatchEvent(new PointerEvent('pointerenter', { clientX: 10, clientY: 10 }));
    page.fixture.detectChanges();
    expect(page.tooltip('game-map-pin-tooltip')).toBe('LakeWintergrasp WORLD_EDITOR.GAME_MAP_WORLD_PVP WORLD_EDITOR.GAME_MAP_OPEN_MAP');
    swords.dispatchEvent(new PointerEvent('pointerleave'));
    page.hoverAt(457, 501);
    expect(page.fixture.nativeElement.querySelector('.game-map-shapes').classList).toContain('colored');
    expect(page.byId('game-map-shape-area:30').nativeElement.getAttribute('class')).toBe('zone hover');
    expect(page.byId('game-map-shape-area:30').nativeElement.style.getPropertyValue('--c')).toBe('rgb(47, 158, 68)');
    expect(page.byId('game-map-shape-area:36').nativeElement.getAttribute('class')).toBe('plain');
    expect(page.byId('game-map-shape-area:999', false)).toBeFalsy();
    const ids = 'WORLD_EDITOR.GAME_MAP_MAP_ID WORLD_EDITOR.GAME_MAP_ZONE_ID';
    expect(page.tooltip()).toBe(
      `Elwynn Forest WORLD_EDITOR.GAME_MAP_LEVELS WORLD_EDITOR.GAME_MAP_ALLIANCE WORLD_EDITOR.GAME_MAP_CLICK_OPENS ${ids}`,
    );
    page.hoverAt(463, 549);
    expect(page.tooltip()).toBe(
      `Duskwood WORLD_EDITOR.GAME_MAP_LEVELS WORLD_EDITOR.GAME_MAP_HORDE WORLD_EDITOR.GAME_MAP_CLICK_OPENS ${ids}`,
    );
    page.hoverAt(532, 525);
    expect(page.tooltip()).toBe(`Redridge Mountains WORLD_EDITOR.GAME_MAP_CLICK_OPENS ${ids}`);
    page.hoverAt(565, 120);
    expect(page.tooltip()).toBe(`Eversong Woods WORLD_EDITOR.GAME_MAP_CONTESTED WORLD_EDITOR.GAME_MAP_CLICK_OPENS ${ids}`);
    // a region whose page the client doesn't have: nothing
    page.hoverAt(621, 414);
    expect(page.byId('game-map-tooltip', false)).toBeFalsy();
    // Westfall has no outline: nothing there; a click there does nothing; no .go command for it
    page.hoverAt(515, 560);
    expect(page.byId('game-map-tooltip', false)).toBeFalsy();
    page.clickAt(515, 560);
    expect(page.title()).toBe('Eastern Kingdoms');
    page.rightClickAt(515, 560);
    expect(page.byId('game-map-toast').nativeElement.classList).toContain('error');
    // a right click on a zone: .go zonexy in that zone's coordinates (the smallest: a city in its zone)
    page.rightClickAt(457, 501);
    await settle(page);
    expect(clipboard.writeText).toHaveBeenLastCalledWith(expect.stringMatching(/^\.go zonexy \d+\.\d\d \d+\.\d\d 1519$/));
    page.rightClickAt(440, 492);
    await settle(page);
    expect(clipboard.writeText).toHaveBeenLastCalledWith(expect.stringMatching(/^\.go zonexy \d+\.\d\d \d+\.\d\d 12$/));
    page.hoverAt(515, 560);

    // faction territory instead of levels (they don't mix), then neither, nor borders
    expect(page.stage().classList).toContain('borders');
    page.click('game-map-layer-territory');
    expect(page.byId<HTMLInputElement>('game-map-layer-levels').nativeElement.checked).toBe(false);
    expect(page.byId('game-map-bands', false)).toBeFalsy();
    expect(page.byId('game-map-shape-area:30').nativeElement.style.getPropertyValue('--c')).toBe('rgb(60, 120, 230)');
    page.click('game-map-layer-levels');
    expect(page.byId<HTMLInputElement>('game-map-layer-territory').nativeElement.checked).toBe(false);
    expect(page.byId('game-map-bands')).toBeTruthy();
    page.click('game-map-layer-levels');
    expect(page.byId('game-map-shape-area:30').nativeElement.getAttribute('class')).toBe('plain');
    expect(page.fixture.nativeElement.querySelector('.game-map-shapes').classList).not.toContain('colored');
    page.click('game-map-layer-borders');
    expect(page.stage().classList).not.toContain('borders');

    page.hoverAt(457, 501);
    page.clickAt(457, 501);
    expect(page.title()).toBe('Elwynn Forest');
  });

  it('goes up to the world and cosmic maps, whose continents and worlds light up', async () => {
    const { page } = await setup();
    page.click('game-map-back');
    page.click('game-map-back');
    expect(page.title()).toBe('WORLD_EDITOR.GAME_MAP_AZEROTH');
    await settle(page);
    // the Eastern Kingdoms on the right
    page.hoverAt(900, 300);
    expect(page.tooltip()).toBe(
      'Eastern Kingdoms WORLD_EDITOR.GAME_MAP_LEVELS WORLD_EDITOR.GAME_MAP_CLICK_OPENS WORLD_EDITOR.GAME_MAP_MAP_ID',
    );
    page.click('game-map-back');
    expect(page.title()).toBe('WORLD_EDITOR.GAME_MAP_COSMIC');
    await settle(page);
    expect(page.byId('game-map-back', false)).toBeFalsy();
    expect(page.byId('game-map-coords', false)).toBeFalsy();
    // Azeroth (the world map) and Outland, both open
    page.hoverAt(777, 425);
    expect(page.byId('game-map-shape-world').nativeElement.getAttribute('class')).toBe('plain hover');
    expect(page.tooltip()).toBe('WORLD_EDITOR.GAME_MAP_AZEROTH WORLD_EDITOR.GAME_MAP_LEVELS WORLD_EDITOR.GAME_MAP_CLICK_OPENS');
    page.hoverAt(309, 228);
    expect(page.byId('game-map-shape-outland').nativeElement.getAttribute('class')).toBe('plain hover');
    // in the circle's square, out of the circle
    page.hoverAt(148, 67);
    expect(page.byId('game-map-tooltip', false)).toBeFalsy();
    // no .go command on the cosmic map; the note goes after a while
    vi.useFakeTimers();
    page.rightClickAt(148, 67);
    expect(page.byId('game-map-toast').nativeElement.textContent?.trim()).toBe('WORLD_EDITOR.GAME_MAP_NO_GO');
    vi.advanceTimersByTime(3000);
    page.fixture.detectChanges();
    expect(page.byId('game-map-toast', false)).toBeFalsy();
    vi.useRealTimers();
    // Outland: its picture can't be read
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    page.clickAt(309, 228);
    await settle(page);
    expect(page.byId('game-map-no-picture')).toBeTruthy();
    page.click('game-map-camera');
    expect(page.title()).toBe('Elwynn Forest');
  });

  it('zooms with the wheel and the buttons, pans by dragging (not a click then), and copies .go commands', async () => {
    const { page } = await setup();
    page.viewport().dispatchEvent(new WheelEvent('wheel', { clientX: 701, clientY: 334, deltaY: -100, bubbles: true, cancelable: true }));
    page.fixture.detectChanges();
    expect(page.stage().style.getPropertyValue('--zoom')).toBe('1.25');
    expect(page.stage().style.transform).toBe('translate(calc(-50% + -50px), calc(-50% + 0px))');
    page.click('game-map-zoom-in');
    expect(page.stage().style.getPropertyValue('--zoom')).toBe('1.5625');
    page.click('game-map-zoom-out');
    page.click('game-map-zoom-out');
    expect(page.stage().style.getPropertyValue('--zoom')).toBe('1');
    expect(page.stage().style.transform).toBe('translate(calc(-50% + 0px), calc(-50% + 0px))');
    page.viewport().dispatchEvent(new WheelEvent('wheel', { clientX: 501, clientY: 334, deltaY: 100, bubbles: true, cancelable: true }));
    page.fixture.detectChanges();
    expect(page.stage().style.getPropertyValue('--zoom')).toBe('1');
    page.click('game-map-zoom-in');
    page.click('game-map-zoom-reset');
    expect(page.stage().style.getPropertyValue('--zoom')).toBe('1');

    // a drag over Stormwind moves the map and doesn't open it
    page.hoverAt(143, 167);
    page.pointer('pointerdown', 143, 167);
    page.pointer('pointermove', 145, 168);
    expect(page.stage().style.transform).toBe('translate(calc(-50% + 0px), calc(-50% + 0px))');
    page.pointer('pointermove', 193, 177);
    page.pointer('pointerup', 193, 177);
    expect(page.stage().style.transform).toBe('translate(calc(-50% + 50px), calc(-50% + 10px))');
    expect(page.title()).toBe('Elwynn Forest');
    page.pointer('pointerup', 193, 177);
    page.pointer('pointerdown', 10, 10, { button: 2 });
    page.pointer('pointerup', 10, 10);
    page.pointer('pointerdown', 10, 10);
    page.viewport().dispatchEvent(new PointerEvent('pointerleave'));
    page.pointer('pointerup', 10, 10);

    // a right click (or Alt + click): .go zonexy on a zone, .go xyz on a floor
    page.rightClickAt(501, 334);
    await settle(page);
    expect(clipboard.writeText).toHaveBeenCalledWith('.go zonexy 50.00 50.00 12');
    expect(page.byId('game-map-copied').nativeElement.textContent).toContain('.go zonexy 50.00 50.00 12');
    expect(page.byId('game-map-toast').nativeElement.textContent?.trim()).toBe('WORLD_EDITOR.GAME_MAP_COPIED');
    page.clickAt(100, 100, { altKey: true });
    await settle(page);
    expect(clipboard.writeText).toHaveBeenLastCalledWith('.go zonexy 9.98 14.97 12');
    expect(page.title()).toBe('Elwynn Forest');
    page.click('game-map-pin-entrance:raid:533');
    await settle(page);
    page.rightClickAt(501, 334);
    await settle(page);
    expect(clipboard.writeText).toHaveBeenLastCalledWith(expect.stringMatching(/^\.go xyz [-\d.]+ [-\d.]+ 0\.0 533$/));
    clipboard.writeText.mockRejectedValueOnce(new Error('denied'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    page.rightClickAt(501, 334);
    await settle(page);
    expect(warn).toHaveBeenCalled();
    expect(page.byId('game-map-toast').nativeElement.textContent).toContain('.go xyz');
    // off the picture: nothing under the pointer
    page.hoverAt(2000, 2000);
    expect(page.byId('game-map-tooltip', false)).toBeFalsy();
    page.viewport().dispatchEvent(new MouseEvent('contextmenu', { clientX: 2000, clientY: 2000, bubbles: true, cancelable: true }));
    page.fixture.detectChanges();
    expect(clipboard.writeText).toHaveBeenCalledTimes(4);
    // a picture with no size yet: the pointer isn't read
    vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockReturnValue(new DOMRect(0, 0, 0, 0));
    page.hoverAt(10, 10);
    expect(page.byId('game-map-tooltip', false)).toBeFalsy();
  });

  it('shows the seamless map: zones, cities and the ground fading in as the continent is zoomed into, with every marker', async () => {
    const { page, host } = await setup();
    // (the menus open to the left when they would go past the window's edge)
    const width = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
    page.click('game-map-menu-area:14');
    await settle(page);
    expect(page.byId('game-map-menu-list-area:14').nativeElement.style.right).toBe('0px');
    Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
    page.click('game-map-menu-area:14');

    // from Elwynn Forest: the Eastern Kingdoms, showing just what Elwynn's page showed
    page.click('game-map-seamless');
    await settle(page);
    expect(page.title()).toBe('Eastern Kingdoms');
    expect(Number(page.stage().style.getPropertyValue('--zoom'))).toBeCloseTo(11.43, 1);
    expect(page.byId<HTMLInputElement>('game-map-seamless').nativeElement.checked).toBe(true);
    expect(page.fixture.nativeElement.querySelector('.game-map-shapes').classList).not.toContain('colored');
    // Elwynn's picture clipped to its outline, Stormwind's on top fading in; Duskwood off the screen
    const elwynn = page.byId('game-map-seamless-zone-area:30').nativeElement;
    expect(elwynn.getAttribute('opacity')).toBe('1');
    expect(elwynn.getAttribute('clip-path')).toMatch(/^url\(#game-map-\d+-clip-\d+\)$/);
    const stormwind = page.byId('game-map-seamless-zone-area:301').nativeElement;
    expect(Number(stormwind.getAttribute('opacity'))).toBeCloseTo(0.27, 1);
    expect(elwynn.compareDocumentPosition(stormwind) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(page.byId('game-map-seamless-zone-area:32', false)).toBeFalsy();
    // the ground's minimaps on screen (none where the client has none)
    expect(page.byId('game-map-seamless-tile-Azeroth:32_48').nativeElement.getAttribute('opacity')).toBe('1');
    expect(page.byId('game-map-seamless-tile-Azeroth:31_48', false)).toBeFalsy();
    expect(client.getMinimap).not.toHaveBeenCalledWith('Expansion01', expect.anything());
    // every marker on screen, not only travel and instances
    expect(page.byId('game-map-pin-poi:1')).toBeTruthy();
    expect(page.byId('game-map-pin-poi:3', false)).toBeFalsy();
    page.click('game-map-layer-spawns');
    expect(page.byId('game-map-pin-creature:1')).toBeTruthy();
    expect(page.byId('game-map-pin-creature:2', false)).toBeFalsy();

    // Elwynn is shown: no click to zoom, its coordinates under the pointer; Redridge, off the screen, zooms in
    page.hoverAt(440, 492);
    const ids = 'WORLD_EDITOR.GAME_MAP_MAP_ID WORLD_EDITOR.GAME_MAP_ZONE_ID';
    expect(page.tooltip()).toBe(`Elwynn Forest WORLD_EDITOR.GAME_MAP_LEVELS WORLD_EDITOR.GAME_MAP_ALLIANCE ${ids}`);
    expect(page.byId('game-map-coords').nativeElement.textContent).toMatch(/^\(Elwynn Forest \d+\.\d, \d+\.\d\)$/);
    page.clickAt(440, 492);
    expect(Number(page.stage().style.getPropertyValue('--zoom'))).toBeCloseTo(11.43, 1);
    page.hoverAt(515, 560);
    expect(page.byId('game-map-coords', false)).toBeFalsy();
    page.hoverAt(532, 525);
    expect(page.tooltip()).toBe(`Redridge Mountains WORLD_EDITOR.GAME_MAP_CLICK_ZOOMS ${ids}`);

    // the spawns of what is on screen
    expect(page.byId('game-map-load-zone').nativeElement.textContent).toContain('WORLD_EDITOR.GAME_MAP_LOAD_AREA');
    page.click('game-map-load-zone');
    const loaded = host.regions[host.regions.length - 1];
    expect(loaded.minX).toBeLessThan(-9000);
    expect(loaded.maxX).toBeGreaterThan(-9000);
    expect(loaded.minY).toBeLessThan(-250);
    expect(loaded.maxY).toBeGreaterThan(-250);

    page.clickAt(532, 525);
    expect(Number(page.stage().style.getPropertyValue('--zoom'))).toBeCloseTo(24, 1);
    // to Redridge's page and back, the same place on screen (once Redridge is big enough to have its page)
    page.viewport().dispatchEvent(new WheelEvent('wheel', { clientX: 501, clientY: 334, deltaY: -100, bubbles: true, cancelable: true }));
    page.click('game-map-seamless');
    expect(page.title()).toBe('Redridge Mountains');
    expect(Number(page.stage().style.getPropertyValue('--zoom'))).toBeCloseTo(1.125, 2);
    page.click('game-map-seamless');
    expect(page.title()).toBe('Eastern Kingdoms');
    expect(Number(page.stage().style.getPropertyValue('--zoom'))).toBeCloseTo(30, 1);
    // deeper than the pages zoom
    for (let i = 0; i < 20; i++) {
      page.viewport().dispatchEvent(new WheelEvent('wheel', { clientX: 501, clientY: 334, deltaY: -100, bubbles: true, cancelable: true }));
    }
    page.click('game-map-zoom-in');
    expect(page.stage().style.getPropertyValue('--zoom')).toBe('48');
    // a zone from the menu: zoomed to on the continent
    page.click('game-map-menu-area:14');
    page.click('game-map-menu-item-area:30');
    expect(page.byId('game-map-menu-list-area:14', false)).toBeFalsy();
    expect(Number(page.stage().style.getPropertyValue('--zoom'))).toBeCloseTo(10.29, 1);
    // the continent's own minimaps but under the zones of another map, drawn on it
    const masked = page.byId('game-map-seamless-tiles-own').nativeElement;
    expect(masked.querySelector('image')).toBeTruthy();
    expect(masked.getAttribute('mask')).toMatch(/^url\(#game-map-\d+-own\)$/);
    expect(page.fixture.nativeElement.querySelectorAll('mask path')).toHaveLength(1);
    // Eversong Woods: Outland's minimaps, only inside its outline
    page.click('game-map-menu-area:14');
    page.click('game-map-menu-item-area:462');
    await settle(page);
    const moved = page.byId('game-map-seamless-tiles-moved').nativeElement;
    expect(moved.getAttribute('clip-path')).toMatch(/^url\(#game-map-\d+-moved\)$/);
    expect(moved.querySelector('image')?.getAttribute('data-testid')).toMatch(/^game-map-seamless-tile-Expansion01:/);
    // pages that aren't zones of a continent: as ever
    page.click('game-map-nav-world');
    expect(page.byId('game-map-seamless-layer', false)).toBeFalsy();
    page.click('game-map-seamless');
    page.click('game-map-seamless');
    expect(page.title()).toBe('WORLD_EDITOR.GAME_MAP_AZEROTH');

    // off over Stormwind, too small for its page yet: the continent's page, as deep as pages zoom
    page.click('game-map-menu-area:14');
    page.click('game-map-menu-item-area:30');
    page.click('game-map-seamless');
    expect(page.title()).toBe('Eastern Kingdoms');
    expect(page.stage().style.getPropertyValue('--zoom')).toBe('10');
    // on from the whole continent: its zones too small to show yet; not before the viewport has a size
    page.click('game-map-zoom-reset');
    page.click('game-map-seamless');
    await settle(page);
    expect(page.byId('game-map-seamless-layer')).toBeTruthy();
    expect(page.byId('game-map-seamless-zone-area:30', false)).toBeFalsy();
    page.click('game-map-seamless');
    page.click('game-map-menu-area:14');
    page.click('game-map-menu-item-area:30');
    vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockReturnValue(new DOMRect(0, 0, 0, 0));
    page.click('game-map-seamless');
    await settle(page);
    expect(page.title()).toBe('Eastern Kingdoms');
    const zoom = page.stage().style.getPropertyValue('--zoom');
    page.click('game-map-menu-area:14');
    page.click('game-map-menu-item-area:36');
    expect(page.stage().style.getPropertyValue('--zoom')).toBe(zoom);
  });

  it('switches between the floors of an instance, and its own picture', async () => {
    const { page } = await setup((h) => {
      h.mapId.set(533);
      h.camera.set({ x: 3200, y: -3100, z: 1 });
      h.zoneId.set(0);
    });
    expect(page.title()).toBe('Naxxramas – WORLD_EDITOR.GAME_MAP_FLOOR');
    expect(page.byId('game-map-floor-area:535:1').nativeElement.classList).toContain('btn-warning');
    page.click('game-map-floor-area:535:2');
    expect(page.byId('game-map-floor-area:535:2').nativeElement.classList).toContain('btn-warning');
    page.hoverAt(10, 10);
    expect(page.tooltip()).toContain('Naxxramas');
    // the camera's height on its map
    page.rightClickAt(10, 10);
    await settle(page);
    expect(clipboard.writeText).toHaveBeenLastCalledWith(expect.stringMatching(/ 1\.0 533$/));
    page.click('game-map-back');
    expect(page.title()).toBe('Elwynn Forest');
  });

  it("names an instance's own picture besides its floors", async () => {
    const { page } = await setup((h) => {
      h.mapId.set(603);
      h.camera.set({ x: 1600, y: -100, z: 1 });
      // (no levels for sub-zones)
      h.spawnLevels = undefined;
    });
    expect(page.title()).toBe('Ulduar – WORLD_EDITOR.GAME_MAP_FLOOR');
    page.click('game-map-floor-area:529');
    expect(page.byId('game-map-floor-area:529').nativeElement.textContent?.trim()).toBe('WORLD_EDITOR.GAME_MAP_OUTSIDE');
    expect(page.title()).toBe('Ulduar');
    expect(page.byId('game-map-pin-poi:12')).toBeTruthy();
    // not on a continent: .go xyz
    page.rightClickAt(10, 10);
    await settle(page);
    expect(clipboard.writeText).toHaveBeenLastCalledWith(expect.stringMatching(/^\.go xyz [-\d.]+ [-\d.]+ 1\.0 603$/));
  });

  it('opens the world map without a camera, and says when the world map or the factions cannot be read', async () => {
    client.getFactions.mockRejectedValueOnce(new Error('no factions'));
    client.getTaxiPathNodes.mockRejectedValueOnce(new Error('no dbc'));
    const textures = client.getTexture.getMockImplementation() as (path: string) => Promise<unknown>;
    client.getTexture.mockImplementation((path: string) =>
      path.includes('FlightMaster') ? Promise.reject(new Error('none')) : textures(path),
    );
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { page } = await setup((h) => {
      h.camera.set(undefined);
      // (on Naxxramas; and no name for Outland)
      h.mapId.set(533);
      h.maps.set(h.maps().filter((m) => m.id !== 530));
    });
    expect(page.title()).toBe('WORLD_EDITOR.GAME_MAP_AZEROTH');
    expect(page.byId('game-map-camera-pin', false)).toBeFalsy();
    expect(warn).toHaveBeenCalledWith('[World Editor] Could not read the factions for the world map:', expect.any(Error));
    expect(warn).toHaveBeenCalledWith("[World Editor] Could not read the transports' paths for the world map:", expect.any(Error));
    page.clickAt(900, 300);
    await settle(page);
    page.clickAt(457, 501);
    await settle(page);
    expect(page.title()).toBe('Elwynn Forest');
    // (no badges without the factions; a flight master without its icon)
    expect(page.byId('game-map-side-poi:0', false)).toBeFalsy();
    expect(page.byId('game-map-pin-poi:0').nativeElement.querySelector('img')).toBeFalsy();
    // the camera's map without knowing where it is: on the ground
    page.click('game-map-pin-entrance:raid:533');
    page.rightClickAt(501, 334);
    await settle(page);
    expect(clipboard.writeText).toHaveBeenLastCalledWith(expect.stringMatching(/ 0\.0 533$/));

    client.getGameMap.mockRejectedValueOnce(new Error('no client'));
    const failed = await setup();
    expect(failed.page.byId('game-map-failed')).toBeTruthy();
    failed.page.hoverAt(10, 10);
    expect(failed.page.byId('game-map-tooltip', false)).toBeFalsy();
  });

  it('shows the layers and markers chosen, by group, kept on this computer', async () => {
    const { page } = await setup();
    page.click('game-map-panel-btn');
    expect(page.byId('game-map-panel', false)).toBeFalsy();
    page.click('game-map-panel-btn');
    expect(page.byId('game-map-panel')).toBeTruthy();
    // the 3D view's spawns, when asked
    page.click('game-map-layer-spawns');
    expect(page.byId('game-map-pin-creature:1').nativeElement.classList).toContain('dot');
    expect(page.byId('game-map-pin-creature:2', false)).toBeFalsy();
    page.byId('game-map-pin-creature:3').nativeElement.dispatchEvent(new PointerEvent('pointerenter'));
    page.fixture.detectChanges();
    expect(page.tooltip('game-map-pin-tooltip')).toBe('');
    page.click('game-map-layer-bank');
    expect(page.byId('game-map-pin-poi:2')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(GAME_MAP_LAYERS_KEY) as string).shown).toContain('bank');
    page.click('game-map-layer-camera');
    expect(page.byId('game-map-camera-pin', false)).toBeFalsy();
    page.click('game-map-layer-boat');
    expect(page.byId('game-map-route:1', false)).toBeFalsy();
    page.click('game-map-layer-raid');
    expect(page.byId('game-map-pin-entrance:raid:533', false)).toBeFalsy();
    page.click('game-map-layer-subBorders');
    expect(page.byId('game-map-sub-87', false)).toBeFalsy();
    // (cities with their map still: they open it)
    expect(page.byId('game-map-sub-1519')).toBeTruthy();
    page.click('game-map-layer-transitions');
    expect(page.byId('game-map-shape-area:31', false)).toBeFalsy();
    // (hidden neighbours still open, as on AoWoW's)
    page.hoverAt(281, 194);
    expect(page.viewport().classList).toContain('pointer');
    page.click('game-map-layer-names');
    expect(page.byId('game-map-chip-area:31', false)).toBeFalsy();
    page.click('game-map-layer-badges');
    expect(page.byId('game-map-side-poi:0', false)).toBeFalsy();
    // a group at once: all on, all off
    const townsfolk = page.byId<HTMLInputElement>('game-map-group-townsfolk').nativeElement;
    expect(townsfolk.indeterminate).toBe(true);
    page.click('game-map-group-townsfolk');
    expect(page.byId<HTMLInputElement>('game-map-layer-stable').nativeElement.checked).toBe(true);
    page.click('game-map-group-townsfolk');
    expect(page.byId('game-map-pin-poi:0', false)).toBeFalsy();
    expect(page.byId('game-map-group-townsfolk').nativeElement.parentElement?.textContent).not.toContain('/');
    // every marker on, then off (the map's own options as they are)
    page.click('game-map-all');
    expect(page.byId<HTMLInputElement>('game-map-layer-prof:171').nativeElement.checked).toBe(true);
    expect(page.byId('game-map-group-professions').nativeElement.parentElement?.textContent).toContain('14/14');
    page.click('game-map-none');
    expect(page.byId<HTMLInputElement>('game-map-layer-flight').nativeElement.checked).toBe(false);
    expect(page.byId<HTMLInputElement>('game-map-layer-spawns').nativeElement.checked).toBe(true);
    page.click('game-map-reset');
    expect(page.byId('game-map-pin-poi:0')).toBeTruthy();
    expect(page.byId<HTMLInputElement>('game-map-layer-spawns').nativeElement.checked).toBe(false);
    // the markers' size
    const size = page.byId<HTMLInputElement>('game-map-marker-size').nativeElement;
    size.value = '4';
    size.dispatchEvent(new Event('input'));
    page.fixture.detectChanges();
    expect(localStorage.getItem(GAME_MAP_MARKER_KEY)).toBe('32');
    expect((page.fixture.nativeElement.querySelector('keira-game-map') as HTMLElement).style.getPropertyValue('--marker')).toBe('32px');
  });
});
